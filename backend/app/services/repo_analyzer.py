from typing import Dict, Any, List

def infer_project_type(language: str, topics: List[str]) -> str:
    lang = (language or "").lower()
    topics_set = set(t.lower() for t in topics)
    
    if "tensorflow" in topics_set or "pytorch" in topics_set or "langchain" in topics_set or "jupyter notebook" in lang:
        return "ml_ai"
    if "react" in topics_set or "vite" in topics_set or "vue" in topics_set or lang in ["html", "css"]:
        if "fastapi" in topics_set or "flask" in topics_set or "express" in topics_set or "django" in topics_set:
            return "full_stack"
        return "frontend"
    if "fastapi" in topics_set or "flask" in topics_set or "express" in topics_set or "django" in topics_set:
        return "backend"
    
    if lang in ["javascript", "typescript", "python", "go", "java", "c#", "ruby"]:
        return "backend_or_full_stack"
        
    return "other"

def extract_repo_features(repo_data: Dict[str, Any], readme_excerpt: str) -> Dict[str, Any]:
    name = repo_data.get("name", "")
    description = repo_data.get("description") or ""
    language = repo_data.get("language") or ""
    topics = repo_data.get("topics", [])
    
    project_type = infer_project_type(language, topics)
    
    return {
        "repo_name": name,
        "short_description": description,
        "dominant_language": language,
        "topics": topics,
        "readme_excerpt": readme_excerpt,
        "project_type": project_type
    }
