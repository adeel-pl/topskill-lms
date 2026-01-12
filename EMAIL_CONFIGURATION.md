# Email Configuration Guide

## Overview
The TopSkill LMS now supports email notifications for:
- User registration (welcome emails)
- Password reset requests
- Password change confirmations
- Course enrollment confirmations

## Email Backend Configuration

### Option 1: Gmail SMTP (Recommended for Development)

Add these environment variables to your `.env` file or Docker environment:

```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Use App Password, not regular password
DEFAULT_FROM_EMAIL=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

**Note for Gmail:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (16 characters) as `EMAIL_HOST_PASSWORD`

### Option 2: Other SMTP Servers

For other email providers, update the settings accordingly:

```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USE_TLS=True  # or False if using SSL
EMAIL_USE_SSL=False  # Set to True if using port 465
EMAIL_HOST_USER=your-email@yourdomain.com
EMAIL_HOST_PASSWORD=your-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

### Option 3: Console Backend (Development Only)

For development/testing without actual email sending:

```bash
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

This will print emails to the console instead of sending them.

### Option 4: File Backend (Development Only)

Save emails to files:

```bash
EMAIL_BACKEND=django.core.mail.backends.filebased.EmailBackend
EMAIL_FILE_PATH=/path/to/email/messages
```

## Docker Configuration

If using Docker, add email settings to `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
      - EMAIL_HOST=smtp.gmail.com
      - EMAIL_PORT=587
      - EMAIL_USE_TLS=True
      - EMAIL_HOST_USER=your-email@gmail.com
      - EMAIL_HOST_PASSWORD=your-app-password
      - DEFAULT_FROM_EMAIL=your-email@gmail.com
      - FRONTEND_URL=http://localhost:3000
```

## Testing Email Configuration

1. Start the backend server
2. Try registering a new user - you should receive a welcome email
3. Try the "Forgot Password" feature - you should receive a reset link
4. Check your email inbox (and spam folder)

## Email Templates

Currently, emails are sent as plain text. The system sends emails for:

1. **Registration**: Welcome email when a user signs up
2. **Password Reset**: Link to reset password (expires in 24 hours)
3. **Password Changed**: Confirmation when password is changed
4. **Enrollment**: Confirmation when user enrolls in a course

## Troubleshooting

### Emails not sending?
1. Check email settings in `.env` or Docker environment
2. Verify SMTP credentials are correct
3. Check firewall/network settings
4. For Gmail, ensure App Password is used (not regular password)
5. Check backend logs for email errors

### Emails going to spam?
1. Use a proper domain email (not Gmail) for production
2. Set up SPF, DKIM, and DMARC records
3. Use a professional email service (SendGrid, Mailgun, AWS SES)

## Production Recommendations

For production, consider using:
- **SendGrid**: https://sendgrid.com
- **Mailgun**: https://www.mailgun.com
- **AWS SES**: https://aws.amazon.com/ses/
- **Postmark**: https://postmarkapp.com

These services provide better deliverability and analytics.

















