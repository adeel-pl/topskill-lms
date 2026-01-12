# Google OAuth Setup Guide

This guide will help you set up Google OAuth login for TopSkill LMS.

## Prerequisites

- A Google Cloud Platform (GCP) account
- Access to Google Cloud Console

## Step 1: Create Google OAuth Credentials

### Detailed Step-by-Step Instructions:

#### 1.1. Access Google Cloud Console
- Open your browser and go to: **https://console.cloud.google.com/**
- Sign in with your Google account (use the account you want to manage the OAuth credentials with)

#### 1.2. Create or Select a Project
- If you see a project dropdown at the top, click it
- Click **"New Project"** (or select an existing project)
- **New Project:**
  - Project name: `TopSkill LMS` (or any name you prefer)
  - Click **"Create"**
  - Wait a few seconds for the project to be created
  - Make sure the new project is selected in the dropdown

#### 1.3. Enable Google+ API (if needed)
- In the left sidebar, go to **"APIs & Services"** > **"Library"**
- Search for **"Google+ API"** or **"People API"**
- Click on it and click **"Enable"** (if not already enabled)
- This is usually enabled by default, but good to check

#### 1.4. Configure OAuth Consent Screen
- In the left sidebar, go to **"APIs & Services"** > **"OAuth consent screen"**
- Choose user type:
  - **External** - For testing and public use (recommended for development)
  - **Internal** - Only for Google Workspace users
- Click **"Create"**

**Fill in the OAuth consent screen:**
- **App name:** `TopSkill LMS`
- **User support email:** Select your email from dropdown
- **App logo:** (Optional - you can skip this)
- **Application home page:** `http://localhost:3000` (for now)
- **Application privacy policy link:** (Optional - skip for development)
- **Application terms of service link:** (Optional - skip for development)
- **Authorized domains:** (Leave empty for localhost development)
- **Developer contact information:** Your email address

Click **"Save and Continue"**

**Scopes (Step 2):**
- Click **"Add or Remove Scopes"**
- In the filter, search and select:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
  - `openid`
- Click **"Update"**
- Click **"Save and Continue"**

**Test users (Step 3 - if External):**
- Click **"Add Users"**
- Add your Google email address (and any other test emails)
- Click **"Add"**
- Click **"Save and Continue"**

**Summary (Step 4):**
- Review the information
- Click **"Back to Dashboard"**

#### 1.5. Create OAuth Client ID
- In the left sidebar, go to **"APIs & Services"** > **"Credentials"**
- Click the **"+ CREATE CREDENTIALS"** button at the top
- Select **"OAuth client ID"**

**If you see a warning about OAuth consent screen:**
- Click **"Configure Consent Screen"** and complete the steps above
- Then come back to Credentials

**Create OAuth client ID:**
- **Application type:** Select **"Web application"**
- **Name:** `TopSkill LMS Web Client` (or any name)
- **Authorized JavaScript origins:**
  - Click **"+ ADD URI"**
  - Add: `http://localhost:3000`
  - Click **"+ ADD URI"** again
  - Add: `http://127.0.0.1:3000`
  - (For production, add: `https://yourdomain.com`)
- **Authorized redirect URIs:**
  - Click **"+ ADD URI"**
  - Add: `http://localhost:3000`
  - Click **"+ ADD URI"** again
  - Add: `http://127.0.0.1:3000`
  - (For production, add: `https://yourdomain.com`)

- Click **"CREATE"**

#### 1.6. Copy Your Client ID
- A popup will appear showing:
  - **Your Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
  - **Your Client Secret** (keep this secret, but you won't need it for this implementation)
- **Copy the Client ID** - this is what you need!
- Click **"OK"**

**Important:** The Client ID will look something like:
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

#### 1.7. View Credentials Later (if needed)
- You can always view your Client ID again by going to:
  - **APIs & Services** > **Credentials**
  - Find your OAuth 2.0 Client ID in the list
  - Click on it to view or edit

## Step 2: Configure Backend

Add the Google Client ID to your backend environment variables:

```bash
# In your .env file or environment
export GOOGLE_CLIENT_ID='your-google-client-id.apps.googleusercontent.com'
```

Or add it to your `backend/.env` file:
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Step 3: Configure Frontend

Add the Google Client ID to your frontend environment variables:

Create or update `frontend/.env.local`:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Important:** The frontend variable must start with `NEXT_PUBLIC_` to be accessible in the browser.

## Step 4: Install Dependencies

### Backend
```bash
cd backend
pip install google-auth==2.23.4
```

### Frontend
```bash
cd frontend
npm install @react-oauth/google
```

## Step 5: Restart Servers

After setting up the environment variables:

1. Restart the backend server:
```bash
cd backend
python manage.py runserver
```

2. Restart the frontend server:
```bash
cd frontend
npm run dev
```

## Testing

1. Navigate to `http://localhost:3000/login`
2. Click the **Google** button
3. Sign in with your Google account
4. You should be redirected to the appropriate dashboard based on your role

## Troubleshooting

### "Google OAuth is not configured on the server"
- Make sure `GOOGLE_CLIENT_ID` is set in your backend environment
- Restart the backend server after adding the variable

### "Invalid Google token"
- Verify that the Client ID in frontend matches the one in backend
- Check that the authorized origins include `http://localhost:3000`
- Make sure you're using the correct Client ID (not the Client Secret)

### Google Sign-In button not appearing
- Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `frontend/.env.local`
- Restart the frontend server after adding the variable
- Check browser console for errors

### Token verification fails
- Ensure the Client ID used for verification matches the one used to generate the token
- Check that the token hasn't expired (they expire after 1 hour)
- Verify the OAuth consent screen is properly configured

## Production Setup

For production:

1. Update the OAuth consent screen to **Published** status
2. Add your production domain to authorized origins:
   - `https://yourdomain.com`
3. Add your production domain to redirect URIs:
   - `https://yourdomain.com`
4. Update environment variables in your production environment
5. Ensure both frontend and backend have the same `GOOGLE_CLIENT_ID`

## Security Notes

- Never commit `.env` files to version control
- Keep your Client ID secure (though it's safe to expose in frontend code)
- Never expose your Client Secret
- Use HTTPS in production
- Regularly review OAuth consent screen settings

