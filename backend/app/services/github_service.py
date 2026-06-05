import httpx
import os
from typing import List, Dict, Any

GITHUB_API_URL = "https://api.github.com"
GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"

def _get_headers() -> Dict[str, str]:
    headers = {"Accept": "application/vnd.github.v3+json"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers

async def fetch_user_repos(username: str, limit: int = 20) -> List[Dict[str, Any]]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{GITHUB_API_URL}/users/{username}/repos",
            headers=_get_headers(),
            params={"sort": "updated", "per_page": 100}
        )
        if response.status_code == 403:
            raise Exception("GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to your .env file.")
        if response.status_code != 200:
            return []
        repos = response.json()
        # Include all repos, including forks, so users can see projects they forked and contributed to
        return repos[:limit]

async def fetch_contributed_repos(username: str, limit: int = 10) -> List[Dict[str, Any]]:
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("NO TOKEN")
        return []
        
    query = """
    query($login: String!, $limit: Int!) {
      user(login: $login) {
        repositoriesContributedTo(first: $limit, contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY], orderBy: {field: PUSHED_AT, direction: DESC}) {
          nodes {
            name
            owner { login }
            description
            url
            stargazerCount
            primaryLanguage { name }
            repositoryTopics(first: 5) { nodes { topic { name } } }
            updatedAt
            isFork
          }
        }
      }
    }
    """
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            GITHUB_GRAPHQL_URL,
            headers=_get_headers(),
            json={"query": query, "variables": {"login": username, "limit": limit}}
        )
        print("GRAPHQL STATUS:", response.status_code)
        data = response.json()
        print("GRAPHQL DATA:", data)
        
        if response.status_code != 200:
            return []
            
        if "errors" in data:
            return []
            
        nodes = data.get("data", {}).get("user", {}).get("repositoriesContributedTo", {}).get("nodes", [])
        
        # Map GraphQL response to our REST-like dictionary structure so downstream code doesn't break
        mapped_repos = []
        for node in nodes:
            topics = [t["topic"]["name"] for t in node.get("repositoryTopics", {}).get("nodes", [])]
            mapped_repos.append({
                "name": node["name"],
                "owner_login": node["owner"]["login"], # Used for README fetch
                "html_url": node["url"],
                "description": node["description"],
                "language": node["primaryLanguage"]["name"] if node.get("primaryLanguage") else None,
                "topics": topics,
                "stargazers_count": node.get("stargazerCount", 0),
                "updated_at": node.get("updatedAt"),
                "fork": node.get("isFork", False)
            })
            
        return mapped_repos

async def fetch_repo_readme(username: str, repo_name: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{GITHUB_API_URL}/repos/{username}/{repo_name}/readme",
            headers=_get_headers()
        )
        if response.status_code == 403:
             raise Exception("GitHub API rate limit exceeded while fetching READMEs. Please add a GITHUB_TOKEN to your .env file.")
        if response.status_code == 200:
            return response.json()
        return {}
