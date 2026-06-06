import os
import tempfile
import logging
from typing import List

from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader

from app.database.supabase_client import supabase_client

def load_documents(file_paths: List[str]) -> List[Document]:
    """Download specific files from Supabase Storage and load into Documents."""
    documents: List[Document] = []

    for file_path in file_paths:
        try:
            # Download from Supabase
            if not supabase_client:
                raise Exception("Supabase not configured")
                
            res = supabase_client.storage.from_("files").download(file_path)
            
            # Write to a temporary file
            ext = os.path.splitext(file_path)[1].lower()
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
                temp_file.write(res)
                temp_file_path = temp_file.name

            try:
                # Load using the appropriate loader
                if ext == ".pdf":
                    loader = PyPDFLoader(temp_file_path)
                    docs = loader.load()
                elif ext == ".docx":
                    loader = Docx2txtLoader(temp_file_path)
                    docs = loader.load()
                elif ext == ".txt":
                    loader = TextLoader(temp_file_path)
                    docs = loader.load()
                else:
                    docs = []

                for doc in docs:
                    doc.metadata = doc.metadata or {}
                    doc.metadata["filename"] = file_path
                    documents.append(doc)
            finally:
                # Always clean up the temporary file
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

        except Exception as e:
            logging.exception(f"Failed to load file {file_path}: {e}")

    return documents