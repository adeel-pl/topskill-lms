# 🚀 Production Server Setup Guide

## Current Issues on https://topskill-lms.server3.purelogics.net/

1. ❌ **API URL pointing to localhost** - Frontend calling `http://localhost:8000/api` instead of production
2. ❌ **Registration failing** - API calls going to wrong URL
3. ❌ **Courses not loading** - API URL mismatch
4. ❌ **Hydration error** - React server/client mismatch

---

## 🔧 Quick Fix (Production Server)

### Step 1: Set Production API URL

**On your production server, create/update the environment variable:**

```bash
# SSH into your production server
cd /path/to/topskill-lms/frontend

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
NODE_ENV=production
EOF
```

### Step 2: Rebuild Frontend

**Next.js requires rebuild when `NEXT_PUBLIC_*` variables change:**

```bash
cd frontend
npm run build
# Then restart your production server (PM2, systemd, etc.)
```

**If using Docker:**
```bash
docker-compose down
docker-compose build frontend
docker-compose up -d
```

---

## 📝 Production Docker Compose Configuration

**Update `docker-compose.prod.yml` (create this file):**

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: topskill_lms
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build: ./backend
    command: sh -c "python manage.py migrate && python manage.py seed_data || true && python manage.py runserver 0.0.0.0:8000"
    volumes:
      - ./backend:/app
      - backend_static:/app/staticfiles
      - backend_media:/app/media
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD:-postgres}@db:5432/topskill_lms
      - PAYFAST_MERCHANT_ID=${PAYFAST_MERCHANT_ID:-}
      - PAYFAST_MERCHANT_KEY=${PAYFAST_MERCHANT_KEY:-}
      - GROQ_API_KEY=${GROQ_API_KEY:-}
      - GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
      - PYTHONUNBUFFERED=1
      - ALLOWED_HOSTS=topskill-lms.server3.purelogics.net,localhost
    depends_on:
      - db
    restart: unless-stopped

  frontend:
    build: 
      context: ./frontend
      args:
        - NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
        - NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
      - NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  backend_static:
  backend_media:
```

---

## 🔍 Verification Steps

### 1. Check API URL in Browser Console

Open https://topskill-lms.server3.purelogics.net/ and check console:
```javascript
// Should show production URL
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
// Expected: https://topskill-lms.server3.purelogics.net/api
```

### 2. Check Network Requests

1. Open DevTools → Network tab
2. Try to register or load courses
3. Verify requests go to: `https://topskill-lms.server3.purelogics.net/api/...`
4. Should NOT see `localhost:8000` or `localhost:8031`

### 3. Test Registration

1. Go to https://topskill-lms.server3.purelogics.net/register
2. Fill form and submit
3. Check Network tab - should call: `https://topskill-lms.server3.purelogics.net/api/auth/register/`
4. Should work without errors

### 4. Test Courses Loading

1. Go to homepage
2. Check if courses load
3. Check Network tab - should call: `https://topskill-lms.server3.purelogics.net/api/courses/`
4. Should see course data

---

## ⚠️ Important Notes

1. **Next.js Environment Variables**: `NEXT_PUBLIC_*` variables are embedded at **build time**, not runtime
2. **Rebuild Required**: After changing `NEXT_PUBLIC_*` variables, you MUST rebuild
3. **CORS Settings**: Ensure backend `ALLOWED_HOSTS` includes your production domain
4. **HTTPS**: Make sure your production API uses HTTPS (not HTTP)

---

## 🐛 Fixing Hydration Error

The hydration error might be from:
1. **Server/Client Mismatch**: Ensure same rendering on server and client
2. **Date/Time Differences**: Avoid using `new Date()` in initial render
3. **Browser-only APIs**: Don't use `window`, `document` in initial render

**Quick fix**: Ensure all components using browser APIs are marked with `'use client'` and wrapped in `useEffect`.

---

## 📞 Support

If issues persist:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Check server logs for backend errors
4. Verify environment variables are set correctly
5. Ensure frontend is rebuilt after env var changes

