from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional
from services.skill_gap import SkillGapAnalyzer
from services.resume_parser import ResumeParser
import logging

logger = logging.getLogger("skill_gap_router")
logger.setLevel(logging.DEBUG)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s"))
    logger.addHandler(ch)

router = APIRouter(prefix="/api/skill-gap", tags=["Skill Gap"])


@router.post("/analyze")
async def analyze_skill_gap(
    job_description: str = Form(...),
    resume_text: Optional[str] = Form(None),
    resume_file: Optional[UploadFile] = File(None),
):
    """
    Analyze the skill gap between a job description and a resume.
    Accepts either resume_text (pasted text) or resume_file (uploaded PDF/DOCX/TXT).
    """
    logger.info("Skill gap analysis requested")

    # Validate input
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")

    # Extract resume text from file or use provided text
    final_resume_text = ""

    if resume_file and resume_file.filename:
        logger.info(f"Processing uploaded file: {resume_file.filename}")
        content = await resume_file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        final_resume_text = ResumeParser.extract_text(content, resume_file.filename)
        if not final_resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the uploaded file. Try a different format or paste the text."
            )
    elif resume_text and resume_text.strip():
        final_resume_text = resume_text.strip()
    else:
        raise HTTPException(
            status_code=400,
            detail="Please provide either resume text or upload a resume file"
        )

    logger.info(f"JD length: {len(job_description)}, Resume length: {len(final_resume_text)}")

    # Run the analysis
    result = SkillGapAnalyzer.analyze(job_description, final_resume_text)

    logger.info(f"Analysis complete — Match: {result['match_score']}%, "
                f"Matched: {result['total_matched']}, Missing: {result['total_missing']}")

    return result
