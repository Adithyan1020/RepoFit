from pydantic import BaseModel
from typing import List, Optional
from .jd_profile import JobDescriptionProfile

class RepoMetadata(BaseModel):
    name: str
    html_url: str
    description: Optional[str] = None
    language: Optional[str] = None
    topics: Optional[List[str]] = []
    stargazers_count: int
    updated_at: str
    fork: bool
    readme_excerpt: Optional[str] = None

class AnalyzeResponse(BaseModel):
    status: str = "ok"
    repos: List[RepoMetadata]
    jd_profile: JobDescriptionProfile
