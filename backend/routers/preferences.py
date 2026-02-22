from fastapi import APIRouter, HTTPException
from models.schemas import PreferencesRequest
from supabase_client import supabase
import logging
import traceback

logger = logging.getLogger("preferences_router")
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s"))
    logger.addHandler(ch)

router = APIRouter(prefix="/api/preferences", tags=["Preferences"])


@router.post("/{user_id}")
async def set_preferences(user_id: str, prefs: PreferencesRequest):
    logger.info(f"Setting preferences for user: {user_id}")
    logger.info(f"Preferences: {prefs.dict()}")

    data = prefs.dict(exclude_unset=True)
    data["user_id"] = user_id

    try:
        # Check if preferences already exist
        existing = supabase.table("user_preferences").select("id").eq("user_id", user_id).execute()

        if existing.data:
            logger.info("Updating existing preferences...")
            response = supabase.table("user_preferences").update(data).eq("user_id", user_id).execute()
        else:
            logger.info("Inserting new preferences...")
            response = supabase.table("user_preferences").insert(data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save preferences")

        logger.info(f"✅ Preferences saved: {response.data[0]}")
        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error saving preferences: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to save preferences: {str(e)}")


@router.get("/{user_id}")
async def get_preferences(user_id: str):
    logger.info(f"Getting preferences for user: {user_id}")
    try:
        response = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
        if not response.data:
            # Return defaults instead of 404
            return {
                "id": None,
                "user_id": user_id,
                "internship_type": "",
                "work_mode": "Remote",
                "preferred_location": "",
                "updated_at": None
            }
        return response.data[0]
    except Exception as e:
        logger.error(f"Error getting preferences: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get preferences: {str(e)}")
