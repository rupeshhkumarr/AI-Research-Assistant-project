from fastapi import APIRouter, Depends, HTTPException
from app.models.supabase_models import User, Analytics
from app.routers.auth import get_current_user
from app.database.supabase_client import supabase_client

router = APIRouter(prefix="", tags=["analytics"])

@router.get("/stats", response_model=Analytics)
def get_stats(current_user: User = Depends(get_current_user)):
    """Get dashboard analytics for the current user."""
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase not configured")
        
    res = supabase_client.table("analytics").select("*").eq("user_id", str(current_user.id)).execute()
    
    if not res.data:
        # Return default 0s if no analytics data exists yet
        return Analytics(
            user_id=current_user.id,
            total_queries=0,
            total_messages=0,
            total_conversations=0,
            total_documents=0,
            total_chunks=0
        )
        
    data = res.data[0]
    if 'total_messages' not in data:
        data['total_messages'] = data.get('total_queries', 0) * 2
        
    return Analytics(**data)
