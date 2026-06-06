from pathlib import Path
from typing import List
import logging

from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader

from app.config import settings


def load_documents(file_paths: List[Path]) -> List[Document]:
    """Load specific file paths into Documents."""

    documents: List[Document] = []

    for file_path in file_paths:
        if not file_path.is_file():
            continue

        try:
            ext = file_path.suffix.lower()

            if ext == ".pdf":
                loader = PyPDFLoader(str(file_path))
                docs = loader.load()

            elif ext == ".docx":
                loader = Docx2txtLoader(str(file_path))
                docs = loader.load()

            elif ext == ".txt":
                loader = TextLoader(str(file_path))
                docs = loader.load()

            else:
                continue

            for doc in docs:
                doc.metadata = doc.metadata or {}
                doc.metadata["filename"] = file_path.name
                documents.append(doc)

        except Exception as e:
            logging.exception(f"Failed to load file {file_path}: {e}")

    return documents