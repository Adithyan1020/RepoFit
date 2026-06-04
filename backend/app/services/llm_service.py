import os
import json
from groq import AsyncGroq
from app.schemas.jd_profile import JobDescriptionProfile

SYSTEM_PROMPT = """You are an information extraction system.
Extract job description details into valid JSON only.
Do not include commentary.
Only use fields defined in the schema.
Infer conservatively from the text.
"""

async def extract_jd_profile(jd_text: str) -> JobDescriptionProfile:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set")
    
    client = AsyncGroq(api_key=api_key)
    
    prompt = f"""Extract the following fields:
- role_title
- role_type
- required_skills
- preferred_skills
- keywords
- responsibilities

Job description:
{jd_text}
"""
    
    response = await client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        model="llama3-8b-8192",
        response_format={"type": "json_object"}
    )
    
    content = response.choices[0].message.content
    try:
        data = json.loads(content)
        return JobDescriptionProfile(**data)
    except Exception as e:
        # Fallback empty profile in case of failure
        from app.schemas.jd_profile import RoleType
        return JobDescriptionProfile(
            role_title="Unknown",
            role_type=RoleType.other,
            required_skills=[],
            preferred_skills=[],
            keywords=[],
            responsibilities=[]
        )
