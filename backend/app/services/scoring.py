from app.schemas.jd_profile import JobDescriptionProfile
from typing import Dict, Any

def calculate_keyword_score(jd_profile: JobDescriptionProfile, repo_features: Dict[str, Any]) -> float:
    keywords = set(k.lower() for k in jd_profile.keywords)
    if not keywords:
        return 0.0
        
    combined_text = f"{repo_features['repo_name']} {repo_features['short_description']} {repo_features['readme_excerpt']}".lower()
    topics = set(t.lower() for t in repo_features['topics'])
    
    matches = 0
    for kw in keywords:
        if kw in combined_text or kw in topics:
            matches += 1
            
    return (matches / len(keywords)) * 100.0

def calculate_stack_score(jd_profile: JobDescriptionProfile, repo_features: Dict[str, Any]) -> float:
    req_skills = set(s.lower() for s in jd_profile.required_skills)
    pref_skills = set(s.lower() for s in jd_profile.preferred_skills)
    all_target_skills = req_skills | pref_skills
    
    if not all_target_skills:
        return 0.0
        
    detected_tools = set(t.lower() for t in repo_features['detected_tools'])
    lang = repo_features['dominant_language'].lower() if repo_features['dominant_language'] else ""
    if lang:
        detected_tools.add(lang)
        
    # Weight required skills slightly more
    score = 0.0
    max_score = len(req_skills) * 1.5 + len(pref_skills) * 1.0
    
    for s in req_skills:
        if s in detected_tools:
            score += 1.5
    for s in pref_skills:
        if s in detected_tools:
            score += 1.0
            
    if max_score == 0:
        return 0.0
        
    return (score / max_score) * 100.0

def calculate_text_relevance_score(jd_profile: JobDescriptionProfile, repo_features: Dict[str, Any]) -> float:
    # A simple proxy for text relevance without embedding: matching responsibilities/role type
    score = 0.0
    text = f"{repo_features['short_description']} {repo_features['readme_excerpt']}".lower()
    
    if jd_profile.role_type.value.lower() in text:
        score += 50.0
        
    # check responsibilities
    resp_matches = 0
    for resp in jd_profile.responsibilities:
        words = set(resp.lower().split())
        match_count = sum(1 for w in words if len(w) > 4 and w in text)
        if match_count > 0:
            resp_matches += 1
            
    if jd_profile.responsibilities:
        score += (resp_matches / len(jd_profile.responsibilities)) * 50.0
        
    return min(100.0, score)

def calculate_hybrid_score(keyword_score: float, text_relevance_score: float, stack_score: float, llm_score: float) -> float:
    return (
        0.35 * keyword_score +
        0.25 * text_relevance_score +
        0.20 * stack_score +
        0.20 * llm_score
    )
