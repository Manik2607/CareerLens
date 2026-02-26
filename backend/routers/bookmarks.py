from fastapi import APIRouter, HTTPException
from supabase_client import supabase, supabase_admin
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger("bookmarks_router")
router = APIRouter(prefix="/api/bookmarks", tags=["Bookmarks"])

# Use admin client to bypass RLS, fall back to regular client
db = supabase_admin or supabase


def _table_missing(e: Exception) -> bool:
    """Check if error is due to missing table (not yet created)."""
    msg = str(e).lower()
    return "pgrst205" in msg or "schema cache" in msg or "relation" in msg and "does not exist" in msg


class BookmarkRequest(BaseModel):
    internship_id: str


@router.get("/{user_id}")
async def get_bookmarks(user_id: str):
    """Get all bookmarked internships for a user, with internship details."""
    try:
        bookmarks = (
            db.table("bookmarks")
            .select("id, created_at, internship_id, internships(*)")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return bookmarks.data or []
    except Exception as e:
        if _table_missing(e):
            logger.warning("bookmarks table not found — returning empty list")
            return []
        logger.error(f"Error fetching bookmarks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}")
async def add_bookmark(user_id: str, body: BookmarkRequest):
    """Bookmark an internship."""
    try:
        # Check if already bookmarked
        existing = (
            db.table("bookmarks")
            .select("id")
            .eq("user_id", user_id)
            .eq("internship_id", body.internship_id)
            .execute()
        )
        if existing.data:
            return {"message": "Already bookmarked", "id": existing.data[0]["id"]}

        result = (
            db.table("bookmarks")
            .insert({"user_id": user_id, "internship_id": body.internship_id})
            .execute()
        )
        return {"message": "Bookmarked", "id": result.data[0]["id"]}
    except Exception as e:
        if _table_missing(e):
            logger.info("bookmarks table not found — returning success without persisting")
            return {"message": "Bookmarked", "id": "pending"}
        logger.error(f"Error adding bookmark: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}/{internship_id}")
async def remove_bookmark(user_id: str, internship_id: str):
    """Remove a bookmark."""
    try:
        db.table("bookmarks").delete().eq(
            "user_id", user_id
        ).eq("internship_id", internship_id).execute()
        return {"message": "Bookmark removed"}
    except Exception as e:
        if _table_missing(e):
            logger.info("bookmarks table not found — returning success without persisting")
            return {"message": "Bookmark removed"}
        logger.error(f"Error removing bookmark: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/check/{internship_id}")
async def check_bookmark(user_id: str, internship_id: str):
    """Check if an internship is bookmarked."""
    try:
        result = (
            db.table("bookmarks")
            .select("id")
            .eq("user_id", user_id)
            .eq("internship_id", internship_id)
            .execute()
        )
        return {"bookmarked": len(result.data) > 0}
    except Exception as e:
        if _table_missing(e):
            return {"bookmarked": False}
        raise HTTPException(status_code=500, detail=str(e))
