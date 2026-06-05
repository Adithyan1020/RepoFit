from fastapi import APIRouter, HTTPException
from app.schemas.request import AnalyzeRequest
from app.schemas.response import AnalyzeResponse, RepoMatch
from app.services.github_service import fetch_user_repos, fetch_repo_readme, fetch_contributed_repos
from app.services.llm_service import extract_jd_profile, evaluate_repo_match
from app.services.repo_analyzer import extract_repo_features
from app.services.scoring import calculate_keyword_score, calculate_stack_score, calculate_text_relevance_score, calculate_hybrid_score
from app.utils.text import decode_base64_readme
import asyncio

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
        
        # 2. Fetch READMEs and compute base features/scores for top 20 repos
        top_repos = unique_repos[:20]
        
        async def process_repo(repo):
            # For contributed repos, the owner might not be the user
            repo_owner = repo.get("owner_login", request.github_username)
            readme_data = await fetch_repo_readme(repo_owner, repo["name"])
            readme_content = readme_data.get("content", "")
            readme_excerpt = decode_base64_readme(readme_content) if readme_content else ""
            
            features = extract_repo_features(repo, readme_excerpt)
            
            # Deterministic scores
            kw_score = calculate_keyword_score(jd_profile, features)
            st_score = calculate_stack_score(jd_profile, features)
            tr_score = calculate_text_relevance_score(jd_profile, features)
            
            # We'll return these so we can do the LLM step next
            return {
                "repo": repo,
                "features": features,
                "kw_score": kw_score,
                "st_score": st_score,
                "tr_score": tr_score
            }

        processed_repos = await asyncio.gather(*(process_repo(r) for r in top_repos))
        
        # 3. Sort by deterministic score to pick top 5 for LLM reasoning
        # This saves tokens rather than evaluating all 20 with the LLM
        processed_repos.sort(key=lambda x: x["kw_score"] + x["st_score"] + x["tr_score"], reverse=True)
        top_candidates = processed_repos[:5]
        
        # 4. LLM reasoning for top 5 candidates
        async def evaluate_candidate(candidate, index):
            # Generate resume bullets only for top 3
            generate_bullets = index < 3
            llm_result = await evaluate_repo_match(jd_profile, candidate["features"], generate_bullets)
            
            final_score = calculate_hybrid_score(
                candidate["kw_score"], 
                candidate["tr_score"], 
                candidate["st_score"], 
                llm_result["fit_score"]
            )
            
            return RepoMatch(
                repo_name=candidate["repo"]["name"],
                score=int(final_score),
                project_type=candidate["features"]["project_type"],
                matching_skills=llm_result["matching_skills"],
                missing_skills=llm_result["missing_skills"],
                why_it_matches=llm_result["why_it_matches"],
                resume_bullets=llm_result.get("resume_bullets", [])
            )
            
        candidate_tasks = [evaluate_candidate(c, i) for i, c in enumerate(top_candidates)]
        final_matches = await asyncio.gather(*candidate_tasks)
        
        # Sort again by final hybrid score
        final_matches.sort(key=lambda x: x.score, reverse=True)
        
        return AnalyzeResponse(
            status="ok",
            job_profile=jd_profile,
            top_matches=final_matches
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
