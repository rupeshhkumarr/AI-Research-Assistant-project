from app.services.document_loader import load_documents
from app.services.text_splitter import split_text
from app.services.embedding_service import embed_chunks


from app.database.supabase_client import supabase_client

def process_and_update_document(doc_id: str, file_path: str):
    """
    Wrapper around process_documents to update Supabase status.
    """
    try:
        from pathlib import Path
        # Process the document
        result = process_documents([Path(file_path)])
        chunks_count = result.get("total_chunks", 0)
        
        # Update Supabase chunks_count
        if supabase_client:
            supabase_client.table("documents").update({
                "chunks_count": chunks_count
            }).eq("id", doc_id).execute()
            
    except Exception as e:
        print(f"Error processing document {doc_id}: {e}")
        # Note: 'status' column has been removed, so we just log the error.

def process_documents(file_paths):
    """
    Full RAG ingestion pipeline:
    Load → Split → Embed → Store
    """

    # 1. Load documents
    documents = load_documents(file_paths)

    # 2. Split into chunks
    chunks = split_text(documents)

    # 3. Create embeddings + store in FAISS
    vectorstore = embed_chunks(chunks)

    return {
        "message": "Documents processed successfully",
        "total_chunks": len(chunks)
    }