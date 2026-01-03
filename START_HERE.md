# 🎯 START HERE - TopSkill LMS

## ✅ IMMEDIATE ACCESS

### 1. Admin Panel (READY NOW!)
**URL**: http://localhost:8000/admin/

- **Username**: `admin`
- **Password**: `admin123`

### 2. API Endpoint (Now Public!)
**URL**: http://localhost:8000/api/courses/

✅ This now works without authentication!

## 🐳 EASIEST WAY: Use Docker

```bash
# One command to start everything
docker-compose up --build
```

This starts:
- ✅ PostgreSQL database
- ✅ Django backend (port 8000)
- ✅ Next.js frontend (port 3000)
- ✅ Auto-runs migrations
- ✅ Creates admin user

**Then access:**
- Frontend: http://localhost:3000
- Admin: http://localhost:8000/admin/ (admin/admin123)
- API: http://localhost:8000/api/courses/

## 📝 Current Status

✅ **Backend**: Running (http://localhost:8000)
✅ **Admin**: Created (admin/admin123)
✅ **API**: Public access enabled
⏳ **Frontend**: Use Docker or wait for npm to finish

## 🔧 Manual Frontend Start

If not using Docker:

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
npm run dev
```

**Wait 30 seconds** for Next.js to compile, then:
http://localhost:3000

## ❓ FAQ

**Q: API shows authentication error?**  
A: Fixed! Courses API is now public. Try: http://localhost:8000/api/courses/

**Q: Frontend not loading?**  
A: Use Docker (`docker-compose up`) - it's easier!

**Q: Admin password?**  
A: `admin123` (change it after first login)

## 🎉 You're Ready!

1. **Admin Panel**: http://localhost:8000/admin/ (admin/admin123)
2. **Create courses** in admin panel
3. **View courses** at: http://localhost:8000/api/courses/
4. **Frontend**: Use Docker or wait for npm dev server







