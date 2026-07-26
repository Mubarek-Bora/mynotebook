# MyNotebook

An AI-powered personal notes app: write notes, search them by meaning (not just keywords) via vector embeddings, and get one-click AI summaries.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | FastAPI (Python), SQLModel, Postgres + pgvector |
| Embeddings | `sentence-transformers` (`all-MiniLM-L6-v2`), generated locally -- no extra API key |
| Summarization | Anthropic Claude (`claude-haiku-4-5`) |
| Auth | JWT (`python-jose`) + bcrypt |
| Frontend | React (Vite) |
| Deployment | Vercel (multi-service: FastAPI backend + Vite frontend in one project, see `vercel.json`) |

## How semantic search works

Every note's title + content is embedded into a 384-dimension vector on save. A search query is embedded the same way, and Postgres (via the `pgvector` extension) finds the closest notes by cosine distance -- so a search for "things I need to cook dinner" surfaces a note titled "Recipe idea" even though they share no exact words.

## Local development

### Backend
```bash
cd backend
python -m venv venv
./venv/Scripts/activate   # or source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
uvicorn app.main:app --reload
```
The backend auto-creates the `vector` extension and its tables on startup against whatever Postgres `DATABASE_URL` points to (a Neon database works well here).

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account, returns a JWT |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET | `/api/notes` | List your notes |
| POST | `/api/notes` | Create a note (embeds it) |
| PUT | `/api/notes/{id}` | Update a note (re-embeds it) |
| DELETE | `/api/notes/{id}` | Delete a note |
| GET | `/api/notes/search?q=...` | Semantic search across your notes |
| POST | `/api/notes/{id}/summarize` | AI-generate a short summary of a note |

## What's next

- PDF upload/parsing and bookmarking (out of scope for v1)
- Auto-tagging notes
- Frontend UI (in progress)
