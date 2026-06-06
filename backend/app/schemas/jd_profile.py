from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class JobDescriptionProfile(BaseModel):
    role_title: str = Field(description="The exact title of the role from the JD.")
    role_type: str = Field(description="A short 1-3 word category for this role (e.g., Data Science, Mobile Engineering, DevSecOps).")
    required_skills: List[str] = Field(description="List of required skills.")
    preferred_skills: List[str] = Field(description="List of preferred or bonus skills.")
    keywords: List[str] = Field(description="General tech keywords extracted from the JD.")
    responsibilities: List[str] = Field(description="List of core responsibilities.")
