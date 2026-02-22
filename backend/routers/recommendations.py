from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from services.matcher import Matcher
import logging
import traceback

logger = logging.getLogger("recommendations_router")
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s"))
    logger.addHandler(ch)

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/{user_id}")
async def get_recommendations(user_id: str):
    logger.info(f"Getting recommendations for user: {user_id}")

    try:
        # 1. Get latest resume
        resumes = supabase.table("resumes").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).limit(1).execute()

        if not resumes.data:
            logger.warning("No resume found for user")
            return []

        resume = resumes.data[0]
        resume_skills = resume.get("skills", [])
        logger.info(f"Resume skills ({len(resume_skills)}): {resume_skills}")

        # 2. Get user preferences (for ranking boost, NOT for filtering)
        prefs = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
        preferred_type = ""
        preferred_work_mode = ""
        if prefs.data:
            preferred_type = (prefs.data[0].get("internship_type") or "").lower()
            preferred_work_mode = (prefs.data[0].get("work_mode") or "").lower()
            logger.info(f"Preferences — type: '{preferred_type}', work_mode: '{preferred_work_mode}'")

        # 3. Fetch ALL internships (no filter — we rank them instead)
        internships = supabase.table("internships").select("*").limit(200).execute()
        logger.info(f"Total internships to match: {len(internships.data)}")

        if not internships.data:
            logger.warning("No internships in database!")
            return []

        # 4. Calculate match scores
        matches = []
        for internship in internships.data:
            internship_skills = internship.get("skills", []) or []
            internship_text = " ".join([
                internship.get("description") or "",
                internship.get("role") or "",
                internship.get("company") or ""
            ])

            # Base skill match score (0-100)
            score = Matcher.calculate_match(resume_skills, internship_skills, internship_text)

            # Preference boost: +15 if role matches preferred type
            role_lower = (internship.get("role") or "").lower()
            desc_lower = (internship.get("description") or "").lower()
            if preferred_type and (preferred_type in role_lower or preferred_type in desc_lower):
                score = min(score + 15, 100)

            # Work mode boost: +5 if matches preferred work mode
            work_type_lower = (internship.get("work_type") or "").lower()
            if preferred_work_mode and preferred_work_mode in work_type_lower:
                score = min(score + 5, 100)

            # Find explicitly matched skills
            resume_set = set(s.lower() for s in resume_skills)
            intern_set = set(s.lower() for s in internship_skills)
            matched_skills = list(resume_set.intersection(intern_set))

            # Also check for skills mentioned in text
            for skill in resume_set:
                if skill in internship_text.lower() and skill not in matched_skills:
                    matched_skills.append(skill)

            if score > 0:
                matches.append({
                    "internship": internship,
                    "match_score": score,
                    "matched_skills": matched_skills
                })

        # Sort by score descending
        matches.sort(key=lambda x: x["match_score"], reverse=True)

        # Return top 20
        result = matches[:20]
        logger.info(f"✅ Returning {len(result)} recommendations (top scores: {[m['match_score'] for m in result[:5]]})")
        return result

    except Exception as e:
        logger.error(f"❌ Error getting recommendations: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")
