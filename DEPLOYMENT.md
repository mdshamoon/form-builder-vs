# Production Deployment Guide

Complete guide for deploying Format Forge Mobile to a production server.

## Understanding the Architecture

When deployed to a server, here's how the services communicate:

```
Internet
   ↓
Your Server (IP: x.x.x.x or domain.com)
   ↓
   ├── Frontend (Port 80) → Serves React app to users' browsers
   ├── Backend (Port 8211) → API endpoints
   └── PostgreSQL (Port 5444) → Database (internal only)
```

**Key Point**: The frontend runs in the **user's browser**, so it needs to call the backend using your **public server URL**, not `localhost`!

## Quick Deployment Scenarios

### Scenario 1: Server with Public IP (e.g., 203.0.113.45)

**Frontend will call**: `http://203.0.113.45:8211`

```env
# .env.prod
VITE_API_BASE_URL=http://203.0.113.45:8211
ALLOWED_ORIGINS=http://203.0.113.45
```

### Scenario 2: Server with Domain (e.g., example.com)

**Frontend will call**: `https://example.com:8211` or `https://api.example.com`

```env
# .env.prod
VITE_API_BASE_URL=https://example.com:8211
ALLOWED_ORIGINS=https://example.com
```

### Scenario 3: Behind Reverse Proxy (Recommended)

**Frontend will call**: `https://api.example.com`

```env
# .env.prod
VITE_API_BASE_URL=https://api.example.com
ALLOWED_ORIGINS=https://example.com,https://www.example.com
```

## Step-by-Step Deployment

### 1. Prepare Your Server

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone Your Repository

```bash
cd /opt
sudo git clone <your-repo-url> format-forge
cd format-forge
```

### 3. Create Production Environment File

```bash
# Copy example and edit
cp .env.example .env.prod

# Edit with your server details
nano .env.prod
```

**Example `.env.prod` for server at `example.com`:**

```env
# Database
POSTGRES_USER=format_forge
POSTGRES_PASSWORD=STRONG_RANDOM_PASSWORD_HERE
POSTGRES_DB=format_forge_db
DATABASE_URL=postgresql://format_forge:STRONG_RANDOM_PASSWORD_HERE@postgres:5432/format_forge_db

# Backend
SECRET_KEY=YOUR_SECRET_KEY_GENERATED_WITH_openssl_rand_hex_32
ALLOWED_ORIGINS=https://example.com,https://www.example.com
UPLOAD_DIR=/app/uploads

# Frontend - IMPORTANT: Use your public server URL!
VITE_API_BASE_URL=https://example.com:8211

# Ports
BACKEND_PORT=8211
FRONTEND_PORT=80
```

### 4. Generate Secrets

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate strong database password
openssl rand -base64 32
```

### 5. Build and Start Services

```bash
# Use production docker-compose
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 6. Apply Database Migrations

```bash
docker-compose -f docker-compose.prod.yml exec backend uv run alembic upgrade head
```

### 7. Create Admin User

```bash
# Access backend shell
docker-compose -f docker-compose.prod.yml exec backend sh

# Run Python
uv run python

# In Python shell:
from app.db.session import SessionLocal
from app.services.auth_service import auth_service

db = SessionLocal()
user = auth_service.create_user(db, "admin@example.com", "SecurePassword123!", is_admin=True)
print(f"Admin created: {user.email}")
exit()

# Exit shell
exit
```

### 8. Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8211/tcp  # Backend API

# Optional: Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

## Domain and SSL Setup

### Option A: Direct Access (HTTP)

Your users will access:
- Frontend: `http://your-server-ip`
- Backend: `http://your-server-ip:8211`

**Update `.env.prod`:**
```env
VITE_API_BASE_URL=http://YOUR_SERVER_IP:8211
ALLOWED_ORIGINS=http://YOUR_SERVER_IP
```

### Option B: With Domain (HTTP)

Point your domain's A record to your server IP, then:

**Update `.env.prod`:**
```env
VITE_API_BASE_URL=http://yourdomain.com:8211
ALLOWED_ORIGINS=http://yourdomain.com
```

### Option C: With HTTPS (Recommended)

Use Nginx as reverse proxy with Let's Encrypt SSL.

#### 1. Install Nginx and Certbot

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

#### 2. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/format-forge
```

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5173;  # or port 80 if using production frontend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8211;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/format-forge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3. Get SSL Certificates

```bash
# Get certificates for both domains
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

#### 4. Update Environment Variables

**`.env.prod`:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### 5. Rebuild Frontend

```bash
# Rebuild with new API URL
docker-compose -f docker-compose.prod.yml --env-file .env.prod build frontend
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d frontend
```

## Post-Deployment Verification

### 1. Check Services

```bash
# All containers running
docker-compose -f docker-compose.prod.yml ps

# Health checks
curl http://localhost:8211/health
curl http://localhost/  # Frontend
```

### 2. Check Logs

```bash
# Backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Frontend logs
docker-compose -f docker-compose.prod.yml logs frontend

# Database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

### 3. Test Frontend API Calls

Open browser console at your frontend URL and check:
- Network tab should show API calls to correct URL
- No CORS errors
- Successful authentication

## Updating the Application

### Update Code

```bash
cd /opt/format-forge

# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml --env-file .env.prod down
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend uv run alembic upgrade head
```

### Update Environment Variables

```bash
# Edit .env.prod
nano .env.prod

# Rebuild services that need the new variables
docker-compose -f docker-compose.prod.yml --env-file .env.prod build frontend
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Backup and Restore

### Backup Database

```bash
# Create backup directory
mkdir -p /opt/backups

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U format_forge format_forge_db > /opt/backups/db_$(date +%Y%m%d_%H%M%S).sql

# Backup uploads
tar -czf /opt/backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz -C /var/lib/docker/volumes/format-forge-mobile_uploads_data/_data .
```

### Automated Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-format-forge.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose -f /opt/format-forge/docker-compose.prod.yml exec -T postgres pg_dump -U format_forge format_forge_db > $BACKUP_DIR/db_$DATE.sql

# Compress and keep last 7 days
gzip $BACKUP_DIR/db_$DATE.sql
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-format-forge.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-format-forge.sh
```

### Restore Database

```bash
# Stop backend
docker-compose -f docker-compose.prod.yml stop backend

# Restore from backup
cat /opt/backups/db_20231201_020000.sql.gz | gunzip | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U format_forge -d format_forge_db

# Restart backend
docker-compose -f docker-compose.prod.yml start backend
```

## Troubleshooting

### Frontend Can't Connect to Backend

**Symptom**: CORS errors or network errors in browser console

**Solution**:
1. Check `VITE_API_BASE_URL` in `.env.prod` - must be your server's public URL
2. Check `ALLOWED_ORIGINS` in backend includes your frontend URL
3. Rebuild frontend after changing env vars

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod build frontend
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d frontend
```

### CORS Errors

**Check backend ALLOWED_ORIGINS**:
```bash
docker-compose -f docker-compose.prod.yml exec backend env | grep ALLOWED_ORIGINS
```

Should include your frontend domain.

### SSL Certificate Issues

```bash
# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### Database Connection Failed

```bash
# Check postgres is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check logs
docker-compose -f docker-compose.prod.yml logs postgres

# Restart postgres
docker-compose -f docker-compose.prod.yml restart postgres
```

## Monitoring

### Check Disk Space

```bash
df -h
docker system df
```

### Clean Up Docker

```bash
# Remove unused images
docker image prune -a

# Remove old volumes (careful!)
docker volume prune
```

### View Resource Usage

```bash
docker stats
```

## Security Checklist

- [ ] Strong `SECRET_KEY` generated
- [ ] Strong database password
- [ ] Firewall configured
- [ ] SSL certificates installed
- [ ] ALLOWED_ORIGINS properly set
- [ ] Regular backups configured
- [ ] Docker volumes secured
- [ ] SSH key-based auth enabled
- [ ] Fail2ban installed (optional)
- [ ] Monitoring set up

## Example: Complete Production Setup

**Server**: `example.com` (IP: 203.0.113.45)

**DNS Records**:
```
A     example.com          → 203.0.113.45
A     www.example.com      → 203.0.113.45
A     api.example.com      → 203.0.113.45
```

**`.env.prod`**:
```env
POSTGRES_PASSWORD=xK9mP2nQ8vL5tR3wY7cB1aE4fH6jM0sN
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
DATABASE_URL=postgresql://format_forge:xK9mP2nQ8vL5tR3wY7cB1aE4fH6jM0sN@postgres:5432/format_forge_db
ALLOWED_ORIGINS=https://example.com,https://www.example.com
VITE_API_BASE_URL=https://api.example.com
```

**Access**:
- Frontend: https://example.com
- Backend API: https://api.example.com
- Database: localhost:5444 (internal only)

---

For more help, see [DOCKER_SETUP.md](./DOCKER_SETUP.md) and [README.md](./README.md)
