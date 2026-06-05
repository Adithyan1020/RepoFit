from typing import Dict, Any, List

COMMON_TOOLS = {
    "react", "vite", "fastapi", "flask", "tensorflow", "pytorch", 
    "docker", "supabase", "redis", "langchain", "nodejs", "express", 
    "django", "mongodb", "postgresql", "mysql", "kubernetes", "aws"
}

def detect_tools(text: str, topics: List[str]) -> List[str]:
    detected = set()
    text_lower = text.lower()
    for tool in COMMON_TOOLS:
        if tool in text_lower or tool in topics:
            detected.add(tool)
    return list(detected)

def infer_project_type(language: str, tools: set) -> str:
    lang = (language or "").lower()
    
    if "tensorflow" in tools or "pytorch" in tools or "langchain" in tools or "jupyter notebook" in lang:
        return "ml_ai"
    if "react" in tools or "vite" in tools or "vue" in tools or lang in ["html", "css"]:
        if "fastapi" in tools or "flask" in tools or "express" in tools or "django" in tools:
            return "full_stack"
        return "frontend"
    if "fastapi" in tools or "flask" in tools or "express" in tools or "django" in tools:
        return "backend"
    
    if lang in ["javascript", "typescript", "python", "go", "java", "c#", "ruby"]:
        return "backend_or_full_stack"
        
    return "other"

def extract_repo_features(repo_data: Dict[str, Any], readme_excerpt: str) -> Dict[str, Any]:
    name = repo_data.get("name", "")
    description = repo_data.get("description") or ""
    language = repo_data.get("language") or ""
    topics = repo_data.get("topics", [])
    
    combined_text = f"{name} {description} {readme_excerpt} " + " ".join(topics)
    
    detected_tools = detect_tools(combined_text, topics)
    project_type = infer_project_type(language, set(detected_tools))
    
    return {
        "repo_name": name,
        "short_description": description,
        "dominant_language": language,
        "topics": topics,
        "readme_excerpt": readme_excerpt,
        "detected_tools": detected_tools,
        "project_type": project_type
    }
