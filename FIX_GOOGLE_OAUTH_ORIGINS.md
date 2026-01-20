# Fix Google OAuth "Origin Not Allowed" Error

## Error Message
```
The given origin is not allowed for the given client ID.
```

## Solution: Add Authorized Origins in Google Cloud Console

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Select your project: **topskill-lms**

### Step 2: Navigate to OAuth Credentials
1. Go to **APIs & Services** > **Credentials**
2. Find your OAuth 2.0 Client ID: `370863717645-duhkahlagvn68fguvndire3dhvbu363e`
3. Click on it to edit

### Step 3: Add Authorized JavaScript Origins
Click **"+ ADD URI"** and add these URLs (one at a time):

**For Development:**
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:3001` (if using alternate port)

**For Docker/Container:**
- `http://0.0.0.0:3000` (if needed)

**For Production (when deploying):**
- `https://yourdomain.com`
- `https://www.yourdomain.com`

### Step 4: Add Authorized Redirect URIs
Make sure these are also added:

**For Development:**
- `http://localhost:3000`
- `http://127.0.0.1:3000`

**For Production:**
- `https://yourdomain.com`
- `https://www.yourdomain.com`

### Step 5: Save
1. Click **"SAVE"** at the bottom
2. Wait a few seconds for changes to propagate

### Step 6: Test
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+Shift+R)
3. Try Google login again

## Important Notes

- **No trailing slashes:** Use `http://localhost:3000` NOT `http://localhost:3000/`
- **Exact match required:** The origin must match exactly what's in the console
- **Propagation time:** Changes can take 1-5 minutes to take effect
- **HTTPS in production:** Always use `https://` for production domains

## Current Configuration Needed

Based on your setup, make sure these are added:

✅ `http://localhost:3000`
✅ `http://127.0.0.1:3000`

## Troubleshooting

### Still getting the error?
1. **Check browser console** - The exact origin will be shown in the error
2. **Verify the origin** - Make sure it matches exactly (including http/https, port, no trailing slash)
3. **Wait a few minutes** - Google's changes can take time to propagate
4. **Clear browser cache** - Old cached credentials might cause issues
5. **Check if using Docker** - The origin might be different if accessing via Docker IP

### Check Current Origins
You can see what origins are currently configured by:
1. Going to Google Cloud Console
2. APIs & Services > Credentials
3. Click on your OAuth Client ID
4. Scroll to "Authorized JavaScript origins"


















