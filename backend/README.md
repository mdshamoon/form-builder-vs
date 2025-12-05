# Format Forge Mobile - Backend API

Mobile-first FastAPI backend for the Format Forge template builder with canvas-based editing.

## Features

- ✅ **FastAPI** - Modern, fast Python web framework
- ✅ **UV** - Lightning-fast Python package manager
- ✅ **PostgreSQL** - Robust relational database with JSON support
- ✅ **Alembic** - Database migration management
- ✅ **Structured Logging** - JSON-formatted logs with structlog
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Pydantic** - Data validation and settings management
- ✅ **Type Hints** - Full Python type annotations

## Quick Start

```bash
# 1. Install dependencies
uv sync

# 2. Start PostgreSQL (via Docker)
docker-compose up -d db

# 3. Run migrations
uv run alembic upgrade head

# 4. Start server
uv run uvicorn app.main:app --reload
```

Visit http://localhost:8000/docs for interactive API documentation.

## Full Documentation

See [Backend Documentation](./docs/SETUP.md) for complete setup instructions.

## API Endpoints

- `GET /` - Health check
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/templates` - List templates
- `POST /api/v1/templates` - Create template
- `POST /api/v1/submissions` - Submit form

See `/docs` for full API documentation.
