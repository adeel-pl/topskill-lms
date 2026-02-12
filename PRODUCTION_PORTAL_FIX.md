# 🚨 PRODUCTION FIX: Portal 404 Error

## Issue
`https://topskill-lms.server3.purelogics.net/portal/login` returns **404 Not Found**

## Root Cause
The production server's reverse proxy routes all requests to Next.js. Since Next.js doesn't have a `/portal/login` route, it returns 404.

## Solution Applied
Added Next.js rewrites to proxy `/portal/*` requests to Django backend.

## ✅ Production Deployment Steps

**SSH into your production server and run:**

```bash
# 1. Navigate to project directory
cd /path/to/topskill-lms

# 2. Pull latest code (if using git)
git pull origin main

# 3. Rebuild frontend with new rewrites (CRITICAL - rewrites are build-time)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache frontend

# 4. Restart services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 5. Check logs to verify
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f frontend
```

## 🔍 Verification

After deployment, test these URLs on **https://topskill-lms.server3.purelogics.net/**:

- ✅ `/portal/login` - Should show Django login page (NOT 404)
- ✅ `/portal/register` - Should show Django registration page
- ✅ `/portal/instructor/` - Should show instructor dashboard (after login)
- ✅ `/api/courses/` - Should return JSON (verify it's working)

## 📋 What Changed

1. **`frontend/next.config.js`** - Added rewrites to proxy `/portal/*` to Django
2. **`docker-compose.prod.yml`** - Added `BACKEND_URL=http://backend:8000`
3. **`frontend/Dockerfile`** - Added `BACKEND_URL` build argument

## ⚠️ Important Notes

- **Must rebuild frontend** - Rewrites are evaluated at build time, so `npm run build` must run with the new config
- **Docker service name** - Uses `http://backend:8000` (internal Docker network)
- **No nginx changes needed** - This works regardless of nginx configuration

## 🐛 If Still Not Working

1. **Check if frontend rebuilt:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs frontend | grep -i "rewrite\|portal"
   ```

2. **Verify backend is running:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
   ```

3. **Test backend directly:**
   ```bash
   curl http://localhost:8000/portal/login
   # Should return HTML, not 404
   ```

4. **Check nginx configuration** (if you have access):
   - Ensure nginx is routing to Next.js frontend (port 3000)
   - Next.js will handle the rewrite to Django backend









