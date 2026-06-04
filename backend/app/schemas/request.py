from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    github_username: str
    job_description: str
