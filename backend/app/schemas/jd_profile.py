from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class RoleType(str, Enum):
    ai_ml = "ai_ml"
    backend = "backend"
    frontend = "frontend"
    full_stack = "full_stack"
    data = "data"
    other = "other"

class JobDescriptionProfile(BaseModel):
    role_title: str = Field(description="The exact title of the role from the JD.")
    role_type: RoleType = Field(description="Categorized role type.")
    required_skills: List[str] = Field(description="List of required skills.")
    preferred_skills: List[str] = Field(description="List of preferred or bonus skills.")
    keywords: List[str] = Field(description="General tech keywords extracted from the JD.")
    responsibilities: List[str] = Field(description="List of core responsibilities.")
