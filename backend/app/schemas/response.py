from pydantic import BaseModel
from typing import List, Optional
from .jd_profile import JobDescriptionProfile

class RepoMatch(BaseModel):
    repo_name: str
    score: int
    project_type: str
    matching_skills: List[str]
    missing_skills: List[str]
    why_it_matches: str
    resume_bullets: Optional[List[str]] = []

class AnalyzeResponse(BaseModel):
    status: str = "ok"
    job_profile: JobDescriptionProfile
    top_matches: List[RepoMatch]
