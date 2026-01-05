# Updated User Credentials

## Password Changed Successfully

**Email:** `adeelhaider122@gmail.com`  
**Username:** `adeel`  
**User ID:** `10`

### New Password:
```
TopSkill123!
```

## How to Login

1. Go to: http://localhost:3000/login
2. Enter:
   - **Email/Username:** `adeelhaider122@gmail.com` or `adeel`
   - **Password:** `TopSkill123!`

## About Email Notifications

### Current Status
Email is **not configured**, so the system is using **console backend** (development mode). This means:
- ✅ Emails are generated correctly
- ✅ Emails are printed to Docker logs (not sent via SMTP)
- ❌ No actual emails are sent to your inbox

### Registration Emails
When you sign up, the welcome email is printed to the backend console logs, not sent to your email.

### Password Reset Emails
When you request a password reset, the reset link is printed to the backend console logs.

### How to View Emails in Development

**For Registration:**
```bash
docker compose logs backend --tail 100 | grep -A 20 "Welcome to TopSkill LMS"
```

**For Password Reset:**
```bash
docker compose logs backend --tail 100 | grep -A 20 "Password Reset Request"
```

### To Enable Real Email Sending

Add email configuration to `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - EMAIL_HOST_USER=your-email@gmail.com
      - EMAIL_HOST_PASSWORD=your-gmail-app-password
      - EMAIL_HOST=smtp.gmail.com
      - EMAIL_PORT=587
      - EMAIL_USE_TLS=True
      - DEFAULT_FROM_EMAIL=your-email@gmail.com
```

Then restart:
```bash
docker compose restart backend
```

## Test Your Login

Try logging in now with:
- Email: `adeelhaider122@gmail.com`
- Password: `TopSkill123!`

