from fastapi import APIRouter, HTTPException, Query
from supabase_client import supabase
from services.matcher import Matcher
from typing import Optional
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
async def get_recommendations(
    user_id: str,
    work_type: Optional[str] = Query(None, description="Filter: Remote, On-site, Hybrid"),
    location: Optional[str] = Query(None, description="Substring match on location"),
    search: Optional[str] = Query(None, description="Keyword search on role/company/description"),
    min_score: int = Query(0, ge=0, le=100, description="Minimum match score"),
    skills_filter: Optional[str] = Query(None, alias="skills", description="Comma-separated skills to filter by"),
    sort: str = Query("match", description="Sort: match, recent, salary"),
    limit: int = Query(50, ge=1, le=100, description="Max results"),
):
    logger.info(f"Getting recommendations for user: {user_id} "
                f"(work_type={work_type}, location={location}, search={search}, "
                f"min_score={min_score}, sort={sort}, limit={limit})")

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

        # 3. Fetch internships — apply server-side filters where possible
        query = supabase.table("internships").select("*")

        if work_type and work_type.lower() != "all":
            query = query.ilike("work_type", f"%{work_type}%")

        if location:
            query = query.ilike("location", f"%{location}%")

        internships_resp = query.limit(300).execute()
        all_internships = internships_resp.data or []
        logger.info(f"Internships after DB filters: {len(all_internships)}")

        if not all_internships:
            logger.warning("No internships match the filters!")
            return []

        # 4. Parse skills filter
        filter_skills_set = set()
        if skills_filter:
            filter_skills_set = set(s.strip().lower() for s in skills_filter.split(",") if s.strip())

        # 5. Keyword search filter
        search_lower = search.strip().lower() if search else ""

        # 6. Calculate match scores & apply remaining filters
        matches = []
        for internship in all_internships:
            internship_skills = internship.get("skills", []) or []
            internship_text = " ".join([
                internship.get("description") or "",
                internship.get("role") or "",
                internship.get("company") or ""
            ])

            # -- Keyword search --
            if search_lower:
                role_l = (internship.get("role") or "").lower()
                company_l = (internship.get("company") or "").lower()
                desc_l = (internship.get("description") or "").lower()
                if (search_lower not in role_l
                        and search_lower not in company_l
                        and search_lower not in desc_l):
                    continue

            # -- Skills filter --
            if filter_skills_set:
                intern_skills_lower = set(s.lower() for s in internship_skills)
                if not filter_skills_set.intersection(intern_skills_lower):
                    # Also check description text for skill mentions
                    text_lower = internship_text.lower()
                    if not any(sk in text_lower for sk in filter_skills_set):
                        continue

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

            # -- Min score filter --
            if score < min_score:
                continue

            # Find explicitly matched skills
            resume_set = set(s.lower() for s in resume_skills)
            intern_set = set(s.lower() for s in internship_skills)
            matched_skills = list(resume_set.intersection(intern_set))

            # Also check for skills mentioned in text
            for skill in resume_set:
                if skill in internship_text.lower() and skill not in matched_skills:
                    matched_skills.append(skill)

            matches.append({
                "internship": internship,
                "match_score": score,
                "matched_skills": matched_skills
            })

        # 7. Sort
        if sort == "recent":
            matches.sort(key=lambda x: x["internship"].get("posted_at") or "", reverse=True)
        elif sort == "salary":
            def salary_key(m):
                sal = m["internship"].get("salary") or ""
                # Extract first number from salary string for rough comparison
                nums = "".join(c if c.isdigit() else " " for c in sal).split()
                return int(nums[0]) if nums else 0
            matches.sort(key=salary_key, reverse=True)
        else:
            matches.sort(key=lambda x: x["match_score"], reverse=True)

        # 8. Limit
        result = matches[:limit]
        logger.info(f"✅ Returning {len(result)} recommendations (top scores: {[m['match_score'] for m in result[:5]]})")
        return result

    except Exception as e:
        logger.error(f"❌ Error getting recommendations: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")
