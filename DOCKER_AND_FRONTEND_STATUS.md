# ✅ Docker & Frontend Status

## Current Status

### Docker Containers:
```bash
docker compose ps
```

### Frontend:
- **Container**: `topskill-lms-frontend-1`
- **Status**: Check with `docker compose ps`
- **URL**: http://localhost:3000/
- **Logs**: `docker compose logs frontend`

### Backend:
- **Container**: `topskill-lms-backend-1`  
- **Status**: Check with `docker compose ps`
- **URL**: http://localhost:8000/
- **Swagger**: http://localhost:8000/swagger/
- **Logs**: `docker compose logs backend`

### Database:
- **Container**: `topskill-lms-db-1`
- **Status**: Should be "healthy"
- **Port**: 5433 (mapped from 5432)

## Quick Commands

```bash
# Check status
docker compose ps

# View logs
docker compose logs -f frontend
docker compose logs -f backend

# Restart services
docker compose restart frontend
docker compose restart backend

# Stop everything
docker compose down

# Start everything
docker compose up -d
```

## Test URLs

1. **Frontend**: http://localhost:3000/
2. **Backend Swagger**: http://localhost:8000/swagger/
3. **Backend API**: http://localhost:8000/api/courses/
4. **Admin**: http://localhost:8000/admin/ (admin/admin123)

## If Frontend Not Working

Check logs:
```bash
docker compose logs frontend --tail=50
```

Common issues:
- Next.js config file (fixed - converted to .js)
- Port 3000 already in use
- Node version issues (Docker has Node 20, so should be fine)

## If Backend Not Working

Check logs:
```bash
docker compose logs backend --tail=50
```

Common issues:
- Database connection
- Migration errors
- Port 8000 conflict




































