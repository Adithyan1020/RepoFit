from fastapi import APIRouter, HTTPException
from app.schemas.request import AnalyzeRequest
from app.schemas.response import AnalyzeResponse, RepoMatch
from app.services.github_service import fetch_user_repos, fetch_repo_readme, fetch_contributed_repos
from app.services.llm_service import extract_jd_profile, evaluate_repo_match
from app.services.repo_analyzer import extract_repo_features
from app.utils.text import decode_base64_readme
import asyncio
import traceback

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_profile(request: AnalyzeRequest):
    try:
        # 1. Fetch repositories (owned and contributed) and extract JD profile concurrently
        owned_repos_task = fetch_user_repos(request.github_username)
        contributed_repos_task = fetch_contributed_repos(request.github_username)
        jd_task = extract_jd_profile(request.job_description)
        
        owned_repos, contributed_repos, jd_profile = await asyncio.gather(
            owned_repos_task,
            contributed_repos_task,
            jd_task
        )
        
        # Combine and deduplicate repos by URL
        all_repos = owned_repos + contributed_repos
        seen_urls = set()
        unique_repos = []
        for repo in all_repos:
            if repo["html_url"] not in seen_urls:
                seen_urls.add(repo["html_url"])
                unique_repos.append(repo)
        
        # 2. Fetch READMEs and compute base features for top 15 repos
        top_repos = unique_repos[:15]
        
        async def process_repo(repo):
            # For contributed repos, the owner might not be the user
            repo_owner = repo.get("owner_login", request.github_username)
            readme_data = await fetch_repo_readme(repo_owner, repo["name"])
            readme_content = readme_data.get("content", "")
            readme_excerpt = decode_base64_readme(readme_content) if readme_content else ""
            
            features = extract_repo_features(repo, readme_excerpt)
            return {
                "repo": repo,
                "features": features
            }

        processed_repos = await asyncio.gather(*(process_repo(r) for r in top_repos))
        
        # 3. LLM reasoning for all 15 candidates
        async def evaluate_candidate(candidate, index):
            # Generate resume bullets for all since it's cheap and fast, or limit to top 3?
            # We don't know the rank yet, so we just generate them for all to do it in one pass.
            llm_result = await evaluate_repo_match(jd_profile, candidate["features"], generate_bullets=True)
            
            return RepoMatch(
                repo_name=candidate["repo"]["name"],
                score=int(llm_result["fit_score"]),
                project_type=candidate["features"]["project_type"],
                matching_skills=llm_result["matching_skills"],
                missing_skills=llm_result["missing_skills"],
                why_it_matches=llm_result["why_it_matches"],
                resume_bullets=llm_result.get("resume_bullets", [])
            )
            
        candidate_tasks = [evaluate_candidate(c, i) for i, c in enumerate(processed_repos)]
        final_matches = await asyncio.gather(*candidate_tasks)
        
        # 4. Sort by final LLM score
        final_matches.sort(key=lambda x: x.score, reverse=True)
        
        # Cap to top 5 for the UI
        return AnalyzeResponse(
            status="ok",
            job_profile=jd_profile,
            top_matches=final_matches[:5]
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
