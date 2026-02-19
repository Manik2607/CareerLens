from fastapi import APIRouter, HTTPException
from models.schemas import PreferencesRequest, PreferencesResponse
from supabase_client import supabase

router = APIRouter(prefix="/api/preferences", tags=["Preferences"])

@router.post("/{user_id}", response_model=PreferencesResponse)
async def set_preferences(user_id: str, prefs: PreferencesRequest):
    data = prefs.dict(exclude_unset=True)
    data["user_id"] = user_id
    
    # Check if exists
    existing = supabase.table("user_preferences").select("id").eq("user_id", user_id).execute()
    
    if existing.data:
        response = supabase.table("user_preferences").update(data).eq("user_id", user_id).execute()
    else:
        response = supabase.table("user_preferences").insert(data).execute()
        
    if not response.data:
         raise HTTPException(status_code=500, detail="Failed to save preferences")
         
    return response.data[0]

@router.get("/{user_id}", response_model=PreferencesResponse)
async def get_preferences(user_id: str):
    response = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
    if not response.data:
        # Return empty/default if not found
        raise HTTPException(status_code=404, detail="Preferences not found")
    return response.data[0]
