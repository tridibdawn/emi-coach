# EMI Coach backend

Metadata-only FastAPI service. **Not a financial ledger.**

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload --app-dir .
```

- `GET /health` — liveness
- `GET /ready` — readiness (`SKIP_DB_CHECK=true` skips PostgreSQL)

PostgreSQL (optional locally):

```bash
docker compose up -d postgres
```
