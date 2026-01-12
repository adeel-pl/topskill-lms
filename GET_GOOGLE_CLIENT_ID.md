# How to Get Google Client ID - Step by Step Guide

Follow these steps to get your Google OAuth Client ID for TopSkill LMS.

## 🚀 Quick Start (5 Minutes)

### Step 1: Go to Google Cloud Console
1. Open your browser
2. Go to: **https://console.cloud.google.com/**
3. Sign in with your Google account

### Step 2: Create a New Project
1. Look at the top of the page - you'll see a project dropdown (it might say "Select a project" or show a project name)
2. Click on the project dropdown
3. Click **"NEW PROJECT"** button (top right of the popup)
4. Enter project name: `TopSkill LMS` (or any name you like)
5. Click **"CREATE"**
6. Wait 10-20 seconds for the project to be created
7. Make sure the new project is selected (it should show in the dropdown)

### Step 3: Configure OAuth Consent Screen
1. In the left sidebar, click **"APIs & Services"**
2. Click **"OAuth consent screen"** (in the left menu)
3. You'll see a form - fill it out:

   **User Type:**
   - Select **"External"** (for testing/development)
   - Click **"CREATE"**

   **App Information:**
   - **App name:** `TopSkill LMS`
   - **User support email:** Select your email from the dropdown
   - **App logo:** (Skip this - optional)
   - **Application home page:** `http://localhost:3000`
   - **Application privacy policy link:** (Leave empty for now)
   - **Application terms of service link:** (Leave empty for now)
   - **Authorized domains:** (Leave empty for localhost)
   - **Developer contact information:** Your email address
   
   Click **"SAVE AND CONTINUE"**

   **Scopes:**
   - Click **"ADD OR REMOVE SCOPES"**
   - You'll see a list - check these boxes:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Click **"UPDATE"** (bottom right)
   - Click **"SAVE AND CONTINUE"**

   **Test users:**
   - Click **"+ ADD USERS"**
   - Type your Google email address
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

   **Summary:**
   - Review everything
   - Click **"BACK TO DASHBOARD"**

### Step 4: Create OAuth Client ID
1. In the left sidebar, click **"APIs & Services"**
2. Click **"Credentials"** (in the left menu)
3. At the top, click the **"+ CREATE CREDENTIALS"** button
4. Select **"OAuth client ID"** from the dropdown

   **If you see a warning:**
   - It might say "To create an OAuth client ID, you must first configure the consent screen"
   - If so, go back and complete Step 3 above
   - Then come back here

5. **Application type:** Select **"Web application"**

6. **Name:** Type `TopSkill LMS Web Client` (or any name)

7. **Authorized JavaScript origins:**
   - Click **"+ ADD URI"**
   - Type: `http://localhost:3000`
   - Press Enter or click outside
   - Click **"+ ADD URI"** again
   - Type: `http://127.0.0.1:3000`
   - Press Enter

8. **Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - Type: `http://localhost:3000`
   - Press Enter
   - Click **"+ ADD URI"** again
   - Type: `http://127.0.0.1:3000`
   - Press Enter

9. Click **"CREATE"** button (bottom right)

### Step 5: Copy Your Client ID
A popup window will appear showing:
- **Your Client ID** ← **THIS IS WHAT YOU NEED!**
- Your Client Secret (you don't need this)

**The Client ID looks like:**
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**Copy the entire Client ID** (click the copy icon or select and copy)

**Click "OK" to close the popup**

---

## ✅ What to Do Next

### 1. Add to Backend
Create or edit `backend/.env` file:
```bash
GOOGLE_CLIENT_ID=your-copied-client-id-here.apps.googleusercontent.com
```

**Example:**
```bash
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

### 2. Add to Frontend
Create or edit `frontend/.env.local` file:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-copied-client-id-here.apps.googleusercontent.com
```

**Example:**
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**Important:** 
- Use the **SAME Client ID** in both files
- The frontend variable **MUST** start with `NEXT_PUBLIC_`
- No quotes needed around the Client ID

### 3. Restart Servers
After adding the environment variables:

**Backend:**
```bash
cd backend
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Test It!
1. Go to `http://localhost:3000/login`
2. Click the **Google** button
3. Sign in with your Google account
4. You should be logged in! 🎉

---

## 🔍 Where to Find Your Client ID Later

If you need to find your Client ID again:

1. Go to **https://console.cloud.google.com/**
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Find **"OAuth 2.0 Client IDs"** section
5. Click on your client name
6. You'll see the Client ID there

---

## ❌ Troubleshooting

### "OAuth consent screen is not configured"
**Solution:** Complete Step 3 above (Configure OAuth Consent Screen)

### "Can't find Credentials page"
**Solution:** 
- Make sure you're in the correct project (check dropdown at top)
- Go to: APIs & Services > Credentials

### "Client ID not working"
**Check:**
- ✅ Did you copy the **Client ID** (not Client Secret)?
- ✅ Is it the same in both `.env` files?
- ✅ Did you restart both servers after adding the variables?
- ✅ Does the Client ID end with `.apps.googleusercontent.com`?

### "Google Sign-In button not showing"
**Check:**
- ✅ Is `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set in `frontend/.env.local`?
- ✅ Did you restart the frontend server?
- ✅ Check browser console for errors (F12)

### "Invalid token error"
**Check:**
- ✅ Is `GOOGLE_CLIENT_ID` set in `backend/.env`?
- ✅ Did you restart the backend server?
- ✅ Are both Client IDs exactly the same?

---

## 📝 Quick Checklist

- [ ] Created Google Cloud project
- [ ] Configured OAuth consent screen
- [ ] Created OAuth Client ID
- [ ] Copied the Client ID
- [ ] Added to `backend/.env` as `GOOGLE_CLIENT_ID=...`
- [ ] Added to `frontend/.env.local` as `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...`
- [ ] Restarted backend server
- [ ] Restarted frontend server
- [ ] Tested login at `http://localhost:3000/login`

---

## 🎯 Need Help?

If you get stuck at any step:
1. Check the error message
2. Look at the troubleshooting section above
3. Make sure you completed all previous steps
4. Try refreshing the Google Cloud Console page

The most common issue is forgetting to configure the OAuth consent screen first (Step 3). Make sure you complete that before creating the Client ID!

