from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

# Auth Models
class UserSignup(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    created_at: datetime

# Resume Models
class ResumeResponse(BaseModel):
    id: UUID
    file_name: str
    file_url: str
    ats_score: Optional[int] = None
    skills: List[str] = []
    created_at: datetime

# Preferences Models
class PreferencesRequest(BaseModel):
    internship_type: Optional[str] = None
    work_mode: Optional[str] = None
    preferred_location: Optional[str] = None

class PreferencesResponse(PreferencesRequest):
    id: UUID
    user_id: UUID
    updated_at: datetime

# Internship Models
class InternshipResponse(BaseModel):
    id: UUID
    company: str
    role: str
    location: Optional[str] = None
    work_type: Optional[str] = None
    description: Optional[str] = None
    skills: List[str] = []
    salary: Optional[str] = None
    apply_url: Optional[str] = None
    source: Optional[str] = None
    posted_at: Optional[datetime] = None

# Match Models
class MatchResponse(BaseModel):
    internship: InternshipResponse
    match_score: int
    matched_skills: List[str] = []
