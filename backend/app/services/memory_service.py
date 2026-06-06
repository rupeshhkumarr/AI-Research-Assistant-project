from typing import List, Dict

# In-memory store for session histories
# Structure: { "session_id": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}] }
_sessions: Dict[str, List[Dict[str, str]]] = {}

# Maximum number of messages to keep per session
MAX_MEMORY_MESSAGES = 10

def trim_history(session_id: str):
    """Ensure the session history does not exceed the maximum memory limit."""
    if session_id in _sessions:
        history = _sessions[session_id]
        if len(history) > MAX_MEMORY_MESSAGES:
            # Keep the most recent MAX_MEMORY_MESSAGES
            _sessions[session_id] = history[-MAX_MEMORY_MESSAGES:]

import time

def add_message(session_id: str, role: str, content: str):
    """Add a message to the session's history and trim if necessary."""
    if session_id not in _sessions:
        _sessions[session_id] = []
    
    _sessions[session_id].append({
        "role": role,
        "content": content,
        "timestamp": time.time()
    })
    trim_history(session_id)

def get_history(session_id: str) -> List[Dict[str, str]]:
    """Retrieve the chat history for a given session."""
    return _sessions.get(session_id, [])

def clear_memory(session_id: str):
    """Clear the memory for a given session."""
    if session_id in _sessions:
        del _sessions[session_id]
