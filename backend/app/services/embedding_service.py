import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from app.config import settings


def get_embedding_model() -> GoogleGenerativeAIEmbeddings:
    """Instantiate embedding model safely."""
    if not settings.embedding_model:
        raise ValueError("Embedding model not set in settings")

    return GoogleGenerativeAIEmbeddings(
        model=settings.embedding_model
    )


def embed_chunks(chunks):
    """Create embeddings + store in FAISS safely."""

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

    vectorstore_path = str(settings.vectorstore_dir)
    os.makedirs(vectorstore_path, exist_ok=True)

    # Create or load FAISS
    index_file = os.path.join(vectorstore_path, "index.faiss")

    try:
        if os.path.exists(index_file):
            print("Loading existing FAISS index...")
            vectorstore = FAISS.load_local(
                vectorstore_path,
                model,
                allow_dangerous_deserialization=True
            )
            vectorstore.add_texts(texts=texts, metadatas=metadatas)
        else:
            print("Creating new FAISS index...")
            vectorstore = FAISS.from_texts(
                texts=texts,
                embedding=model,
                metadatas=metadatas
            )
    except Exception as e:
        print(f"❌ Failed to generate embeddings or create vectorstore: {e}")
        raise ValueError(f"Embedding generation failed: invalid model or API error. Model used: {settings.embedding_model}") from e

    vectorstore.save_local(vectorstore_path)

    print("FAISS saved successfully")

    return vectorstore