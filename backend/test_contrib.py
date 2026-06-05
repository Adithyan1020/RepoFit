import asyncio
import os
from dotenv import load_dotenv
load_dotenv()
from app.services.github_service import fetch_contributed_repos, fetch_user_repos

async def test():
    username = "Adithyan1020" # Guessing from github link
    repos = await fetch_user_repos(username, limit=100)
    print(f"Found {len(repos)} total repos")
    forks = [r for r in repos if r.get('fork')]
    print(f"Forks: {len(forks)}")
    for f in forks:
        print(f['name'])

if __name__ == "__main__":
    asyncio.run(test())
