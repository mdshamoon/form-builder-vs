# Getting Started with Format Forge Mobile

Complete setup guide for the mobile-first template form builder.

## Prerequisites

Install these before starting:

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **UV** - Python package manager

```bash
# Install UV (macOS/Linux)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install UV (Windows)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

## Quick Start (5 minutes)

### Option 1: Docker (Easiest)

```bash
cd backend
docker-compose up
```

This starts:
- PostgreSQL on port 5432
- Backend API on port 8000

Then in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on port 5173.

### Option 2: Manual Setup

#### 1. Setup Database

```bash
# Create database
createdb format_forge_mobile

# Or using psql
psql -U postgres
CREATE DATABASE format_forge_mobile;
\q
```

#### 2. Setup Backend

```bash
cd backend

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
uv run alembic upgrade head

# Start server
uv run uvicorn app.main:app --reload
```

Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs

#### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start dev server
npm run dev
```

Frontend: http://localhost:5173

## First Steps

### 1. Access the App

Open http://localhost:5173 in your browser.

### 2. Create a Template (via API)

The frontend expects templates to exist. Create one via the API:

```bash
curl -X POST http://localhost:8000/api/v1/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample CV Template",
    "description": "A simple CV template for testing",
    "template_type": "cv",
    "is_public": true,
    "fields": [
      {
        "id": "full_name",
        "label": "Full Name",
        "type": "text",
        "required": true,
        "placeholder": "Enter your full name"
      },
      {
        "id": "email",
        "label": "Email",
        "type": "text",
        "required": true,
        "placeholder": "your@email.com"
      }
    ],
    "field_positions": {
      "full_name": { "x": 10, "y": 10, "width": 40, "height": 5 },
      "email": { "x": 10, "y": 20, "width": 40, "height": 5 }
    },
    "image_width": 800,
    "image_height": 1000
  }'
```

### 3. Use the Template

1. Refresh the frontend
2. Click on the template card
3. Canvas opens with field overlays
4. Tap/click a field to edit
5. Fill in values
6. Click "Submit" when done

## Mobile Testing

### Browser Dev Tools

1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select mobile device
4. Test gestures:
   - Pinch to zoom
   - Pan with touch
   - Tap fields to edit

### Real Device

1. Find your local IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Update frontend .env:
   ```
   VITE_API_URL=http://YOUR_IP:8000
   ```

3. Start frontend with network access:
   ```bash
   npm run dev -- --host
   ```

4. Access from phone: `http://YOUR_IP:5173`

## Common Commands

### Backend

```bash
# Start server
uv run uvicorn app.main:app --reload

# Create migration
uv run alembic revision --autogenerate -m "Description"

# Apply migrations
uv run alembic upgrade head

# Rollback migration
uv run alembic downgrade -1

# View logs
tail -f logs/app.log

# Format code
uv run black app/

# Run tests
uv run pytest
```

### Frontend

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

## Project Structure

```
format-forge-mobile/
├── backend/              # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/         # REST endpoints
│   │   ├── models/      # Database models
│   │   └── schemas/     # Pydantic schemas
│   ├── alembic/         # Migrations
│   └── docker-compose.yml
│
└── frontend/            # React + TypeScript
    ├── src/
    │   ├── components/  # React components
    │   ├── stores/      # Zustand state
    │   ├── services/    # API client
    │   └── types/       # TypeScript types
    └── package.json
```

## Next Steps

1. **Add Templates** - Create more templates via API
2. **Upload Images** - Add template background images
3. **Test Mobile** - Try on actual mobile device
4. **Customize** - Modify colors, fonts, styling
5. **Deploy** - See deployment guide in README.md

## Troubleshooting

### Backend won't start

```bash
# Check database is running
pg_isready

# Check database exists
psql -l | grep format_forge

# Check Python version
python --version  # Should be 3.11+
```

### Frontend errors

```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Check API connection
curl http://localhost:8000

# Check environment
cat .env
```

### Database connection errors

```bash
# Update .env with correct credentials
DATABASE_URL=postgresql://user:password@localhost:5432/format_forge_mobile

# Test connection
psql -U user -d format_forge_mobile -c "SELECT 1"
```

### Canvas not working

- Check browser console for errors
- Ensure template has valid field_positions
- Try different browser (Chrome recommended)
- Test on actual device (not just dev tools)

## Development Tips

1. **Hot Reload** - Both frontend and backend auto-reload on changes
2. **API Docs** - Use http://localhost:8000/docs for API testing
3. **Database** - Use psql or TablePlus to inspect data
4. **Logs** - Check `backend/logs/app.log` for backend logs
5. **State** - Use React DevTools to inspect Zustand store

## Resources

- [Backend README](backend/README.md) - Full backend documentation
- [Frontend README](frontend/README.md) - Full frontend documentation
- [Main README](README.md) - Project overview
- [FastAPI Docs](https://fastapi.tiangolo.com/) - Backend framework
- [React Docs](https://react.dev/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Support

- Backend issues: Check backend logs and API docs
- Frontend issues: Check browser console
- Database issues: Check PostgreSQL logs
- Questions: Open an issue on GitHub

---

**Ready to build?** Start with `docker-compose up` in the backend directory!
