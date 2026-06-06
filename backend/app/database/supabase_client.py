from typing import Optional
from supabase import create_client, Client
from app.config import settings

def get_supabase() -> Optional[Client]:
    """Initialize and return a Supabase client.
    Uses the service role key for backend admin operations.
    """
    if not settings.supabase_url or not settings.supabase_service_role_key:
        # We allow it to be empty for tests or before the user sets it up,
        # but in production it should throw an error or be handled gracefully.
        print("Warning: Supabase credentials not found in environment variables.")
        return None
    
    return create_client(settings.supabase_url, settings.supabase_service_role_key)

supabase_client: Optional[Client] = get_supabase()
