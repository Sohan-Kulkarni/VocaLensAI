# VocaLens AI - AI Interview Assistant

VocaLens AI is a production-style AI interview analysis platform built with React, Vite, Tailwind CSS, FastAPI, SQLAlchemy, and a modular ML/NLP pipeline. It lets users upload or record interview answers, transcribe speech, analyze communication quality, score technical relevance, generate feedback, export reports, and track performance over time.

## Screenshots

Add screenshots after running the app:

- `screenshots/landing.png`
- `screenshots/dashboard.png`
- `screenshots/upload.png`
- `screenshots/analysis-results.png`
- `screenshots/history.png`

## Features

- JWT authentication with registration and login
- Secure password hashing with Passlib and bcrypt
- Protected FastAPI REST APIs
- Audio upload for `mp3`, `wav`, `m4a`, plus browser recording formats `webm` and `ogg`
- In-browser recording with timer and playback
- Drag-and-drop audio upload
- Whisper-compatible transcription using `faster-whisper`
- Text transcript analysis mode for demos and fallback usage
- Interview analysis engine:
  - Words per minute
  - Filler word count, density, severity
  - Sentiment scoring
  - Confidence estimation
  - Grammar quality heuristics
  - Fluency and pause scoring
  - Technical keyword relevance
  - Overall interview readiness score
- Domain-specific technical scoring:
  - Software Engineering
  - AI/ML
  - Data Science
  - Web Development
  - Cloud/DevOps
- AI-style feedback:
  - Strengths
  - Weaknesses
  - Suggestions
  - Technical preparedness tips
  - Communication coaching
- Dashboard analytics with Recharts
- Radar, sentiment, filler, WPM, trend, and comparison charts
- Session history with search and filters
- Interview comparison for up to four sessions
- PDF report generation with ReportLab
- Docker and Docker Compose support
- Render backend and Vercel frontend deployment configs

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Axios
- React Router
- React Hot Toast
- Lucide React

### Backend

- Python
- FastAPI
- SQLAlchemy ORM
- SQLite
- JWT auth
- ReportLab

### ML/NLP

- Modular rule-based scoring services for reliable local demos
- Optional full ML stack in `backend/requirements-ml.txt`
- faster-whisper
- scikit-learn
- XGBoost
- NLTK
- spaCy
- Transformers

## Project Structure

```text
AI_Interview_Assistant/
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── ml/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── database.py
│   │   └── main.py
│   ├── uploads/
│   ├── reports/
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   └── requirements-ml.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── vercel.json
├── docker-compose.yml
├── render.yaml
└── README.md
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

On macOS/Linux:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Optional full local ML stack for real Whisper transcription:

```bash
pip install -r requirements-ml.txt
```

Backend URL:

```text
http://localhost:8000
```

API docs:

```text
http://localhost:8000/docs
```

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Environment Variables

### Backend

```env
APP_NAME=VocaLens AI
ENVIRONMENT=development
SECRET_KEY=change-this-secret-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./vocalens.db
BACKEND_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
UPLOAD_DIR=uploads
REPORT_DIR=reports
WHISPER_MODEL_SIZE=base
ENABLE_MOCK_TRANSCRIPTION=true
MAX_UPLOAD_MB=50
```

Keep `ENABLE_MOCK_TRANSCRIPTION=true` for a fast local demo without downloading or loading a Whisper model. Set it to `false` after installing `requirements-ml.txt` and `ffmpeg`.

### Frontend

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_SESSION_TIMEOUT_MINUTES=1440
```

## ML Pipeline

The ML engine lives in `backend/app/ml`.

- `transcriber.py` - faster-whisper speech-to-text wrapper
- `preprocessing.py` - text cleaning, tokenization, sentence features, grammar heuristics
- `filler.py` - filler word frequency, density, severity
- `sentiment.py` - NLTK VADER when available, fallback lexicon scoring
- `technical.py` - domain keyword matching and missing keyword detection
- `scoring.py` - WPM, pause, fluency, communication score
- `confidence.py` - confidence estimation from multiple signals
- `pipeline.py` - end-to-end scoring payload

## API Documentation

All authenticated endpoints require:

```http
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account and return JWT |
| POST | `/api/auth/login` | Login with email and password |
| GET | `/api/auth/me` | Current user |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/profile` | Profile and aggregate stats |

### Interviews

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interviews/upload` | Upload audio, transcribe, analyze |
| POST | `/api/interviews/analyze-text` | Analyze pasted transcript |
| GET | `/api/interviews/history` | Search and filter sessions |
| GET | `/api/interviews/{session_id}` | Fetch full session details |
| DELETE | `/api/interviews/{session_id}` | Delete a session |
| POST | `/api/interviews/compare` | Compare 2 to 4 sessions |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/{session_id}/pdf` | Download PDF report |
| GET | `/api/reports/{session_id}/summary` | Transcript summary |

## Docker

Create backend env file first:

```bash
cd backend
copy .env.example .env
cd ..
docker compose up --build
```

URLs:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8000`

## Deployment

### Frontend on Vercel

1. Import the repository in Vercel.
2. Set root directory to `frontend`.
3. Set environment variable:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

4. Deploy with the included `frontend/vercel.json`.

### Backend on Render

1. Use `render.yaml` as a Render blueprint or create a Web Service manually.
2. Set root directory to `backend`.
3. Build command:

```bash
pip install -r requirements.txt
```

4. Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

5. Set production environment variables:

```env
SECRET_KEY=<strong-random-secret>
BACKEND_CORS_ORIGINS=https://your-frontend-domain.vercel.app
DATABASE_URL=sqlite:///./vocalens.db
ENABLE_MOCK_TRANSCRIPTION=false
WHISPER_MODEL_SIZE=base
```

For production beyond a demo, use PostgreSQL instead of SQLite and configure persistent file storage for uploads and reports.

## Development Notes

- The database tables are created automatically when FastAPI starts.
- The base backend starts with `backend/requirements.txt`.
- Install `backend/requirements-ml.txt` for real faster-whisper transcription and heavier ML packages.
- The first `faster-whisper` run may download the configured model.
- `ffmpeg` is required for reliable audio decoding when mock transcription is disabled.
- Browser recording uses `webm`; uploaded files support `mp3`, `wav`, and `m4a`.
- Text analysis mode is useful for quick demos, test data, and environments without a local Whisper model.

## Future Improvements

- PostgreSQL production database
- Celery or RQ background jobs for long audio transcription
- WebSocket progress updates during transcription
- Real acoustic confidence features from volume, pitch, and pause timestamps
- LLM-generated feedback with guardrails
- Question bank and role-specific interview templates
- Team dashboards for mentors or placement cells
- Cloud object storage for audio and reports
- Unit and integration test suites
- CI/CD pipeline with automated build checks
