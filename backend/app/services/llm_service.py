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
        model="llama-3.1-8b-instant",
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

EVAL_SYSTEM_PROMPT = """You are an expert technical recruiter and software engineer.
Evaluate a GitHub repository against a Job Description profile.
Return ONLY valid JSON with exactly these fields:
- fit_score (integer 0-100)
- matching_skills (list of strings)
- missing_skills (list of strings)
- why_it_matches (string: 1-2 sentence explanation of the evidence)
- resume_bullets (list of strings: 2 bullet points for a resume if applicable, or empty list)
"""

async def evaluate_repo_match(jd_profile: JobDescriptionProfile, repo_features: dict, generate_bullets: bool = False) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"fit_score": 0, "matching_skills": [], "missing_skills": [], "why_it_matches": "API Key missing", "resume_bullets": []}
    
    client = AsyncGroq(api_key=api_key)
    
    prompt = f"""Job Description Profile:
Role: {jd_profile.role_title} ({jd_profile.role_type.value})
Required Skills: {', '.join(jd_profile.required_skills)}
Preferred Skills: {', '.join(jd_profile.preferred_skills)}
Responsibilities: {', '.join(jd_profile.responsibilities)}

Repository Features:
Name: {repo_features['repo_name']}
Description: {repo_features['short_description']}
Language: {repo_features['dominant_language']}
Detected Tools: {', '.join(repo_features['detected_tools'])}
README Excerpt: {repo_features['readme_excerpt'][:1000]}

Evaluate this repository. Generate resume bullets? {'Yes' if generate_bullets else 'No'}
Return JSON.
"""
    try:
        response = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": EVAL_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        # Ensure fallback defaults
        return {
            "fit_score": int(data.get("fit_score", 0)),
            "matching_skills": data.get("matching_skills", []),
            "missing_skills": data.get("missing_skills", []),
            "why_it_matches": data.get("why_it_matches", "No explanation provided."),
            "resume_bullets": data.get("resume_bullets", []) if generate_bullets else []
        }
    except Exception as e:
        return {"fit_score": 0, "matching_skills": [], "missing_skills": [], "why_it_matches": "Failed to analyze.", "resume_bullets": []}
