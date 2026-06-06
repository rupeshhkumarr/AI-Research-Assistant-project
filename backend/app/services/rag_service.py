import os
import logging
from typing import List, Dict, Tuple
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
from app.services.embedding_service import get_embedding_model
from app.services.memory_service import get_history
from app.database.supabase_client import supabase_client

logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """You are an AI Research Assistant.

Rules:
1. Use ONLY retrieved context.
2. Never hallucinate.
3. Do not use outside knowledge.
4. If answer is missing, respond EXACTLY:
"I could not find this information in the uploaded documents."

Conversation History:
{history}

Retrieved Context:
{context}

Question:
{question}

Answer:"""

def load_vectorstore() -> SupabaseVectorStore:
    """Load the persisted Supabase vector store."""
    if not supabase_client:
        return None
    model = get_embedding_model()
    return SupabaseVectorStore(
        embedding=model,
        client=supabase_client,
        table_name="documents_embeddings",
        query_name="match_documents"
    )

def get_retriever(vectorstore: SupabaseVectorStore):
    """Create a retriever from the vectorstore."""
    return vectorstore.as_retriever(search_kwargs={"k": 3})

def extract_sources(docs) -> List[str]:
    """Extract distinct sources from retrieved documents."""
    sources = set()
    for doc in docs:
        filename = doc.metadata.get("filename", "Unknown file")
        page = doc.metadata.get("page")
        if page is not None:
            # PyPDFLoader usually uses 0-based page index, display as page+1
            sources.add(f"{filename} - Page {int(page) + 1}")
        else:
            sources.add(filename)
    return list(sources)

def format_history(history: List[Dict[str, str]]) -> str:
    """Format conversation history into a string."""
    if not history:
        return "No prior conversation."
    formatted = []
    for msg in history:
        formatted.append(f"{msg['role'].capitalize()}: {msg['content']}")
    return "\n".join(formatted)

def build_prompt(history_str: str, context_str: str, question: str) -> str:
    """Build the final RAG prompt."""
    return PROMPT_TEMPLATE.format(
        history=history_str,
        context=context_str,
        question=question
    )

async def generate_answer(question: str, session_id: str = "default") -> Tuple[str, List[str]]:
    """Generate an answer using RAG pipeline."""
    vectorstore = load_vectorstore()
    if not vectorstore:
        raise ValueError("No vectorstore")
    
    retriever = get_retriever(vectorstore)
    docs = retriever.invoke(question)
    
    context_str = "\n\n".join([doc.page_content for doc in docs])
    sources = extract_sources(docs)
    
    history_str = "No prior conversation."
    
    prompt = build_prompt(history_str, context_str, question)
    
    llm = ChatGoogleGenerativeAI(model=settings.gemini_model, temperature=0.0)
    response = llm.invoke(prompt)
    
    answer_text = response.content
    if isinstance(answer_text, list):
        # Extract text from multimodal/list response format
        answer_text = "".join([part.get("text", "") for part in answer_text if isinstance(part, dict) and "text" in part])
    elif not isinstance(answer_text, str):
        answer_text = str(answer_text)
        
    return answer_text, sources

async def generate_answer_stream(question: str, session_id: str = "default"):
    """Generate an answer using RAG pipeline, yielding tokens."""
    from typing import AsyncGenerator, Any
    vectorstore = load_vectorstore()
    if not vectorstore:
        raise ValueError("No vectorstore")
    
    retriever = get_retriever(vectorstore)
    docs = retriever.invoke(question)
    
    context_str = "\n\n".join([doc.page_content for doc in docs])
    sources = extract_sources(docs)
    
    history_str = "No prior conversation."
    prompt = build_prompt(history_str, context_str, question)
    
    llm = ChatGoogleGenerativeAI(model=settings.gemini_model, temperature=0.0, streaming=True)
    
    full_answer = ""
    async for chunk in llm.astream(prompt):
        if chunk.content:
            chunk_text = chunk.content
            if isinstance(chunk_text, list):
                chunk_text = "".join([part.get("text", "") for part in chunk_text if isinstance(part, dict) and "text" in part])
            elif not isinstance(chunk_text, str):
                chunk_text = str(chunk_text)
                
            if chunk_text:
                full_answer += chunk_text
                yield {"token": chunk_text}
            
    yield {"sources": sources, "full_answer": full_answer}
