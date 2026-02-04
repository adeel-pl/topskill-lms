# 🔧 Portal 404 Error Fix

## Problem
The `/portal/login` route was returning a 404 error on the production server (`https://topskill-lms.server3.purelogics.net/portal/login`).

## Root Cause
The production server's reverse proxy (nginx) was routing all requests to the Next.js frontend. Since Next.js doesn't have a `/portal/login` route, it returned a 404.

## Solution
Added Next.js rewrites to proxy `/portal/*`, `/api/*`, `/admin/*`, and `/swagger/*` requests to the Django backend.

## Changes Made

### 1. **frontend/next.config.js**
- Added `rewrites()` function to proxy backend routes
- Routes `/portal/*` → Django backend
- Routes `/api/*` → Django backend  
- Routes `/admin/*` → Django backend
- Routes `/swagger/*` → Django backend

### 2. **docker-compose.yml**
- Added `BACKEND_URL` build arg and environment variable
- Default: `http://backend:8000` (Docker service name)

### 3. **docker-compose.prod.yml**
- Added `BACKEND_URL` build arg and environment variable
- Set to `http://backend:8000` for Docker internal communication

### 4. **docker-compose.local.yml**
- Added `BACKEND_URL` environment variable
- Set to `http://backend:8000` for Docker internal communication

### 5. **frontend/Dockerfile**
- Added `BACKEND_URL` as build argument
- Set as environment variable for build-time and runtime access

## How It Works

1. **Request Flow:**
   ```
   User → https://topskill-lms.server3.purelogics.net/portal/login
   ↓
   Nginx → Next.js Frontend (port 3000)
   ↓
   Next.js Rewrite → Django Backend (http://backend:8000/portal/login)
   ↓
   Django responds with login page
   ```

2. **Docker Network:**
   - Frontend and backend containers are on the same Docker network
   - Frontend can reach backend via service name: `http://backend:8000`
   - Rewrites use this internal URL for efficient communication

## Deployment Steps

### For Production:
```bash
# Rebuild frontend with new rewrites
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache frontend

# Restart services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### For Local Development:
```bash
# Rebuild frontend
docker-compose -f docker-compose.yml -f docker-compose.local.yml build --no-cache frontend

# Restart services
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d
```

## Testing

After deployment, test these URLs:
- ✅ `/portal/login` - Should show Django login page
- ✅ `/portal/register` - Should show Django registration page
- ✅ `/portal/instructor/` - Should show instructor dashboard (after login)
- ✅ `/portal/admin-portal/` - Should show admin dashboard (after login)
- ✅ `/api/courses/` - Should return API JSON response
- ✅ `/admin/` - Should show Django admin (if accessible)

## Alternative Solution (Optional)

If you want better performance, you can configure nginx to route `/portal/*` directly to Django backend:

```nginx
# In nginx configuration
location /portal/ {
    proxy_pass http://backend:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /api/ {
    proxy_pass http://backend:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    proxy_pass http://frontend:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

This would be more efficient as it bypasses Next.js for backend routes, but the Next.js rewrites solution works without nginx configuration changes.

## Notes

- Next.js rewrites are evaluated at **build time**, so `BACKEND_URL` must be available during `npm run build`
- The rewrites use the Docker service name `backend:8000` for internal communication
- This solution works regardless of nginx configuration
- All portal routes (`/portal/*`) are now accessible through Next.js

