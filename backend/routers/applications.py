from fastapi import APIRouter, HTTPException
from supabase_client import supabase, supabase_admin
from pydantic import BaseModel
from typing import Optional
import logging
import datetime

logger = logging.getLogger("applications_router")
router = APIRouter(prefix="/api/applications", tags=["Applications"])

# Use admin client to bypass RLS, fall back to regular client
db = supabase_admin or supabase


def _table_missing(e: Exception) -> bool:
    """Check if error is due to missing table (not yet created)."""
    msg = str(e).lower()
    return "pgrst205" in msg or "schema cache" in msg or "relation" in msg and "does not exist" in msg

VALID_STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Withdrawn"]


class ApplicationCreate(BaseModel):
    internship_id: str
    status: str = "Applied"
    notes: Optional[str] = ""


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


@router.get("/{user_id}")
async def get_applications(user_id: str, status: Optional[str] = None):
    """Get all tracked applications for a user, with internship details."""
    try:
        query = (
            db.table("applications")
            .select("id, status, notes, applied_at, updated_at, internship_id, internships(*)")
            .eq("user_id", user_id)
        )
        if status and status in VALID_STATUSES:
            query = query.eq("status", status)

        result = query.order("updated_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        if _table_missing(e):
            logger.warning("applications table not found — returning empty list")
            return []
        logger.error(f"Error fetching applications: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}")
async def create_application(user_id: str, body: ApplicationCreate):
    """Track an application for an internship."""
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}")

    try:
        # Check if already tracking this internship
        existing = (
            db.table("applications")
            .select("id, status")
            .eq("user_id", user_id)
            .eq("internship_id", body.internship_id)
            .execute()
        )
        if existing.data:
            return {
                "message": "Application already tracked",
                "id": existing.data[0]["id"],
                "status": existing.data[0]["status"],
            }

        result = (
            db.table("applications")
            .insert({
                "user_id": user_id,
                "internship_id": body.internship_id,
                "status": body.status,
                "notes": body.notes or "",
            })
            .execute()
        )
        return {"message": "Application tracked", "id": result.data[0]["id"], "status": body.status}
    except Exception as e:
        if _table_missing(e):
            logger.info("applications table not found — returning success without persisting")
            return {"message": "Application tracked", "id": "pending", "status": body.status}
        logger.error(f"Error creating application: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{user_id}/{application_id}")
async def update_application(user_id: str, application_id: str, body: ApplicationUpdate):
    """Update application status or notes."""
    updates = {}
    if body.status:
        if body.status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}")
        updates["status"] = body.status
    if body.notes is not None:
        updates["notes"] = body.notes

    if not updates:
        raise HTTPException(status_code=400, detail="Nothing to update")

    updates["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    try:
        result = (
            db.table("applications")
            .update(updates)
            .eq("id", application_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Application not found")
        return {"message": "Updated", "application": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        if _table_missing(e):
            logger.info("applications table not found — returning success without persisting")
            return {"message": "Updated", "application": {"id": application_id, **updates}}
        logger.error(f"Error updating application: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}/{application_id}")
async def delete_application(user_id: str, application_id: str):
    """Remove an application from tracker."""
    try:
        db.table("applications").delete().eq(
            "id", application_id
        ).eq("user_id", user_id).execute()
        return {"message": "Application removed"}
    except Exception as e:
        if _table_missing(e):
            logger.info("applications table not found — returning success without persisting")
            return {"message": "Application removed"}
        logger.error(f"Error deleting application: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/stats")
async def get_application_stats(user_id: str):
    """Get application statistics (counts by status)."""
    try:
        apps = (
            db.table("applications")
            .select("status")
            .eq("user_id", user_id)
            .execute()
        )
        all_apps = apps.data or []
        stats = {s: 0 for s in VALID_STATUSES}
        for a in all_apps:
            status = a.get("status", "Applied")
            if status in stats:
                stats[status] += 1
        stats["total"] = len(all_apps)
        return stats
    except Exception as e:
        if _table_missing(e):
            logger.warning("applications table not found — returning empty stats")
            return {s: 0 for s in VALID_STATUSES} | {"total": 0}
        logger.error(f"Error fetching app stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
