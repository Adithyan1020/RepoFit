from fastapi import APIRouter, HTTPException
from app.schemas.request import AnalyzeRequest
from app.schemas.response import AnalyzeResponse, RepoMetadata
from app.services.github_service import fetch_user_repos, fetch_repo_readme
from app.services.llm_service import extract_jd_profile
from app.utils.text import decode_base64_readme
import asyncio

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_profile(request: AnalyzeRequest):
    try:
        # 1. Fetch repositories
        repos_data = await fetch_user_repos(request.github_username)
        
        # 2. Extract JD Profile using LLM
        # Run JD extraction concurrently with README fetching for performance
        jd_task = asyncio.create_task(extract_jd_profile(request.job_description))
        
        # 3. Fetch READMEs for top repos (e.g., top 5)
        top_repos = repos_data[:5]
        
        async def enrich_repo(repo):
            readme_data = await fetch_repo_readme(request.github_username, repo["name"])
            readme_content = readme_data.get("content", "")
            readme_excerpt = decode_base64_readme(readme_content) if readme_content else None
            
            return RepoMetadata(
                name=repo.get("name"),
                html_url=repo.get("html_url"),
                description=repo.get("description"),
                language=repo.get("language"),
                topics=repo.get("topics", []),
                stargazers_count=repo.get("stargazers_count", 0),
                updated_at=repo.get("updated_at"),
                fork=repo.get("fork", False),
                readme_excerpt=readme_excerpt
            )

        enriched_repos_tasks = [enrich_repo(repo) for repo in top_repos]
        
        enriched_repos = await asyncio.gather(*enriched_repos_tasks)
        jd_profile = await jd_task
        
        return AnalyzeResponse(
            status="ok",
            repos=enriched_repos,
            jd_profile=jd_profile
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
