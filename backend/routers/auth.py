from fastapi import APIRouter, HTTPException
from models.schemas import UserSignup, UserLogin, UserProfile, TokenResponse
from supabase_client import supabase
from datetime import datetime
import logging

logger = logging.getLogger("auth_router")
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s"))
    logger.addHandler(ch)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/create-profile")
async def create_profile(user_id: str, full_name: str = None, email: str = None):
    """
    Create a user profile in Supabase. Called after successful Supabase auth signup.
    """
    try:
        profile_data = {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Remove None values
        profile_data = {k: v for k, v in profile_data.items() if v is not None}
        
        result = supabase.table("profiles").insert(profile_data).execute()
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create profile")
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create profile error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to create profile: {str(e)}")

@router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """
    Get a user profile from Supabase.
    """
    try:
        result = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get profile error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to get profile: {str(e)}")

@router.post("/logout")
async def logout():
    """Logout endpoint (token invalidation handled on frontend)"""
    try:
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

