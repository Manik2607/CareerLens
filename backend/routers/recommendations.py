from fastapi import APIRouter
from supabase_client import supabase
from services.matcher import Matcher
from models.schemas import MatchResponse

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("/{user_id}", response_model=list[MatchResponse])
async def get_recommendations(user_id: str):
    # 1. Get latest resume
    resumes = supabase.table("resumes").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
    if not resumes.data:
        return []
    
    resume = resumes.data[0]
    resume_skills = resume.get("skills", [])
    
    # 2. Get user preferences
    prefs = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
    preferred_type = None
    if prefs.data:
        preferred_type = prefs.data[0].get("internship_type")
        
    # 3. Get internships (filter by preference if available)
    query = supabase.table("internships").select("*")
    if preferred_type:
         # simple check
        query = query.ilike("role", f"%{preferred_type}%")
        
    # Fetch reasonably large batch
    internships = query.limit(100).execute()
    
    matches = []
    for internship in internships.data:
        internship_skills = internship.get("skills", [])
        internship_text = (internship.get("description") or "") + " " + (internship.get("role") or "")
        
        score = Matcher.calculate_match(resume_skills, internship_skills, internship_text)
        
        if score > 0:
            matches.append({
                "internship": internship,
                "match_score": score,
                "matched_skills": list(set(resume_skills).intersection(set(internship_skills or []))) # simplified
            })
            
    # Sort by score
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches
