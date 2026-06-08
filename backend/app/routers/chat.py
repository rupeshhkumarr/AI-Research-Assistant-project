import logging
import uuid
from fastapi import APIRouter, HTTPException, status, Depends, Body
from fastapi.responses import StreamingResponse
import json
from app.models.chat import ChatRequest, ChatResponse, ClearMemoryRequest
from app.models.supabase_models import User, Conversation, Message
from app.services.rag_service import generate_answer
from app.routers.auth import get_current_user
from app.database.supabase_client import supabase_client
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, current_user: User = Depends(get_current_user)):
    """
    RAG chat endpoint with conversational memory.
    Saves history to Supabase 'conversations' and 'messages' tables.
    """
    try:
        # Check if conversation exists or create new one
        conv_id = request.session_id
        if not supabase_client:
            raise HTTPException(status_code=500, detail="Supabase not configured")

        # Create new conversation if session_id is 'default' or missing, or if it's an old non-UUID format
        is_valid_uuid = True
        try:
            uuid.UUID(conv_id)
        except (ValueError, TypeError):
            is_valid_uuid = False

        if conv_id == "default" or not conv_id or not is_valid_uuid:
            # Create a new conversation
            title = request.question[:50] + "..." if len(request.question) > 50 else request.question
            conv_data = {
                "id": str(uuid.uuid4()),
                "user_id": str(current_user.id),
                "title": title
            }
            conv_res = supabase_client.table("conversations").insert(conv_data).execute()
            if not conv_res.data:
                raise HTTPException(status_code=500, detail="Failed to create conversation")
            conv_id = conv_res.data[0]["id"]
        else:
            # Verify conversation belongs to user
            verify_res = supabase_client.table("conversations").select("id").eq("id", conv_id).eq("user_id", str(current_user.id)).execute()
            if not verify_res.data:
                raise HTTPException(status_code=404, detail="Conversation not found")

        # Generate answer using RAG
        answer, sources = await generate_answer(request.question, conv_id)
        
        # Store user query in messages table
        user_msg = {
            "conversation_id": conv_id,
            "role": "user",
            "content": request.question,
            "sources": []
        }
        supabase_client.table("messages").insert(user_msg).execute()

        # Store AI response in messages table
        ai_msg = {
            "conversation_id": conv_id,
            "role": "assistant",
            "content": answer,
            "sources": sources
        }
        supabase_client.table("messages").insert(ai_msg).execute()
        
        # We need to return the conversation ID so the frontend can keep passing it.
        return ChatResponse(answer=answer, sources=sources, conversation_id=str(conv_id))
        
    except ValueError as ve:
        logger.warning(f"RAG Error: {ve}")
        if str(ve) == "No vectorstore":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No documents have been ingested yet."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.exception(f"Unexpected error during chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest, current_user: User = Depends(get_current_user)):
    """
    RAG chat endpoint with real-time SSE streaming.
    Saves history to Supabase 'conversations' and 'messages' tables on completion or abort.
    """
    try:
        conv_id = request.session_id
        if not supabase_client:
            raise HTTPException(status_code=500, detail="Supabase not configured")

        is_valid_uuid = True
        try:
            uuid.UUID(conv_id)
        except (ValueError, TypeError):
            is_valid_uuid = False

        if conv_id == "default" or not conv_id or not is_valid_uuid:
            title = request.question[:50] + "..." if len(request.question) > 50 else request.question
            conv_data = {
                "id": str(uuid.uuid4()),
                "user_id": str(current_user.id),
                "title": title
            }
            conv_res = supabase_client.table("conversations").insert(conv_data).execute()
            if not conv_res.data:
                raise HTTPException(status_code=500, detail="Failed to create conversation")
            conv_id = conv_res.data[0]["id"]
        else:
            verify_res = supabase_client.table("conversations").select("id").eq("id", conv_id).eq("user_id", str(current_user.id)).execute()
            if not verify_res.data:
                raise HTTPException(status_code=404, detail="Conversation not found")

        async def event_generator():
            full_answer = ""
            sources = []
            try:
                # Yield conversation ID first
                yield f"data: {json.dumps({'conversation_id': str(conv_id)})}\n\n"
                
                from app.services.rag_service import generate_answer_stream
                async for chunk in generate_answer_stream(request.question, conv_id):
                    if "token" in chunk:
                        full_answer += chunk['token']
                        yield f"data: {json.dumps({'token': chunk['token']})}\n\n"
                    if "full_answer" in chunk:
                        full_answer = chunk["full_answer"]
                        sources = chunk["sources"]
                        yield f"data: {json.dumps({'sources': sources})}\n\n"
            except Exception as e:
                logger.error(f"Streaming error: {e}")
                if str(e) == "No vectorstore":
                    yield f"data: {json.dumps({'error': 'No documents have been ingested yet. Please upload some documents first.'})}\n\n"
                else:
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"
            finally:
                if full_answer:
                    # Always save the partial or full message to history
                    user_msg = {
                        "conversation_id": conv_id,
                        "role": "user",
                        "content": request.question,
                        "sources": []
                    }
                    supabase_client.table("messages").insert(user_msg).execute()

                    ai_msg = {
                        "conversation_id": conv_id,
                        "role": "assistant",
                        "content": full_answer,
                        "sources": sources
                    }
                    supabase_client.table("messages").insert(ai_msg).execute()

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    except Exception as e:
        logger.exception(f"Unexpected error initializing chat stream: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/conversations", response_model=List[Conversation])
def get_conversations(current_user: User = Depends(get_current_user)):
    """Retrieve all conversations for the user."""
    if not supabase_client:
        return []
    res = supabase_client.table("conversations").select("*").eq("user_id", str(current_user.id)).order("created_at", desc=False).execute()
    return [Conversation(**conv) for conv in res.data]

@router.put("/conversations/{conversation_id}", response_model=Conversation)
def rename_conversation(conversation_id: str, title: str = Body(..., embed=True), current_user: User = Depends(get_current_user)):
    """Rename a specific conversation."""
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    res = supabase_client.table("conversations").update({"title": title}).eq("id", conversation_id).eq("user_id", str(current_user.id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Conversation not found or update failed")
    
    return Conversation(**res.data[0])

@router.get("/conversations/{conversation_id}/messages", response_model=List[Message])
def get_messages(conversation_id: str, current_user: User = Depends(get_current_user)):
    """Retrieve messages for a specific conversation."""
    if not supabase_client:
        return []
    # Using RLS, checking user_id on conversation is good practice
    res = supabase_client.table("messages").select("*, conversations!inner(user_id)").eq("conversation_id", conversation_id).eq("conversations.user_id", str(current_user.id)).order("created_at", desc=False).execute()
    
    # Strip nested conversations object before passing to model
    messages = []
    for msg in res.data:
        msg.pop("conversations", None)
        messages.append(Message(**msg))
        
    return messages

@router.delete("/conversations", status_code=status.HTTP_204_NO_CONTENT)
def clear_all_conversations(current_user: User = Depends(get_current_user)):
    """Clear all conversations in Supabase."""
    try:
        if supabase_client:
            supabase_client.table("conversations").delete().eq("user_id", str(current_user.id)).execute()
        return None
    except Exception as e:
        logger.exception(f"Error clearing conversations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while clearing conversations."
        )

@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(conversation_id: str, current_user: User = Depends(get_current_user)):
    """Clear specific conversation in Supabase."""
    try:
        if supabase_client:
            supabase_client.table("conversations").delete().eq("id", conversation_id).eq("user_id", str(current_user.id)).execute()
        return None
    except Exception as e:
        logger.exception(f"Error deleting conversation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting conversation."
        )

# For backwards compatibility during frontend transition
@router.get("/chat/history", response_model=List[Dict[str, Any]])
def get_legacy_chat_history(current_user: User = Depends(get_current_user)):
    """Retrieve all messages combined as legacy chat history format."""
    if not supabase_client:
        return []
    res = supabase_client.table("messages").select("*, conversations!inner(user_id)").eq("conversations.user_id", str(current_user.id)).order("created_at", desc=False).execute()
    
    # Format to look somewhat like old history for the frontend until it's updated
    history = []
    # Old history grouped a single user query and assistant response into one ChatHistory object.
    # We will just return the raw messages, and the frontend will need to be updated.
    for msg in res.data:
        msg.pop("conversations", None)
        history.append(msg)
        
    return history
