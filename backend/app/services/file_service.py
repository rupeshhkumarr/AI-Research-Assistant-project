import uuid
import os
from fastapi import HTTPException
from app.config import settings
from app.database.supabase_client import supabase_client

def _get_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()

def _is_allowed_extension(extension: str) -> bool:
    return extension in settings.allowed_extensions

def _is_within_size_limit(file_size: int) -> bool:
    return file_size <= settings.max_upload_size

async def save_file(file) -> str:
    """Upload a file to Supabase Storage bucket 'files' and return the storage path."""
    extension = _get_extension(file.filename)
    if not _is_allowed_extension(extension):
        raise HTTPException(status_code=400, detail="File type not allowed.")
    if not _is_within_size_limit(file.size):
        raise HTTPException(status_code=400, detail="File exceeds maximum size of 20 MB.")

    file_path = f"{uuid.uuid4()}{extension}"
    content = await file.read()
    
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    try:
        res = supabase_client.storage.from_("files").upload(
            path=file_path,
            file=content,
            file_options={"content-type": file.content_type}
        )
        return file_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to Supabase Storage: {str(e)}")

def delete_document(file_path: str) -> bool:
    """Delete a document from Supabase Storage by its path."""
    if not supabase_client:
        return False
    try:
        supabase_client.storage.from_("files").remove([file_path])
        return True
    except Exception as e:
        print(f"Failed to delete file from storage: {e}")
        return False
