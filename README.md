# JobHunt — AI-Powered Job Portal

> Built to solve real problems that Naukri and LinkedIn don't — AI match scoring, semantic search, and real-time pipeline tracking.

## What is this?

JobHunt is a full-stack job portal I built from scratch over 10 days. It is not a CRUD app. It is a production-grade system with async task processing, WebSocket real-time updates, AI resume analysis, and semantic search powered by Google Gemini.

The idea came from a real frustration — job seekers apply to 100 jobs blindly and hear nothing. Recruiters drown in 500 unranked resumes. JobHunt fixes both sides of that problem.

## The Problems It Solves

**For job seekers**
- No more blind applications — get a 0–100 AI match score before you apply
- Know exactly which skills you are missing for a role
- Get personalized interview questions based on your actual resume and the specific job
- Track every status change in real time without refreshing

**For recruiters**
- Applicants auto-ranked by AI match score — no more reading 500 resumes
- Full hiring pipeline with enforced stage transitions
- Real-time notifications when candidates apply
- Analytics dashboard with hiring funnel data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Django, Django REST Framework |
| Database | MySQL with query optimization and indexing |
| Cache | Redis with cache invalidation strategy |
| Async | Celery + Redis broker |
| Real-time | Django Channels + WebSockets |
| AI | Google Gemini API |
| Frontend | React, React Query, Zustand, Recharts |
| Deployment | Docker, Nginx, GitHub Actions CI/CD |

## AI Features

**Resume Analyzer** — Uploads a PDF, extracts raw text with PyMuPDF, sends to Gemini, gets back structured JSON of skills, experience, and education. Stored in database and linked to the user profile.

**Job Match Scoring** — Compares candidate's AI-extracted skills against job requirements. Returns a 0–100 score with matched skills and missing skills. Recruiters see all applicants ranked by this score.

**Semantic Search** — Every job gets converted to an embedding vector by Gemini and stored in MySQL. When a user searches, their query becomes a vector too. We find jobs by cosine similarity — not keyword matching. Searching "backend developer who works with databases" finds Django Developer jobs even with zero word overlap.

**Interview Prep** — Sends the candidate's resume text and the job description together to Gemini. Generates 5 technical and 5 behavioral questions personalised to that specific candidate applying to that specific role.

**Cover Letter Generator** — Tailored cover letter generated from resume + job description. Not a template. Unique to each application.

## System Architecture
Browser (React)
↓
Nginx
↓ ↓
Django REST Django Channels
(HTTP) (WebSockets)
↓
MySQL Redis Gemini API
↓
Celery Worker

## Key Engineering Decisions

**Why JWT over sessions** — Stateless authentication scales horizontally without shared session storage. Access token expires in 60 minutes, refresh token in 7 days.

**Why Celery for emails** — Never block a web request with slow I/O. When Naveen applies, Django responds in under 100ms. Celery sends the email in the background.

**Why state machine for applications** — Business logic enforced at the API layer. You cannot jump from Applied to Offer. Invalid transitions return a 400 with the allowed next steps listed.

**Why Redis caching** — Job listings cached for 15 minutes. Cache invalidated on job create, update, or delete. Second person searching the same query gets instant response.

**Why semantic search over full-text** — MySQL FULLTEXT misses synonyms. Embeddings understand meaning. Recruiter who writes "SDE" gets found when candidate searches "software developer".

## Local Setup

```bash
# Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
daphne -p 8000 core.asgi:application

# Celery (second terminal)
celery -A core worker --loglevel=info --pool=solo

# Frontend (third terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

## Docker Setup

```bash
docker compose up --build
```

Visit `http://localhost`

## Environment Variables
SECRET_KEY=
DB_NAME=jobhunt_db
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
REDIS_URL=redis://127.0.0.1:6379/0
GEMINI_API_KEY=
## API Reference
POST /api/auth/register/ Register as job seeker or recruiter
POST /api/auth/login/ Login and receive JWT tokens
GET /api/jobs/ List jobs with filters and search
POST /api/jobs/create/ Post a job (recruiter only)
GET /api/jobs/semantic-search/?q=query AI semantic search
POST /api/applications/apply/ Apply for a job
PATCH /api/applications/{id}/status/ Move candidate through pipeline
POST /api/ai/resume/upload/ Upload resume for AI analysis
GET /api/ai/match/{job_id}/ Get AI match score for a job
GET /api/ai/interview-prep/{app_id}/ Get personalised interview questions
POST /api/ai/cover-letter/{job_id}/ Generate cover letter
GET /api/analytics/recruiter/ Recruiter dashboard data
GET /api/analytics/jobseeker/ Job seeker dashboard data
WS /ws/notifications/ Real-time notifications

## What I Learned Building This

- Async task processing with Celery — why you never block web requests with slow operations
- WebSocket authentication — JWT inside the WebSocket handshake query parameter
- State machine pattern — enforcing business rules at the serializer level
- Cache invalidation — harder than caching, critical for data consistency  
- Embedding-based search — converting meaning to math and back again
- Docker multi-stage builds — Node builds the React bundle, Nginx serves it

---

Built by Naveen — Self-taught Backend Developer
[GitHub](https://github.com/iamnaveen-dev/) · [LinkedIn](https://linkedin.com/in/naveentechie/)
