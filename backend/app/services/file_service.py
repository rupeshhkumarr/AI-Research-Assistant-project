import uuid
from datetime import datetime
import os
from pathlib import Path
from typing import List
import aiofiles
from fastapi import HTTPException
from app.config import settings
from app.models.document import DocumentMetadata

def _get_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()

def _is_allowed_extension(extension: str) -> bool:
    return extension in settings.allowed_extensions

def _is_within_size_limit(file_size: int) -> bool:
    return file_size <= settings.max_upload_size

async def save_file(file) -> Path:
    """Save an uploaded file to the uploads directory with a UUID filename.
    Returns the path to the saved file.
    """
    extension = _get_extension(file.filename)
    if not _is_allowed_extension(extension):
        raise HTTPException(status_code=400, detail="File type not allowed.")
    if not _is_within_size_limit(file.size):
        raise HTTPException(status_code=400, detail="File exceeds maximum size of 20 MB.")

    # Ensure upload directory exists
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    dest_path = upload_dir / file.filename
    print("UPLOAD DIR:", upload_dir)
    print("DEST PATH:", dest_path)
    async with aiofiles.open(dest_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)
    return dest_path

def create_metadata(saved_path: Path, original_filename: str) -> DocumentMetadata:
    """Create DocumentMetadata from a saved file path and original filename."""
    stat = saved_path.stat()
    return DocumentMetadata(
        filename=original_filename,
        upload_date=datetime.utcnow(),
        file_size=stat.st_size,
        file_type=_get_extension(original_filename).lstrip(".")
    )

def list_documents() -> List[DocumentMetadata]:
    """Iterate over files in the upload directory and produce metadata entries."""
    upload_dir = Path(settings.upload_dir)
    if not upload_dir.exists():
        return []
    docs: List[DocumentMetadata] = []
    for file_path in upload_dir.iterdir():
        if file_path.is_file():
            # Attempt to infer original filename from stored name: we only have UUID name.
            # For this milestone we use the stored name as filename.
            stat = file_path.stat()
            docs.append(
                DocumentMetadata(
                    filename=file_path.name,
                    upload_date=datetime.utcfromtimestamp(stat.st_ctime),
                    file_size=stat.st_size,
                    file_type=_get_extension(file_path.name).lstrip(".")
                )
            )
    return docs

def delete_document(filename: str) -> bool:
    """Delete a document by its filename."""
    upload_dir = Path(settings.upload_dir)
    file_path = upload_dir / filename
    if file_path.exists() and file_path.is_file():
        file_path.unlink()
        return True
    return False
