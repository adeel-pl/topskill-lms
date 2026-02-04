# 🚨 LIVE SERVER FIXES - https://topskill-lms.server3.purelogics.net/

## 🔴 Critical Issues

### Issue 1: API URL is `localhost` instead of production URL
**Symptom:** 
- Courses not showing (empty)
- Registration calling `http://localhost:8031/api/auth/register/`
- All API calls failing

**Root Cause:** 
`NEXT_PUBLIC_API_URL` environment variable not set on production server

**Fix:**
```bash
# On production server, in frontend directory:
echo "NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api" > .env.local

# Then REBUILD (required for Next.js):
npm run build
# Restart your server
```

### Issue 2: React Hydration Error
**Symptom:**
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
Did not expect server HTML to contain a <div> in <div>.
```

**Root Cause:**
Server-rendered HTML doesn't match client-rendered HTML (likely from form structure or conditional rendering)

**Fix:**
This is usually a warning and doesn't break functionality, but can be fixed by ensuring consistent rendering.

---

## ✅ IMMEDIATE ACTION REQUIRED

### On Production Server:

1. **SSH into server:**
```bash
ssh user@server3.purelogics.net
cd /path/to/topskill-lms/frontend
```

2. **Create/Update `.env.local`:**
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
NODE_ENV=production
EOF
```

3. **Rebuild Frontend (CRITICAL - Next.js requires rebuild):**
```bash
npm run build
# or if using PM2:
pm2 restart topskill-frontend
# or if using systemd:
sudo systemctl restart topskill-frontend
```

4. **If using Docker:**
```bash
# Update docker-compose.yml frontend environment:
environment:
  - NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api

# Then rebuild:
docker-compose down
docker-compose build frontend
docker-compose up -d
```

---

## 🔍 Verification

After applying fixes, verify:

1. **Open browser console on production site:**
   - Should see: `API Base URL: https://topskill-lms.server3.purelogics.net/api`
   - Should NOT see: `localhost:8000` or `localhost:8031`

2. **Check Network tab:**
   - Registration should call: `https://topskill-lms.server3.purelogics.net/api/auth/register/`
   - Courses should call: `https://topskill-lms.server3.purelogics.net/api/courses/`

3. **Test functionality:**
   - ✅ Courses load on homepage
   - ✅ Registration works
   - ✅ Login works
   - ✅ No console errors about localhost

---

## 📋 Files to Update (if not using .env.local)

### Option 1: Update `docker-compose.yml` (if using Docker)

Change line 59:
```yaml
# FROM:
- NEXT_PUBLIC_API_URL=http://localhost:8000/api

# TO:
- NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
```

### Option 2: Update `next.config.js` (not recommended for production)

```javascript
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://topskill-lms.server3.purelogics.net/api',
},
```

**Note:** Using `.env.local` is the recommended approach.

---

## ⚠️ Important Notes

1. **Next.js Build-Time Variables**: `NEXT_PUBLIC_*` variables are embedded at **build time**, not runtime
2. **Rebuild Required**: You MUST rebuild after changing `NEXT_PUBLIC_*` variables
3. **CORS**: Ensure backend `ALLOWED_HOSTS` includes `topskill-lms.server3.purelogics.net`
4. **HTTPS**: Production should use HTTPS (not HTTP)

---

## 🎯 Expected Result

After applying fixes:
- ✅ All API calls go to `https://topskill-lms.server3.purelogics.net/api`
- ✅ Courses load correctly
- ✅ Registration works
- ✅ Login works
- ✅ No localhost errors in console
- ✅ No hydration errors (or minimal warnings)

---

## 📞 If Issues Persist

1. Check browser console for specific errors
2. Check Network tab for failed requests
3. Verify `.env.local` file exists and has correct URL
4. Verify frontend was rebuilt after env var change
5. Check backend logs for CORS or other errors
6. Verify backend is accessible at `https://topskill-lms.server3.purelogics.net/api/`




