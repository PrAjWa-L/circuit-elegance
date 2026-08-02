# VOLTCORE Backend

FastAPI backend for the VOLTCORE industrial electrical distributor frontend.

## Stack

- Python 3.12+
- FastAPI
- PostgreSQL
- SQLAlchemy 2.x
- Alembic
- Pydantic v2
- JWT authentication (access + refresh tokens)

## Setup

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Create the database:

```bash
createdb voltcore
```

Run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Default admin (from seed migration)

- Email: `admin@voltcore.io`
- Password: `changeme` (override via `.env`)

## API docs

- Swagger UI: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Frontend connection

Set in `frontend/.env`:

```
VITE_API_URL=http://localhost:8000/api/v1
```

## Endpoints (Phase 1)

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/refresh` | Public |
| POST | `/api/v1/auth/logout` | Public |
| GET | `/api/v1/auth/me` | Admin |
| GET | `/api/v1/products` | Public |
| GET | `/api/v1/products/{slug}` | Public |
| GET | `/api/v1/categories` | Public |
| GET | `/api/v1/company` | Public |
| CRUD | `/api/v1/admin/products/*` | Admin |
| CRUD | `/api/v1/admin/categories/*` | Admin |
| PUT/POST | `/api/v1/admin/company/*` | Admin |
| POST | `/api/v1/admin/uploads` | Admin |

Uploaded files are served from `/uploads/`.
