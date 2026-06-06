from typing import List
from fastapi import APIRouter, UploadFile, File, status, Depends, HTTPException, BackgroundTasks
from app.services.file_service import save_file, delete_document
from app.models.supabase_models import User, Document
from app.routers.auth import get_current_user
from app.database.supabase_client import supabase_client
from app.config import settings
from app.services.ingestion_service import process_and_update_document
import uuid
import os

router = APIRouter(prefix="", tags=["documents"])

@router.post("/upload", response_model=Document, status_code=status.HTTP_201_CREATED)
async def upload_file(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a document, save metadata to Supabase, and start ingestion."""
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # 1. Save file locally
    saved_path = await save_file(file)
    file_size = os.path.getsize(saved_path)

    # 2. Insert metadata into Supabase
    doc_id = str(uuid.uuid4())
    doc_data = {
        "id": doc_id,
        "user_id": str(current_user.id),
        "filename": file.filename,
        "file_path": str(saved_path),
        "chunks_count": 0,
        "file_size": file_size
    }
    
    res = supabase_client.table("documents").insert(doc_data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to save document metadata")
    
    document = Document(**res.data[0])

    # 3. Process asynchronously
    background_tasks.add_task(process_and_update_document, doc_id, str(saved_path))
    
    return document

@router.get("/documents", response_model=List[Document])
def get_documents(current_user: User = Depends(get_current_user)):
    """Return list of uploaded documents for the current user from Supabase."""
    if not supabase_client:
        return []
    res = supabase_client.table("documents").select("*").eq("user_id", str(current_user.id)).execute()
    return [Document(**doc) for doc in res.data]

@router.get("/documents/{document_id}", response_model=Document)
def get_document(document_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific document."""
    res = supabase_client.table("documents").select("*").eq("id", document_id).eq("user_id", str(current_user.id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")
    return Document(**res.data[0])

@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(document_id: str, current_user: User = Depends(get_current_user)):
    """Delete a document by ID."""
    # Fetch to get file_path
    res = supabase_client.table("documents").select("*").eq("id", document_id).eq("user_id", str(current_user.id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = res.data[0]
    
    # Delete from Supabase
    del_res = supabase_client.table("documents").delete().eq("id", document_id).execute()
    if not del_res.data:
        raise HTTPException(status_code=500, detail="Failed to delete document metadata")
        
    # Delete local file
    try:
        delete_document(doc['filename'])
    except Exception:
        pass # Best effort local deletion

    # Note: For a complete implementation, you'd also remove chunks from FAISS here.
    return None
