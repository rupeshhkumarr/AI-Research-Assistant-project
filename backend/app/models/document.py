from pydantic import BaseModel
from datetime import datetime

class DocumentMetadata(BaseModel):
    """Metadata for an uploaded document."""
    filename: str
    upload_date: datetime
    file_size: int  # in bytes
    file_type: str  # extension without leading dot
