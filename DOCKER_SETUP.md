# Docker Setup Guide

Complete guide for running Format Forge Mobile with Docker.

## Quick Start

```bash
# Clone and navigate to project
cd format-forge-mobile

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8211
- **API Docs**: http://localhost:8211/docs
- **PostgreSQL**: localhost:5444

## Services

### PostgreSQL Database
- **Container**: `format-forge-postgres`
- **Image**: `postgres:15-alpine`
- **Internal Port**: 5432
- **Host Port**: 5444
- **Database**: `format_forge_db`
- **User**: `format_forge`
- **Password**: `format_forge_password`

### FastAPI Backend
- **Container**: `format-forge-backend`
- **Internal Port**: 8000
- **Host Port**: 8211
- **Health Check**: http://localhost:8211/health

### React Frontend
- **Container**: `format-forge-frontend`
- **Internal Port**: 5173
- **Host Port**: 5173
- **Vite Dev Server**: Hot reload enabled

## Configuration

### Environment Variables

Create a `.env` file (or use `.env.example`):

```env
# Database
POSTGRES_USER=format_forge
POSTGRES_PASSWORD=format_forge_password
POSTGRES_DB=format_forge_db

# Backend
DATABASE_URL=postgresql://format_forge:format_forge_password@postgres:5432/format_forge_db
SECRET_KEY=your-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
UPLOAD_DIR=/app/uploads

# Frontend
VITE_API_BASE_URL=http://localhost:8211
```

## Docker Commands

### Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Start with build
docker-compose up -d --build

# Start in foreground (see logs)
docker-compose up
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### Rebuilding

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and restart
docker-compose up -d --build
```

### Executing Commands

```bash
# Backend: Run migrations
docker-compose exec backend uv run alembic upgrade head

# Backend: Create migration
docker-compose exec backend uv run alembic revision --autogenerate -m "description"

# Backend: Access Python shell
docker-compose exec backend uv run python

# Postgres: Access database
docker-compose exec postgres psql -U format_forge -d format_forge_db

# Frontend: Install packages
docker-compose exec frontend npm install <package-name>

# Backend: Access shell
docker-compose exec backend sh

# Frontend: Access shell
docker-compose exec frontend sh
```

## Database Operations

### Access PostgreSQL

```bash
# Using docker exec
docker-compose exec postgres psql -U format_forge -d format_forge_db

# Using psql from host (if installed)
psql -h localhost -p 5444 -U format_forge -d format_forge_db
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U format_forge format_forge_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U format_forge -d format_forge_db < backup.sql
```

### Reset Database

```bash
# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Run migrations
docker-compose exec backend uv run alembic upgrade head
```

## Development Workflow

### Make Code Changes

**Frontend changes**:
- Hot reload is automatic
- No restart needed

**Backend changes**:
- Python code: Hot reload with `--reload` flag
- Dependencies: Rebuild container
  ```bash
  docker-compose build backend
  docker-compose up -d backend
  ```

### Add Python Dependencies

```bash
# Edit pyproject.toml, then:
docker-compose build backend
docker-compose up -d backend
```

### Add NPM Dependencies

```bash
# Option 1: From host
cd frontend
npm install <package>

# Option 2: Inside container
docker-compose exec frontend npm install <package>

# Rebuild if needed
docker-compose build frontend
docker-compose up -d frontend
```

### Database Migrations

```bash
# Create new migration
docker-compose exec backend uv run alembic revision --autogenerate -m "add new field"

# Apply migrations
docker-compose exec backend uv run alembic upgrade head

# Rollback last migration
docker-compose exec backend uv run alembic downgrade -1
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8211
lsof -i :8211

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "8212:8000"  # Use different host port
```

### Database Connection Failed

```bash
# Check if postgres is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Common fixes:
# 1. Database not ready
docker-compose restart backend

# 2. Migration needed
docker-compose exec backend uv run alembic upgrade head

# 3. Rebuild
docker-compose build backend
docker-compose up -d backend
```

### Frontend Build Errors

```bash
# Clean and rebuild
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend npm install

# Or full rebuild
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Out of Disk Space

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

## Volumes

### Data Persistence

- `postgres_data`: Database files
- `uploads_data`: Uploaded template images

### Inspect Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect format-forge-mobile_postgres_data

# Remove volume (⚠️ deletes data)
docker volume rm format-forge-mobile_postgres_data
```

## Production Deployment

### Security Checklist

- [ ] Change `SECRET_KEY` to random value
- [ ] Use strong database password
- [ ] Set proper `ALLOWED_ORIGINS`
- [ ] Enable HTTPS
- [ ] Set up firewall rules
- [ ] Configure backup strategy

### Production docker-compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    restart: always
    # ... same config ...

  backend:
    restart: always
    environment:
      SECRET_KEY: ${SECRET_KEY}  # From .env file
      # ... other env vars ...
    # Remove volume mount in production

  frontend:
    build:
      target: production  # Use nginx stage
    restart: always
    ports:
      - "80:80"
```

Run with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Health Checks

### Check Service Health

```bash
# Backend health
curl http://localhost:8211/health

# Database connection
docker-compose exec postgres pg_isready -U format_forge

# All containers status
docker-compose ps
```

### Monitor Resources

```bash
# Resource usage
docker stats

# Specific container
docker stats format-forge-backend
```

## Common Tasks

### Create Admin User

```bash
# Access backend shell
docker-compose exec backend sh

# Run Python
uv run python

# In Python shell:
from app.db.session import SessionLocal
from app.services.auth_service import auth_service

db = SessionLocal()
user = auth_service.create_user(db, "admin@example.com", "password123", is_admin=True)
print(f"Admin created: {user.email}")
```

### View Uploaded Files

```bash
# List uploads
docker-compose exec backend ls -la /app/uploads/templates

# Copy file from container
docker cp format-forge-backend:/app/uploads/templates/file.jpg ./
```

### Clear All Data and Restart

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend uv run alembic upgrade head
```

## Tips

1. **Use `.dockerignore`** - Already configured to exclude `node_modules`, `__pycache__`, etc.

2. **Layer caching** - Dockerfile optimized for fast rebuilds

3. **Dev vs Prod** - Frontend has multi-stage build (dev/prod)

4. **Logs** - Use `-f` flag to follow logs in real-time

5. **Health checks** - Services have health checks for better orchestration

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify all services running: `docker-compose ps`
3. Check this troubleshooting guide
4. See main [README.md](./README.md)
