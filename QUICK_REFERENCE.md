# Quick Reference - Format Forge Mobile

Fast reference guide for common tasks and commands.

## 🚀 Quick Start

```bash
# Terminal 1 - Backend
cd backend
uv run uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
format-forge-mobile/
├── backend/              # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/v1/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── models/      # Database models
│   │   └── main.py      # FastAPI app
│   └── uploads/         # Uploaded images
│       ├── templates/   # Full-size images
│       └── thumbnails/  # Thumbnails (300x400)
│
└── frontend/            # React + TypeScript + Vite
    └── src/
        ├── components/  # React components
        ├── services/    # API client
        ├── stores/      # Zustand state
        └── types/       # TypeScript types
```

## 🔑 Key Features

### Template Builder (`/builder`)
- Upload template image (drag-and-drop)
- Add form fields
- Position fields on canvas (drag to position)
- Create template

### Form Filler (`/`)
- Select template
- Fill form fields
- Save draft or submit
- Generate PDF

## 🛠️ Common Commands

### Backend

```bash
cd backend

# Install dependencies
uv sync

# Start server
uv run uvicorn app.main:app --reload

# Run migrations
uv run alembic upgrade head

# Create new migration
uv run alembic revision --autogenerate -m "Description"

# Check database
psql -d format_forge_mobile -c "SELECT * FROM templates;"

# View logs
tail -f logs/app.log

# Test upload endpoint
curl -X POST http://localhost:8000/uploads/image \
  -F "file=@test-image.jpg"
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

## 📝 API Endpoints

### Upload
```bash
POST /uploads/image              # Upload image
GET  /uploads/templates/{file}   # Get image
GET  /uploads/thumbnails/{file}  # Get thumbnail
DELETE /uploads/image            # Delete image
```

### Templates
```bash
GET    /api/v1/templates         # List all
POST   /api/v1/templates         # Create
GET    /api/v1/templates/{id}    # Get one
PUT    /api/v1/templates/{id}    # Update
DELETE /api/v1/templates/{id}    # Delete
```

### Submissions
```bash
GET  /api/v1/submissions         # List all
POST /api/v1/submissions         # Create
GET  /api/v1/submissions/{id}    # Get one
```

### PDF Generation
```bash
POST /api/v1/pdf/generate/{template_id}   # Generate from template
GET  /api/v1/pdf/submission/{id}          # Generate from submission
```

## 🔍 Debugging

### Check Backend Status
```bash
curl http://localhost:8000/health

# Expected: {"status":"healthy","app":"Format Forge Mobile API",...}
```

### Check CORS
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:8000/uploads/image
```

### Check Database Connection
```bash
cd backend
uv run python -c "from app.db.base import engine; print(engine.connect())"
```

### Check Uploads Directory
```bash
cd backend
ls -lh uploads/templates/
ls -lh uploads/thumbnails/
```

### Frontend Console Debugging
Open browser DevTools (F12) and check:
- Console tab for errors
- Network tab for API calls
- Application → Local Storage for stored data

## 🐛 Common Issues

### Issue: Backend won't start
```bash
# Check PostgreSQL is running
psql -l

# Create database if needed
createdb format_forge_mobile

# Run migrations
cd backend
uv run alembic upgrade head
```

### Issue: Frontend can't connect to backend
```bash
# Check .env file
cd frontend
cat .env

# Should have:
# VITE_API_URL=http://localhost:8000

# If missing, create it:
echo "VITE_API_URL=http://localhost:8000" > .env
```

### Issue: Image upload fails
```bash
# Create uploads directory
cd backend
mkdir -p uploads/templates uploads/thumbnails

# Check permissions
chmod 755 uploads uploads/templates uploads/thumbnails
```

### Issue: CORS errors
```bash
# Check backend .env
cd backend
grep CORS_ORIGINS .env

# Should include: http://localhost:5173
# If not:
echo "CORS_ORIGINS=http://localhost:5173,http://localhost:3000" >> .env

# Restart backend
```

## 📱 Mobile Testing

### Chrome DevTools
1. Press F12
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Test touch interactions

### Test on Real Device
1. Find your local IP: `ifconfig` (macOS/Linux) or `ipconfig` (Windows)
2. Update frontend .env: `VITE_API_URL=http://192.168.1.x:8000`
3. Update backend .env: Add your IP to CORS_ORIGINS
4. Access from phone: http://192.168.1.x:5173

## 📊 Database Schema

### Templates Table
```sql
id              UUID PRIMARY KEY
name            VARCHAR(255)
description     TEXT
template_type   VARCHAR(50)
is_public       BOOLEAN
image_url       VARCHAR(500)
image_width     INTEGER
image_height    INTEGER
fields          JSON
field_positions JSON
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Submissions Table
```sql
id              UUID PRIMARY KEY
template_id     UUID REFERENCES templates(id)
form_data       JSON
email           VARCHAR(255)
is_draft        BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

## 🎨 Component Reference

### TemplateBuilder
- Location: `frontend/src/components/TemplateBuilder.tsx`
- Route: `/builder`
- Purpose: Create new templates with positioned fields

### TemplateCanvas
- Location: `frontend/src/components/TemplateCanvas.tsx`
- Purpose: Zoom/pan canvas with field overlays

### FieldEditorPopup
- Location: `frontend/src/components/FieldEditorPopup.tsx`
- Purpose: Edit field values (bottom sheet on mobile)

### ImageUpload
- Location: `frontend/src/components/ImageUpload.tsx`
- Purpose: Drag-and-drop image upload

## 🔐 Environment Variables

### Backend `.env`
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/format_forge_mobile

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256

# Upload
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760  # 10MB
```

### Frontend `.env`
```bash
VITE_API_URL=http://localhost:8000
```

## 📚 Documentation

- [README.md](./README.md) - Project overview and features
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Detailed setup guide
- [NEW_FEATURES.md](./NEW_FEATURES.md) - Latest features added
- [FIXES_APPLIED.md](./FIXES_APPLIED.md) - Recent bug fixes
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Comprehensive testing instructions

## 🔗 Useful Links

### Development
- FastAPI Docs: https://fastapi.tiangolo.com
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- React Query: https://tanstack.com/query

### Libraries
- Framer Motion: https://www.framer.com/motion
- Zustand: https://github.com/pmndrs/zustand
- React Zoom Pan Pinch: https://github.com/BetterTyped/react-zoom-pan-pinch
- ReportLab: https://www.reportlab.com/docs/reportlab-userguide.pdf

## 💡 Tips

### Development Workflow
1. Keep both backend and frontend running in separate terminals
2. Use API docs at http://localhost:8000/docs to test endpoints
3. Check browser console frequently for errors
4. Use React Query DevTools for debugging state

### Database Workflow
1. Make model changes in `app/models/`
2. Create migration: `uv run alembic revision --autogenerate -m "Description"`
3. Review migration file in `alembic/versions/`
4. Apply migration: `uv run alembic upgrade head`

### Git Workflow
1. Don't commit `.env` files (in `.gitignore`)
2. Don't commit `uploads/` directory (in `.gitignore`)
3. Don't commit `logs/` directory (in `.gitignore`)
4. Do commit `alembic/versions/` migrations

## 🚨 Emergency Commands

### Reset Database
```bash
cd backend
uv run alembic downgrade base
uv run alembic upgrade head
```

### Clear Uploads
```bash
cd backend
rm -rf uploads/templates/*
rm -rf uploads/thumbnails/*
```

### Clear Frontend Cache
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Reset Everything
```bash
# Backend
cd backend
rm -rf uploads/templates/* uploads/thumbnails/*
dropdb format_forge_mobile
createdb format_forge_mobile
uv run alembic upgrade head

# Frontend
cd frontend
rm -rf node_modules/.vite
npm run dev
```

## ⚡ Performance Tips

### Backend
- Use `--workers 4` for production: `uvicorn app.main:app --workers 4`
- Enable response compression in FastAPI
- Use database connection pooling

### Frontend
- Use `npm run build` for production builds
- Enable Vite's build optimization
- Lazy load heavy components
- Use React.memo for expensive renders

## 🎯 Testing Checklist

Quick checklist for testing new features:
- [ ] Backend health check: `curl http://localhost:8000/health`
- [ ] Frontend loads: http://localhost:5173
- [ ] Template builder navigation works
- [ ] Image upload works (drag-and-drop)
- [ ] Template creation succeeds
- [ ] Template appears on home screen
- [ ] Form filling works
- [ ] PDF generation works
- [ ] Mobile view responsive
- [ ] No console errors

## 📞 Support

For issues or questions:
1. Check this quick reference first
2. Review [TESTING_GUIDE.md](./TESTING_GUIDE.md)
3. Check backend logs: `tail -f backend/logs/app.log`
4. Check browser console (F12)
5. Review [FIXES_APPLIED.md](./FIXES_APPLIED.md) for known issues
