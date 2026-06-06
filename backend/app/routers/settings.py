from fastapi import APIRouter, Depends, HTTPException
from app.models.supabase_models import User, Settings, SettingsUpdate
from app.routers.auth import get_current_user
from app.database.supabase_client import supabase_client

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("", response_model=Settings)
def get_settings(current_user: User = Depends(get_current_user)):
    """Get settings for the current user."""
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase not configured")
        
    res = supabase_client.table("settings").select("*").eq("user_id", str(current_user.id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Settings not found")
        
    return Settings(**res.data[0])

@router.put("", response_model=Settings)
def update_settings(settings_update: SettingsUpdate, current_user: User = Depends(get_current_user)):
    """Update settings for the current user."""
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase not configured")
        
    update_data = {k: v for k, v in settings_update.dict().items() if v is not None}
    
    if not update_data:
        return get_settings(current_user)
        
    res = supabase_client.table("settings").update(update_data).eq("user_id", str(current_user.id)).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to update settings")
        
    return Settings(**res.data[0])
