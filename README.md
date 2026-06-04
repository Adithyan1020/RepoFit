# RepoFit Day 1

Data Ingestion Foundation for RepoFit.

## Setup

### Backend

1. Navigate to `backend`
2. Create virtual environment and install requirements: `python -m venv venv` and `pip install -r requirements.txt`
3. Set `GROQ_API_KEY` and optionally `GITHUB_TOKEN` in `.env`
4. Run: `uvicorn app.main:app --reload`

### Frontend

1. Navigate to `frontend`
2. Run `npm install`
3. Run `npm run dev`
