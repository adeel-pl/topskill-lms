# ✅ ACTUAL WORKING URLs

## Backend (Django)

### Admin Panel
- **URL**: http://localhost:8000/admin/
- **Login**: `admin` / `admin123`
- **Status**: ✅ WORKING

### Swagger API Documentation
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/
- **JSON Schema**: http://localhost:8000/swagger.json
- **Status**: ✅ WORKING

### API Endpoints
- **Base**: http://localhost:8000/api/
- **Courses**: http://localhost:8000/api/courses/
- **Auth Register**: http://localhost:8000/api/auth/register/
- **Auth Login**: http://localhost:8000/api/auth/login/
- **Cart**: http://localhost:8000/api/cart/
- **Status**: ✅ WORKING

## Frontend (Next.js)

### If Running
- **URL**: http://localhost:3000/
- **Status**: ⚠️ Needs Node 18.17+ or Docker

## Docker

### To Start Everything
```bash
# Install docker-compose if needed
sudo apt install docker-compose

# Start all services
docker compose up --build
# OR
docker-compose up --build
```

### What Docker Starts
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Database: PostgreSQL on port 5432

## Quick Test

```bash
# Test backend
curl http://localhost:8000/api/courses/

# Test Swagger
curl http://localhost:8000/swagger/

# Test admin (should redirect to login)
curl -I http://localhost:8000/admin/
```




































