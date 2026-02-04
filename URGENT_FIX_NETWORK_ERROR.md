# 🚨 URGENT FIX: Network Error on Production

## ❌ Current Error

```
Error loading courses: AxiosError
localhost:8031/api/courses/?page_size=100&page=1:1  
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**Problem:** Frontend is still calling `localhost:8031` instead of production URL.

---

## 🔍 Root Cause

The frontend is using the **default localhost URL** because:

1. ❌ `.env.local` file doesn't exist on production server, OR
2. ❌ Frontend wasn't **rebuilt** after creating `.env.local`

**Next.js embeds `NEXT_PUBLIC_*` variables at BUILD TIME, not runtime!**

---

## ✅ IMMEDIATE FIX (On Production Server)

### Step 1: Create `.env.local` File

```bash
# SSH into production server
cd /path/to/topskill-lms/frontend

# Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
NODE_ENV=production
EOF

# Verify file was created
cat .env.local
```

**Expected output:**
```
NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
NODE_ENV=production
```

### Step 2: REBUILD Frontend (CRITICAL!)

```bash
# Still in frontend directory
npm run build
```

**This step is MANDATORY!** Next.js embeds environment variables at build time.

### Step 3: Restart Frontend Server

**If using PM2:**
```bash
pm2 restart topskill-frontend
# or
pm2 restart all
```

**If using Docker:**
```bash
docker-compose restart frontend
# or rebuild
docker-compose down
docker-compose build frontend
docker-compose up -d
```

**If using systemd:**
```bash
sudo systemctl restart topskill-frontend
```

**If using npm/node directly:**
```bash
# Stop current process (Ctrl+C)
# Then start again
npm start
# or
npm run start
```

---

## 🔍 Verification Steps

### 1. Check Browser Console

After rebuild and restart, open browser console on production site:

```javascript
// Should show production URL (NOT localhost)
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
// Expected: https://topskill-lms.server3.purelogics.net/api
```

### 2. Check Network Tab

1. Open DevTools → Network tab
2. Refresh page
3. Look for API calls
4. Should see: `https://topskill-lms.server3.purelogics.net/api/courses/`
5. Should NOT see: `localhost:8031` or `localhost:8000`

### 3. Check Courses Load

- Homepage should show courses
- No "Loading courses..." stuck
- No network errors in console

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Created file but didn't rebuild
```bash
# Wrong - just creating file isn't enough
echo "NEXT_PUBLIC_API_URL=..." > .env.local
# Missing: npm run build
```

### ❌ Mistake 2: Rebuilt but didn't restart
```bash
# Wrong - rebuild alone isn't enough if server is running
npm run build
# Missing: Restart server
```

### ❌ Mistake 3: Wrong file location
```bash
# Wrong - file in wrong directory
cd /path/to/topskill-lms
echo "..." > .env.local  # ❌ Should be in frontend/

# Correct
cd /path/to/topskill-lms/frontend
echo "..." > .env.local  # ✅
```

### ❌ Mistake 4: Wrong file name
```bash
# Wrong
echo "..." > .env  # ❌

# Correct
echo "..." > .env.local  # ✅
```

---

## 🔧 If Still Not Working

### Check 1: Verify File Exists
```bash
cd frontend
ls -la .env.local
# Should show file exists
```

### Check 2: Verify File Contents
```bash
cat .env.local
# Should show production URL (not localhost)
```

### Check 3: Verify Build Used New Env
```bash
# Check build output
npm run build 2>&1 | grep -i "api\|env"
# Should not show localhost
```

### Check 4: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### Check 5: Check Server Logs
```bash
# If using PM2
pm2 logs topskill-frontend

# If using Docker
docker-compose logs frontend

# Look for any errors
```

---

## 📋 Complete Checklist

- [ ] Created `.env.local` in `frontend/` directory
- [ ] File contains production API URL (not localhost)
- [ ] Ran `npm run build` after creating file
- [ ] Restarted frontend server after rebuild
- [ ] Verified browser console shows production URL
- [ ] Verified Network tab shows production API calls
- [ ] Courses load on homepage
- [ ] No network errors in console

---

## 🎯 Expected Result

After completing all steps:

✅ Browser console shows: `API Base URL: https://topskill-lms.server3.purelogics.net/api`  
✅ Network tab shows: `https://topskill-lms.server3.purelogics.net/api/courses/`  
✅ Courses load on homepage  
✅ No `localhost:8031` errors  
✅ No `ERR_CONNECTION_REFUSED` errors  

---

## 🚀 Quick Command Summary

```bash
# On production server
cd /path/to/topskill-lms/frontend

# 1. Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
NODE_ENV=production
EOF

# 2. Rebuild (CRITICAL!)
npm run build

# 3. Restart (choose one based on your setup)
pm2 restart all
# OR
docker-compose restart frontend
# OR
sudo systemctl restart topskill-frontend
```

---

## ⚡ Why This Happens

Next.js embeds `NEXT_PUBLIC_*` environment variables **at build time** into the JavaScript bundle. This means:

- ❌ Changing `.env.local` alone does NOT update running app
- ❌ Restarting server alone does NOT update running app
- ✅ You MUST rebuild after changing environment variables
- ✅ Then restart the server

This is different from runtime environment variables - Next.js needs a rebuild!




