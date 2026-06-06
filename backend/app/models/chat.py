from pydantic import BaseModel
from typing import List

class ChatRequest(BaseModel):
    question: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    conversation_id: str

class ClearMemoryRequest(BaseModel):
    session_id: str
