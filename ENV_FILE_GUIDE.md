# 📝 Environment File Guide for Next.js

## ✅ Use `.env.local` (Not `.env`)

### Why `.env.local`?

1. **Next.js Standard**: `.env.local` is the recommended file for environment-specific variables
2. **Gitignored**: Already in `.gitignore` (won't be committed to git)
3. **Takes Precedence**: Overrides `.env` if both exist
4. **Environment-Specific**: Perfect for production vs development settings

---

## 📁 File Location

**Create in:** `frontend/.env.local`

```
topskill-lms/
└── frontend/
    └── .env.local  ← Create here
```

---

## 📋 File Contents

```bash
NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
NODE_ENV=production
```

---

## 🚀 How to Create

### Option 1: Command Line (Recommended)

```bash
cd frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
NODE_ENV=production
EOF
```

### Option 2: Manual Creation

```bash
cd frontend
nano .env.local
# Paste the content above
# Save: Ctrl+X, then Y, then Enter
```

### Option 3: Using echo

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api" > .env.local
echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com" >> .env.local
echo "NODE_ENV=production" >> .env.local
```

---

## ⚠️ Important Notes

1. **Rebuild Required**: After creating/updating `.env.local`, you MUST rebuild:
   ```bash
   npm run build
   ```

2. **Build-Time Variables**: `NEXT_PUBLIC_*` variables are embedded at build time, not runtime

3. **File Location**: Must be in `frontend/` directory (same level as `package.json`)

4. **No Quotes Needed**: Don't use quotes around values:
   ```bash
   # ✅ Correct
   NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
   
   # ❌ Wrong
   NEXT_PUBLIC_API_URL="https://topskill-lms.server3.purelogics.net/api"
   ```

5. **No Trailing Slash**: Don't add trailing slash to API URL:
   ```bash
   # ✅ Correct
   NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
   
   # ❌ Wrong
   NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api/
   ```

---

## 🔍 Verification

After creating the file:

```bash
# Check file exists
ls -la frontend/.env.local

# View contents
cat frontend/.env.local

# Should show:
# NEXT_PUBLIC_API_URL=https://topskill-lms.server3.purelogics.net/api
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=370863717645-duhkahlagvn68fguvndire3dhvbu363e.apps.googleusercontent.com
# NODE_ENV=production
```

---

## 📊 Next.js Environment File Priority

Next.js loads environment files in this order (higher priority overrides lower):

1. `.env.local` ← **Use this for production**
2. `.env.development` or `.env.production` (based on NODE_ENV)
3. `.env`

---

## 🎯 Summary

- ✅ **Use**: `.env.local`
- ❌ **Don't use**: `.env` (unless you want it committed to git)
- 📁 **Location**: `frontend/.env.local`
- 🔄 **After changes**: Rebuild with `npm run build`




