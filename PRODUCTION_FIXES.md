# 🚨 Production Server Fixes

## Issues Found on https://topskill-lms.server3.purelogics.net/

### 1. ❌ **API URL Not Configured**
**Problem:** Frontend is calling `http://localhost:8000/api` instead of production API URL  
**Error:** Courses not showing, registration failing  
**Fix:** Set `NEXT_PUBLIC_API_URL` environment variable

### 2. ❌ **Registration API Error**
**Problem:** Registration form calling `http://localhost:8031/api/auth/register/`  
**Error:** Registration not working  
**Fix:** Same as above - API URL not set

### 3. ❌ **React Hydration Error**
**Problem:** Server HTML doesn't match client HTML  
**Error:** `Hydration failed because the initial UI does not match what was rendered on the server`  
**Fix:** Fix form structure in register page

---

## 🔧 Fixes Required

### Fix 1: Set Production API URL

**On Production Server, create/update `.env.local` file in `frontend/` directory:**

```bash
NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
```

**Or set environment variable:**
```bash
export NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
```

**For Docker deployment, update `docker-compose.yml`:**
```yaml
frontend:
  environment:
    - NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
```

### Fix 2: Fix Hydration Error

The hydration error is caused by nested divs in form elements. Need to ensure consistent structure.

### Fix 3: Rebuild Frontend

After setting environment variables, rebuild the Next.js frontend:
```bash
cd frontend
npm run build
npm start  # or restart your production server
```

---

## 📋 Step-by-Step Fix Instructions

### Step 1: Set Environment Variable on Server

**Option A: Create `.env.local` file**
```bash
cd /path/to/frontend
echo "NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api" > .env.local
```

**Option B: Set in Docker Compose**
Update `docker-compose.yml`:
```yaml
frontend:
  environment:
    - NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
    - NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
    - NODE_ENV=production
```

### Step 2: Rebuild and Restart

```bash
# If using Docker
docker-compose down
docker-compose build frontend
docker-compose up -d

# If using direct Node.js
cd frontend
npm run build
pm2 restart topskill-frontend  # or your process manager
```

### Step 3: Verify

1. Check browser console - should see: `API Base URL: https://topskill-lms.server3.purelogics.net/api`
2. Check Network tab - API calls should go to production URL
3. Test registration - should work now
4. Check courses - should load from production API

---

## 🔍 Debugging

### Check Current API URL
Open browser console on production site and check:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

### Check Network Requests
1. Open DevTools → Network tab
2. Try to register or load courses
3. Check if requests go to `localhost` or production URL

### Verify Environment Variable
```bash
# In frontend directory
cat .env.local
# Should show: NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
```

---

## ⚠️ Important Notes

1. **Next.js Environment Variables**: `NEXT_PUBLIC_*` variables must be set at **build time**, not runtime
2. **Rebuild Required**: After changing `NEXT_PUBLIC_*` variables, you MUST rebuild the Next.js app
3. **Docker**: If using Docker, environment variables in `docker-compose.yml` are used at build time
4. **CORS**: Make sure backend allows requests from `https://topskill-lms.server3.purelogics.net`

---

## 🎯 Expected Results After Fix

✅ Courses load on homepage  
✅ Registration works  
✅ Login works  
✅ All API calls go to production URL  
✅ No hydration errors  
✅ No console errors about localhost













