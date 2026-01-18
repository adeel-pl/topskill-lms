# How to Get Password Reset Link (Development Mode)

## Current Status
Since email is not configured, the system is using **console backend** which prints emails to the console instead of sending them.

## How to Get Your Reset Link

### Method 1: Check Docker Logs (Recommended)

1. Request password reset from the frontend: `http://localhost:3000/forgot-password`
2. Enter your email: `adeelhaider122@gmail.com`
3. Check the backend logs for the reset link:

```bash
docker compose logs backend --tail 100 | grep -A 20 "Password Reset Request"
```

The reset link will be in the email content printed to console.

### Method 2: Check Backend Console Directly

If running backend directly (not Docker), the email will be printed to your terminal.

## Example Reset Link Format

The reset link will look like:
```
http://localhost:3000/reset-password/[uid]/[token]/
```

Where:
- `[uid]` is a base64 encoded user ID
- `[token]` is the password reset token

## To Enable Real Email Sending

Add these environment variables to `docker-compose.yml` or `.env`:

```yaml
environment:
  - EMAIL_HOST_USER=your-email@gmail.com
  - EMAIL_HOST_PASSWORD=your-app-password
  - EMAIL_HOST=smtp.gmail.com
  - EMAIL_PORT=587
  - EMAIL_USE_TLS=True
  - DEFAULT_FROM_EMAIL=your-email@gmail.com
```

For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character App Password (not your regular password)

## Quick Test

Run this to see the latest reset link:
```bash
docker compose logs backend --tail 200 | grep -B 5 -A 15 "reset-password"
```


























