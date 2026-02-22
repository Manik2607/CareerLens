from fastapi import APIRouter, HTTPException, BackgroundTasks
from supabase_client import supabase
from models.schemas import SkillsUpdateRequest
import logging
import traceback

logger = logging.getLogger("profile_router")
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s"))
    logger.addHandler(ch)

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("/{user_id}")
async def get_profile(user_id: str):
    """Get aggregated profile: user info + latest resume + preferences + stats."""
    logger.info(f"Getting profile for user: {user_id}")

    try:
        # 1. User info from profiles
        profile_resp = supabase.table("profiles").select("*").eq("id", user_id).execute()
        profile = profile_resp.data[0] if profile_resp.data else {
            "id": user_id, "full_name": "", "email": "", "created_at": None
        }

        # 2. Latest resume
        resume_resp = supabase.table("resumes").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).limit(1).execute()
        latest_resume = resume_resp.data[0] if resume_resp.data else None

        # 3. Preferences
        prefs_resp = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
        preferences = prefs_resp.data[0] if prefs_resp.data else {
            "internship_type": "",
            "work_mode": "Remote",
            "preferred_location": "",
            "target_roles": [],
            "updated_at": None
        }

        # 4. Stats
        all_resumes = supabase.table("resumes").select("id", count="exact").eq("user_id", user_id).execute()
        resume_count = len(all_resumes.data) if all_resumes.data else 0

        result = {
            "user": {
                "id": profile.get("id"),
                "full_name": profile.get("full_name", ""),
                "email": profile.get("email", ""),
                "created_at": profile.get("created_at"),
            },
            "latest_resume": {
                "id": latest_resume.get("id"),
                "file_name": latest_resume.get("file_name"),
                "skills": latest_resume.get("skills", []),
                "ats_score": latest_resume.get("ats_score"),
                "created_at": latest_resume.get("created_at"),
            } if latest_resume else None,
            "preferences": preferences,
            "stats": {
                "resumes_uploaded": resume_count,
            }
        }

        logger.info(f"✅ Profile loaded for {profile.get('full_name', user_id)}")
        return result

    except Exception as e:
        logger.error(f"❌ Error loading profile: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to load profile: {str(e)}")


@router.put("/{user_id}/skills")
async def update_skills(user_id: str, body: SkillsUpdateRequest):
    """Update skills on the user's latest resume."""
    logger.info(f"Updating skills for user: {user_id}")
    logger.info(f"New skills: {body.skills}")

    try:
        # Find latest resume
        resume_resp = supabase.table("resumes").select("id").eq(
            "user_id", user_id
        ).order("created_at", desc=True).limit(1).execute()

        if not resume_resp.data:
            raise HTTPException(status_code=404, detail="No resume found. Upload a resume first.")

        resume_id = resume_resp.data[0]["id"]
        logger.info(f"Updating skills on resume: {resume_id}")

        # Update skills
        try:
            update_resp = supabase.table("resumes").update({
                "skills": body.skills
            }).eq("id", resume_id).execute()
            logger.info(f"Update response data: {update_resp.data}")
        except Exception as update_err:
            logger.error(f"Supabase update error: {update_err}")
            raise HTTPException(status_code=500, detail=f"Database update failed: {str(update_err)}")

        # Verify the update worked by re-fetching
        verify = supabase.table("resumes").select("skills").eq("id", resume_id).execute()
        if verify.data:
            logger.info(f"✅ Skills verified on resume {resume_id}: {verify.data[0].get('skills')}")

        return {"message": "Skills updated", "skills": body.skills}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating skills: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to update skills: {str(e)}")
