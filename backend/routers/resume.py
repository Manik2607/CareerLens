from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from supabase_client import supabase
from services.resume_parser import ResumeParser
from services.ats_scorer import ATSScorer
import uuid
import traceback
import logging

# Configure logging
logger = logging.getLogger("resume_router")
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s"))
    logger.addHandler(ch)

router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    """
    Upload a resume file, parse it, score it, and store results in Supabase DB.
    File storage is skipped — only extracted data is saved.
    """
    logger.info("=" * 60)
    logger.info("RESUME UPLOAD STARTED")
    logger.info(f"User ID: {user_id}")
    logger.info(f"File: {file.filename} ({file.content_type})")
    logger.info("=" * 60)

    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")

        file_ext = file.filename.split(".")[-1].lower()
        if file_ext not in ["pdf", "docx", "doc", "txt"]:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: .{file_ext}")

        # Step 1: Read file
        logger.info("[Step 1] Reading file...")
        content = await file.read()
        logger.info(f"[Step 1] ✅ Read {len(content)} bytes")

        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        # Step 2: Extract text
        logger.info("[Step 2] Extracting text...")
        try:
            text = ResumeParser.extract_text(content, file.filename)
            logger.info(f"[Step 2] ✅ Extracted {len(text)} chars")
        except Exception as e:
            logger.error(f"[Step 2] ❌ Text extraction failed: {e}")
            text = ""

        # Step 3: Extract skills
        logger.info("[Step 3] Extracting skills...")
        try:
            skills = ResumeParser.extract_skills(text)
            logger.info(f"[Step 3] ✅ Skills: {skills}")
        except Exception as e:
            logger.error(f"[Step 3] ❌ Skill extraction failed: {e}")
            skills = []

        # Step 4: Calculate ATS score
        logger.info("[Step 4] Calculating ATS score...")
        try:
            score = ATSScorer.calculate_score(
                resume_text=text,
                resume_skills=skills,
                job_description=""
            )
            logger.info(f"[Step 4] ✅ ATS Score: {score}")
        except Exception as e:
            logger.error(f"[Step 4] ❌ Scoring failed: {e}")
            score = 0

        # Step 5: Save to Supabase DB (no file storage, just data)
        logger.info("[Step 5] Saving to database...")
        data = {
            "user_id": user_id,
            "file_name": file.filename,
            "file_url": "",
            "extracted_text": text,
            "skills": skills,
            "ats_score": score
        }

        try:
            response = supabase.table("resumes").insert(data).execute()
            logger.info(f"[Step 5] ✅ Saved! Row: {response.data}")
        except Exception as db_err:
            logger.error(f"[Step 5] ❌ DB insert failed: {db_err}")
            logger.error(traceback.format_exc())
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save resume: {str(db_err)}"
            )

        if not response.data:
            logger.error("[Step 5] ❌ DB returned empty data (RLS issue?)")
            raise HTTPException(status_code=500, detail="Database returned no data")

        result = response.data[0]
        logger.info(f"✅ UPLOAD COMPLETE — ID: {result.get('id')}, Score: {score}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ UNHANDLED ERROR: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/list/{user_id}")
async def list_resumes(user_id: str):
    """List all resumes for a given user."""
    logger.info(f"Listing resumes for user: {user_id}")
    try:
        response = supabase.table("resumes").select("*").eq("user_id", user_id).execute()
        logger.info(f"Found {len(response.data)} resumes")
        return response.data
    except Exception as e:
        logger.error(f"Error listing resumes: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list resumes: {str(e)}")
