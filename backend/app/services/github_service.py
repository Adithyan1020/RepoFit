import httpx
import os
from typing import List, Dict, Any

GITHUB_API_URL = "https://api.github.com"

def _get_headers() -> Dict[str, str]:
    headers = {"Accept": "application/vnd.github.v3+json"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers

async def fetch_user_repos(username: str, limit: int = 15) -> List[Dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API_URL}/users/{username}/repos",
            headers=_get_headers(),
            params={"sort": "updated", "per_page": 100}
        )
        if response.status_code != 200:
            return []
        
        repos = response.json()
        # Filter out forks
        non_forks = [repo for repo in repos if not repo.get("fork")]
        return non_forks[:limit]

async def fetch_repo_readme(username: str, repo_name: str) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API_URL}/repos/{username}/{repo_name}/readme",
            headers=_get_headers()
        )
        if response.status_code == 200:
            return response.json()
        return {}
