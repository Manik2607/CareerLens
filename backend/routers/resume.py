from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form
from typing import Optional
from supabase_client import supabase
from services.resume_parser import ResumeParser
from services.ats_scorer import ATSScorer
from models.schemas import ResumeResponse
import io
import uuid

router = APIRouter(prefix="/api/resume", tags=["Resume"])

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Form(...) # In real app, get from auth token
):
    try:
        content = await file.read()
        
        # 1. Upload to Supabase Storage
        file_ext = file.filename.split(".")[-1]
        file_path = f"{user_id}/{uuid.uuid4()}.{file_ext}"
        
        # Ensure bucket exists (or assume it does 'resumes')
        # supabase.storage.create_bucket("resumes") # Admin only
        
        public_url = ""
        try:
            supabase.storage.from_("resumes").upload(file_path, content)
            # Get public URL
            public_url = supabase.storage.from_("resumes").get_public_url(file_path)
        except Exception as e:
            # If upload fails, maybe bucket missing or permissions
            print(f"Storage upload error: {e}")
            # We can still proceed with text extraction and DB save even if storage fails
        
        # 2. Extract Text
        text = ResumeParser.extract_text(content, file.filename)
        skills = ResumeParser.extract_skills(text)
        
        # 3. Calculate ATS Score
        score = ATSScorer.calculate_score(text, skills)
        
        # 4. Save to Database
        data = {
            "user_id": user_id,
            "file_name": file.filename,
            "file_url": public_url,
            "extracted_text": text,
            "skills": skills,
            "ats_score": score
        }
        
        response = supabase.table("resumes").insert(data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save resume data")
            
        return response.data[0]
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"CRITICAL ERROR in upload_resume: {e}")
        # Return internal server error but with safe message
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/list/{user_id}", response_model=list[ResumeResponse])
async def list_resumes(user_id: str):
    response = supabase.table("resumes").select("*").eq("user_id", user_id).execute()
    return response.data
