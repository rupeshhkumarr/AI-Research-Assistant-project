from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class Profile(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class User(BaseModel):
    # This matches the current get_current_user return type
    id: UUID
    email: EmailStr
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

class Document(BaseModel):
    id: UUID
    user_id: UUID
    filename: str
    file_path: str
    upload_date: datetime
    chunks_count: int
    file_size: Optional[int] = 0

class Conversation(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    created_at: datetime

class Message(BaseModel):
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    sources: List[Any] = []
    created_at: datetime

class Settings(BaseModel):
    id: UUID
    user_id: UUID
    gemini_api_key: Optional[str] = None
    chunk_size: int = 1000
    retrieval_count: int = 5
    theme: str = 'dark'
    created_at: datetime

class SettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    chunk_size: Optional[int] = None
    retrieval_count: Optional[int] = None
    theme: Optional[str] = None

class Analytics(BaseModel):
    user_id: UUID
    total_queries: int
    total_messages: int = 0
    total_conversations: int
    total_documents: int
    total_chunks: int
    updated_at: Optional[datetime] = None
