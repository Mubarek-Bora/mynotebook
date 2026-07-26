# MyNotebook

An AI-powered personal notes app: write notes, search them by meaning (not just keywords) via vector embeddings, and get one-click AI summaries.

**Live:** https://second-brain-navy-nine.vercel.app

## Tech stack

| Layer | Choice |
|---|---|
| Backend | FastAPI (Python), SQLModel, Postgres + pgvector |
| Embeddings | `fastembed` (`BAAI/bge-small-en-v1.5`, ONNX runtime), generated locally -- no extra API key |
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

## Deploying to Vercel

This started out as `sentence-transformers`, which pulls in full PyTorch -- the bundled function came out to 4.8GB against Vercel's 500MB Python function limit. Switched to `fastembed` (ONNX runtime, same 384-dim output) to fix that.

That surfaced a second issue: Vercel's Python functions have a **read-only filesystem except `/tmp`**, and fastembed's downloader (via `huggingface_hub`) doesn't fully respect the `cache_dir` argument on its own -- it still tried to write to the default (read-only) cache location. Fixed by forcing `HF_HOME`, `HF_HUB_CACHE`, and `XDG_CACHE_HOME` to `/tmp` *before* importing `fastembed` (see `app/embeddings.py`), in addition to passing `cache_dir="/tmp/fastembed_cache"` to `TextEmbedding`.

## What's next

- PDF upload/parsing and bookmarking (out of scope for v1)
- Auto-tagging notes
- Separate the local-dev and production databases (they currently share one Neon instance)
