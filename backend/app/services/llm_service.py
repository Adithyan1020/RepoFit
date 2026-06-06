import os
import json
from groq import AsyncGroq
from app.schemas.jd_profile import JobDescriptionProfile

SYSTEM_PROMPT = """You are an information extraction system.
Extract job description details into valid JSON only.
Do not include commentary.
Only use fields defined in the schema.
Infer conservatively from the text.
CRITICAL RULE: IGNORE all soft skills (e.g., communication, teamwork, fast learner) and educational requirements (e.g., Bachelor's degree, Masters). ONLY extract hard technical skills, tools, and frameworks.
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
        model="llama-3.3-70b-versatile",
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
Carefully read the Repository Features and determine if the required or preferred skills from the Job Description are present (even if written slightly differently, e.g. "React.js" vs "react").

STRICT SCORING RUBRIC:
1. Base Score starts at 100.
2. CRITICAL PENALTY: If the primary programming language of the repository completely mismatches the language explicitly required by the Job Description (e.g., JD requires Python but repo is Java/C#), DEDUCT 50 points immediately.
3. DEDUCT 15 points for EVERY "Required Skill" from the JD that is completely missing from the repository features.
4. DEDUCT 5 points for EVERY "Preferred Skill" that is missing.
5. You may ADD up to 10 bonus points if the repository perfectly aligns with the domain/responsibilities (e.g., an AI/ML project for an AI Developer role).
6. If your final calculated score is less than 0, you MUST return exactly 0. Do NOT return a negative number and do NOT return 100.
7. If the repository appears to be just a GitHub Profile README (e.g. the repo name is the same as the username) or has no actual project code, the fit_score MUST be 0.

Return ONLY valid JSON with exactly these fields:
- fit_score (integer 0-100, calculated using the strict rubric above)
- project_type (string: a short 1-3 word classification of what the repo actually is, e.g., 'Web App', 'Python Library', 'Data Pipeline')
- matching_skills (list of strings, exact skills from the JD that are found in the repo)
- missing_skills (list of strings, skills from the JD that are missing)
- why_it_matches (string: 1-2 sentence explanation of the evidence, explicitly mention if it was penalized for wrong language)
- resume_bullets (list of strings: 2 bullet points for a resume if applicable, or empty list)
"""

async def evaluate_repo_match(jd_profile: JobDescriptionProfile, repo_features: dict, generate_bullets: bool = False) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"fit_score": 0, "matching_skills": [], "missing_skills": [], "why_it_matches": "API Key missing", "resume_bullets": []}
    
    client = AsyncGroq(api_key=api_key)
    
    prompt = f"""Job Description Profile:
Role: {jd_profile.role_title} ({jd_profile.role_type})
Required Skills: {', '.join(jd_profile.required_skills)}
Preferred Skills: {', '.join(jd_profile.preferred_skills)}
Responsibilities: {', '.join(jd_profile.responsibilities)}

Repository Features:
Name: {repo_features['repo_name']}
Description: {repo_features['short_description']}
Language: {repo_features['dominant_language']}
Topics: {', '.join(repo_features.get('topics', []))}
README Excerpt: {repo_features['readme_excerpt'][:1500]}

Evaluate this repository. Generate resume bullets? {'Yes' if generate_bullets else 'No'}
Return JSON.
"""
    try:
        response = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": EVAL_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        
        def sanitize_list(lst):
            if not isinstance(lst, list):
                return []
            clean = []
            for item in lst:
                if isinstance(item, list):
                    clean.append(", ".join(str(x) for x in item))
                else:
                    clean.append(str(item))
            return clean

        # Ensure fallback defaults and sanitize types
        return {
            "fit_score": int(data.get("fit_score", 0)),
            "project_type": str(data.get("project_type", "Unknown Project")),
            "matching_skills": sanitize_list(data.get("matching_skills", [])),
            "missing_skills": sanitize_list(data.get("missing_skills", [])),
            "why_it_matches": str(data.get("why_it_matches", "No explanation provided.")),
            "resume_bullets": sanitize_list(data.get("resume_bullets", [])) if generate_bullets else []
        }
    except Exception as e:
        return {"fit_score": 0, "project_type": "Unknown", "matching_skills": [], "missing_skills": [], "why_it_matches": "Failed to analyze.", "resume_bullets": []}
