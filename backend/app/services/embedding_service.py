import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from app.config import settings
from app.database.supabase_client import supabase_client


def get_embedding_model() -> GoogleGenerativeAIEmbeddings:
    """Instantiate embedding model safely."""
    if not settings.embedding_model:
        raise ValueError("Embedding model not set in settings")

    return GoogleGenerativeAIEmbeddings(
        model=settings.embedding_model
    )


def embed_chunks(chunks):
    """Create embeddings + store in Supabase pgvector safely."""

    if not chunks:
        raise ValueError("No chunks received for embedding")

    model = get_embedding_model()
    print("EMBEDDING MODEL IN USE:", settings.embedding_model)
    # 🔥 SAFE extraction (prevents silent failure)
    texts = []
    metadatas = []

    for i, chunk in enumerate(chunks):
        content = chunk.get("content", "").strip()

        if not content:
            print(f"⚠️ Skipping empty chunk at index {i}")
            continue

        texts.append(content)
        metadatas.append(chunk.get("metadata", {}))

    if not texts:
        raise ValueError("All chunks are empty after processing")

    print(f"Embedding {len(texts)} chunks...")

    if not supabase_client:
        raise ValueError("Supabase client not configured")

    try:
        vectorstore = SupabaseVectorStore.from_texts(
            texts=texts,
            embedding=model,
            metadatas=metadatas,
            client=supabase_client,
            table_name="documents_embeddings",
            query_name="match_documents"
        )
    except Exception as e:
        print(f"❌ Failed to generate embeddings or create vectorstore: {e}")
        raise ValueError(f"Embedding generation failed: invalid model or API error. Model used: {settings.embedding_model}") from e

    print("Supabase embeddings saved successfully")

    return vectorstore