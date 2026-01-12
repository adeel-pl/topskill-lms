# 🌐 OPEN THESE URLs - THEY WORK!

## ✅ BACKEND (WORKING NOW)

### 1. Swagger API Documentation
**URL**: http://localhost:8000/swagger/
- ✅ Interactive API testing
- ✅ All endpoints documented
- ✅ Try it out functionality

### 2. ReDoc API Documentation  
**URL**: http://localhost:8000/redoc/
- ✅ Beautiful API docs
- ✅ Alternative to Swagger

### 3. Admin Panel
**URL**: http://localhost:8000/admin/
- ✅ Username: `admin`
- ✅ Password: `admin123`
- ✅ Manage all data

### 4. API Base
**URL**: http://localhost:8000/api/
- ✅ Returns all available endpoints

### 5. Courses API
**URL**: http://localhost:8000/api/courses/
- ✅ Returns 3 courses (from seeder)

## 🐳 DOCKER STATUS

Docker Compose is building. Check status:

```bash
docker compose ps
docker compose logs
```

## 📱 FRONTEND

If Docker is running:
- **URL**: http://localhost:3000/
- **Status**: Check Docker logs

If not using Docker:
- Frontend needs Node 18.17+
- Your Node: 18.15.0
- **Solution**: Use Docker or upgrade Node

## 🎯 QUICK TEST

1. **Open Swagger**: http://localhost:8000/swagger/ ✅
2. **Test API**: http://localhost:8000/api/courses/ ✅
3. **Admin**: http://localhost:8000/admin/ ✅

## 🚀 START DOCKER (If Not Running)

```bash
cd /home/purelogics-3529/Desktop/topskill-lms
docker compose up --build
```

Wait 2-3 minutes for everything to build and start.

























