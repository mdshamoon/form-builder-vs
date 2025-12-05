# Format Forge Mobile

A mobile-first, canvas-based template form builder with Figma-like zoom/pan interface. This is a modernized version of Format Forge Visualizer with improved mobile UX and better architecture.

## Key Features

### Backend (FastAPI + PostgreSQL)
- ✅ **FastAPI** with Python 3.11+ and UV package manager
- ✅ **PostgreSQL** database with JSON field support
- ✅ **Alembic** migrations for database schema management
- ✅ **Structured logging** with structlog (JSON/console format)
- ✅ **JWT authentication** with password hashing
- ✅ **Type-safe** with Pydantic schemas
- ✅ **Docker support** for easy deployment
- ✅ **PDF generation** with ReportLab (NEW!)
- ✅ **Image upload & processing** with PIL/Pillow (NEW!)

### Frontend (React + TypeScript + Vite)
- ✅ **Mobile-first design** optimized for touch interfaces
- ✅ **Canvas-based editor** with Figma-like zoom/pan
- ✅ **Touch-friendly UI** with 44px minimum touch targets
- ✅ **Popup field editor** with bottom sheets
- ✅ **Template builder** with drag-and-drop (NEW!)
- ✅ **Image upload** with drag-and-drop (NEW!)
- ✅ **React Query** for server state management
- ✅ **Zustand** for client state
- ✅ **Tailwind CSS** for styling
- ✅ **Framer Motion** for smooth animations
- ✅ **React Router** for navigation

## Project Structure

```
format-forge-mobile/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/v1/            # API endpoints
│   │   ├── core/              # Config, logging, security
│   │   ├── db/                # Database setup
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── main.py            # FastAPI app
│   ├── alembic/               # Database migrations
│   ├── logs/                  # Application logs
│   ├── docker-compose.yml     # Docker setup
│   ├── Dockerfile             # Container image
│   ├── pyproject.toml         # UV dependencies
│   └── README.md              # Backend documentation
│
└── frontend/                  # React frontend
    ├── src/
    │   ├── components/        # React components (to be created)
    │   ├── hooks/            # Custom hooks
    │   ├── services/         # API clients
    │   ├── stores/           # Zustand stores
    │   ├── types/            # TypeScript types
    │   └── App.tsx           # Main app component
    ├── package.json           # NPM dependencies
    └── README.md              # Frontend documentation
```

## Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **UV** (Python package manager) - [Install](https://github.com/astral-sh/uv)

### Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Start PostgreSQL (Docker)
docker-compose up -d db

# Run migrations
uv run alembic upgrade head

# Start server
uv run uvicorn app.main:app --reload
```

Backend runs on: http://localhost:8000
API Docs: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on: http://localhost:5173

## Architecture Highlights

### Mobile-First Canvas Interface

Unlike the original Format Forge which uses absolute pixel positioning, this version:

1. **Canvas-based** - Uses HTML5 canvas with zoom/pan like Figma
2. **Touch-optimized** - Pinch-to-zoom, pan gestures, large touch targets
3. **Popup editors** - Field details open in bottom sheets (mobile) or modals (desktop)
4. **Percentage positioning** - Fields scale with canvas zoom

### Backend Improvements

1. **UV instead of NPM/pip** - Faster dependency resolution
2. **Structured logging** - JSON logs for production, pretty logs for dev
3. **Alembic migrations** - Proper database versioning
4. **Type safety** - Full Pydantic validation
5. **Docker-ready** - Easy deployment with docker-compose

### Database Schema

**Templates Table:**
- Stores template metadata, image URL, and field definitions
- Field positions stored as JSON (percentage-based coordinates)
- Supports public/private templates

**Submissions Table:**
- Stores form data as JSON
- Supports drafts and versions
- OpenEdx integration fields (resource_link_id)

**Users Table:**
- Email/password authentication
- Admin flag for privileged operations

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (returns JWT token)

### Templates
- `GET /api/v1/templates` - List all templates
- `POST /api/v1/templates` - Create template
- `GET /api/v1/templates/{id}` - Get template details
- `PUT /api/v1/templates/{id}` - Update template
- `DELETE /api/v1/templates/{id}` - Delete template

### Submissions
- `GET /api/v1/submissions` - List submissions (with filters)
- `POST /api/v1/submissions` - Create submission
- `GET /api/v1/submissions/{id}` - Get submission
- `PUT /api/v1/submissions/{id}` - Update submission

## Development Status

### ✅ Completed (v1.0)
- [x] Backend FastAPI setup with UV
- [x] PostgreSQL models and schemas
- [x] Alembic migrations
- [x] Structured logging
- [x] JWT authentication
- [x] Docker configuration
- [x] Frontend Vite + React + TypeScript setup
- [x] Tailwind CSS configuration
- [x] Canvas editor component
- [x] Zoom/pan functionality
- [x] Field overlay rendering
- [x] Mobile popup editor
- [x] Template selector
- [x] **PDF generation service** ⭐ NEW
- [x] **Image upload and processing** ⭐ NEW
- [x] **Template builder UI** ⭐ NEW

### ✅ Completed (v1.1) - Authentication & Admin Features
- [x] **Login/Register system** 🔐 NEW
- [x] **Admin-only template creation** 🔒 NEW
- [x] **Template editing** ✏️ NEW
- [x] **Field resize handles** 📏 NEW
- [x] **Preview mode** 👁️ NEW
- [x] **Fixed field positioning** 🎯 NEW

### 📋 Future Enhancements
- [ ] OpenEdx LTI integration
- [ ] Draft autosave (auto-save every 30s)
- [ ] Version history viewer
- [ ] OCR field detection
- [ ] Multi-page PDF support
- [ ] Template marketplace

## Key Differences from Original

| Feature | Original | Mobile Version |
|---------|----------|---------------|
| Backend | Node.js/Express | FastAPI/Python |
| Package Manager | npm | UV |
| Database | Supabase | PostgreSQL + Alembic |
| Positioning | Absolute pixels | Canvas + percentage |
| Mobile UX | Responsive | Mobile-first canvas |
| Field Editor | Side panel | Bottom sheet popup |
| Logging | Console | Structured (JSON) |

## Contributing

1. Backend changes require database migration:
   ```bash
   uv run alembic revision --autogenerate -m "Description"
   ```

2. Frontend follows mobile-first principles:
   - Touch targets minimum 44x44px
   - Bottom sheets for mobile, modals for desktop
   - Gesture support (pinch, pan, tap)

## License

MIT License - see parent project

## Documentation

### Getting Started
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Detailed setup and installation guide
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - How to create your first admin user 🔐
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Fast reference for common commands and tasks

### Features & Guides
- **[AUTH_AND_FEATURES.md](./AUTH_AND_FEATURES.md)** - Authentication & v1.1 features guide 🆕
- **[NEW_FEATURES.md](./NEW_FEATURES.md)** - v1.0 features (Template Builder, PDF, Image Upload)
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing instructions
- **[FIXES_APPLIED.md](./FIXES_APPLIED.md)** - Latest bug fixes and improvements

## Support

- Quick help: See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- Setup issues: See [GETTING_STARTED.md](./GETTING_STARTED.md)
- Backend issues: See [backend/README.md](backend/README.md)
- Frontend issues: See [frontend/README.md](frontend/README.md)
- Testing help: See [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- General questions: Open an issue
