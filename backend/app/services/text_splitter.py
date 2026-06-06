from langchain_text_splitters import RecursiveCharacterTextSplitter

def split_text(documents):
    """
    Robust RAG-safe text splitter
    """

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = []

    for doc_index, doc in enumerate(documents):

        text = getattr(doc, "page_content", None)

        if not text or not text.strip():
            print(f"⚠️ Skipping empty document at index {doc_index}")
            continue

        split_docs = splitter.split_text(text)

        for i, chunk in enumerate(split_docs):

            chunk = chunk.strip()

            if not chunk:
                continue  # 🚨 prevent empty embeddings crash

            meta = dict(getattr(doc, "metadata", {}))

            meta["chunk_id"] = f"{doc_index}_{i}"

            chunks.append({
                "content": chunk,
                "metadata": meta
            })

    print(f"Total chunks created: {len(chunks)}")

    return chunks