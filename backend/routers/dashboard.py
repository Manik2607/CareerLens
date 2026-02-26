from fastapi import APIRouter, HTTPException
from supabase_client import supabase, supabase_admin
import logging
from collections import Counter
import datetime

# Use admin client to bypass RLS, fall back to regular client
db = supabase_admin or supabase

logger = logging.getLogger("dashboard_router")
router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/{user_id}")
async def get_dashboard(user_id: str):
    """Full dashboard data: skills distribution, application funnel, match trends."""
    try:
        data = {
            "skills_distribution": [],
            "application_funnel": {},
            "match_overview": {},
            "recent_activity": [],
            "top_companies": [],
        }

        # ── 1. Skills Distribution ──
        resumes = (
            db.table("resumes")
            .select("skills")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if resumes.data and resumes.data[0].get("skills"):
            skills = resumes.data[0]["skills"]
            # Count how many saved/bookmarked/applied internships require each skill
            bookmarks = (
                db.table("bookmarks")
                .select("internships(skills)")
                .eq("user_id", user_id)
                .execute()
            )
            applications = (
                db.table("applications")
                .select("internships(skills)")
                .eq("user_id", user_id)
                .execute()
            )
            # Merge all internship skills from bookmarks + applications
            demand_counter = Counter()
            for item in (bookmarks.data or []) + (applications.data or []):
                intern = item.get("internships")
                if intern and intern.get("skills"):
                    for sk in intern["skills"]:
                        demand_counter[sk.lower()] += 1

            # Build skills distribution: user's skills + demand count
            for skill in skills:
                data["skills_distribution"].append({
                    "skill": skill,
                    "owned": True,
                    "demand": demand_counter.get(skill.lower(), 0),
                })
            # Add top demanded skills the user doesn't have
            user_skills_lower = set(s.lower() for s in skills)
            for sk, cnt in demand_counter.most_common(10):
                if sk not in user_skills_lower:
                    data["skills_distribution"].append({
                        "skill": sk,
                        "owned": False,
                        "demand": cnt,
                    })

        # ── 2. Application Funnel ──
        apps = (
            db.table("applications")
            .select("status, applied_at, internships(company, role)")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .execute()
        )
        all_apps = apps.data or []
        funnel = {"Applied": 0, "Interview": 0, "Offer": 0, "Rejected": 0, "Withdrawn": 0}
        for a in all_apps:
            status = a.get("status", "Applied")
            if status in funnel:
                funnel[status] += 1
        funnel["total"] = len(all_apps)
        data["application_funnel"] = funnel

        # ── 3. Match Overview (from recommendations) ──
        try:
            from services.matcher import Matcher

            internships_resp = db.table("internships").select("*").limit(100).execute()
            all_internships = internships_resp.data or []

            resume_skills = []
            if resumes.data and resumes.data[0].get("skills"):
                resume_skills = resumes.data[0]["skills"]

            if resume_skills and all_internships:
                scores = []
                for intern in all_internships:
                    intern_skills = intern.get("skills", []) or []
                    intern_text = " ".join([
                        intern.get("description") or "",
                        intern.get("role") or "",
                        intern.get("company") or "",
                    ])
                    score = Matcher.calculate_match(resume_skills, intern_skills, intern_text)
                    scores.append(score)

                if scores:
                    data["match_overview"] = {
                        "average_score": round(sum(scores) / len(scores)),
                        "top_score": max(scores),
                        "above_80": sum(1 for s in scores if s >= 80),
                        "above_60": sum(1 for s in scores if s >= 60),
                        "total_internships": len(scores),
                    }
        except Exception as e:
            logger.warning(f"Could not compute match overview: {e}")
            data["match_overview"] = {}

        # ── 4. Recent Activity ──
        recent = []
        # Recent bookmarks
        recent_bookmarks = (
            db.table("bookmarks")
            .select("created_at, internships(company, role)")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        )
        for b in (recent_bookmarks.data or []):
            intern = b.get("internships") or {}
            recent.append({
                "type": "bookmark",
                "label": f"Saved {intern.get('role', 'Unknown')} at {intern.get('company', 'Unknown')}",
                "time": b.get("created_at"),
            })

        # Recent applications
        for a in all_apps[:5]:
            intern = a.get("internships") or {}
            recent.append({
                "type": "application",
                "label": f"{a.get('status', 'Applied')} — {intern.get('role', 'Unknown')} at {intern.get('company', 'Unknown')}",
                "time": a.get("applied_at"),
            })

        # Sort by time
        recent.sort(key=lambda x: x.get("time", ""), reverse=True)
        data["recent_activity"] = recent[:10]

        # ── 5. Top Companies ──
        company_counter = Counter()
        for a in all_apps:
            intern = a.get("internships") or {}
            company = intern.get("company")
            if company:
                company_counter[company] += 1
        for b in (recent_bookmarks.data or []):
            intern = b.get("internships") or {}
            company = intern.get("company")
            if company:
                company_counter[company] += 1

        data["top_companies"] = [
            {"company": name, "count": count}
            for name, count in company_counter.most_common(8)
        ]

        return data

    except Exception as e:
        msg = str(e).lower()
        if "pgrst205" in msg or "schema cache" in msg or "relation" in msg and "does not exist" in msg:
            logger.warning(f"Dashboard: table missing — returning defaults. {e}")
            return {
                "skills_distribution": [],
                "application_funnel": {"Applied": 0, "Interview": 0, "Offer": 0, "Rejected": 0, "Withdrawn": 0, "total": 0},
                "match_overview": {},
                "recent_activity": [],
                "top_companies": [],
            }
        logger.error(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
