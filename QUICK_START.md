# 🚀 Quick Start Guide

## ✅ Admin Credentials (READY NOW!)

**URL**: http://localhost:8000/admin/

- **Username**: `admin`
- **Password**: `admin123`

## 🐳 Option 1: Docker (Recommended - Easiest!)

```bash
# Start everything
docker-compose up --build

# In another terminal, set admin password
docker-compose exec backend python manage.py changepassword admin
```

Then access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Admin: http://localhost:8000/admin/ (admin/admin123)

## 💻 Option 2: Manual Setup

### Backend (Already Running!)
```bash
cd backend
python manage.py runserver
```
✅ Backend: http://localhost:8000/admin/ (admin/admin123)

### Frontend
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
npm run dev
```
⏳ Wait 30 seconds, then: http://localhost:3000

## 📝 About the API Error

The error `{"detail": "Authentication credentials were not provided."}` is **NORMAL**!

The API requires authentication. To test:

1. **Register**: http://localhost:8000/api/auth/register/
2. **Login**: http://localhost:8000/api/auth/login/
3. **Use token** in subsequent requests

Or use the **frontend** - it handles authentication automatically!

## 🎯 Current Status

✅ **Backend**: Running on port 8000
✅ **Admin**: http://localhost:8000/admin/ (admin/admin123)
⏳ **Frontend**: Starting on port 3000 (wait 30 seconds)

## 🔧 If Frontend Doesn't Start

Check the terminal where you ran `npm run dev` for errors.

Common issues:
- Node version too old (need 18.17+)
- Port 3000 already in use
- Missing dependencies

**Solution**: Use Docker! It handles everything automatically.
