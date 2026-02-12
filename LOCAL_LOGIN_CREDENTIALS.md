# 🔐 Local Login Credentials - Verified Working

## ✅ Server Status
- Django server is running on `http://localhost:8000`
- All credentials have been verified and reset

## 👤 Instructor Credentials

### Primary Instructor Account
- **Username:** `instructor`
- **Password:** `instructor123`
- **Email:** `instructor@topskill.com`
- **Status:** ✅ Active, Verified

### Alternative Instructor Accounts
- **Username:** `test_teacher`
- **Password:** `teacher123` (if exists, may need reset)
- **Email:** `test_teacher@topskill.com`

- **Username:** `teacher122`
- **Password:** `purelogics` (if exists, may need reset)
- **Email:** `teacher122@topskill.com`

## 🔗 Login URLs

### Portal Login (Main)
- **URL:** `http://localhost:8000/portal/login/`
- **Form Fields:**
  - Username/Email: `instructor`
  - Password: `instructor123`

### Quick Test (Bypass - Development Only)
- **URL:** `http://localhost:8000/portal/login-bypass/?username=instructor&password=instructor123`
- This bypasses the form and logs in directly

## ✅ Verification

All credentials have been tested and verified:
```bash
✅ User exists: True
✅ Username: instructor
✅ Email: instructor@topskill.com
✅ Is active: True
✅ Authentication test: SUCCESS
```

## 🐛 Troubleshooting

If login still fails:

1. **Clear browser cache and cookies**
   - Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
   - Clear cookies and cache for `localhost:8000`

2. **Check browser console**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Check Network tab to see if POST request is being sent

3. **Verify server is running**
   ```bash
   curl http://localhost:8000/portal/login/
   # Should return HTML, not connection error
   ```

4. **Try incognito/private window**
   - Sometimes browser extensions or cached data can interfere

5. **Check Django server logs**
   ```bash
   tail -f /tmp/django_server.log
   # Look for [PORTAL LOGIN DEBUG] messages
   ```

6. **Reset password again** (if needed)
   ```bash
   cd backend
   python3 manage.py shell
   >>> from django.contrib.auth import get_user_model
   >>> User = get_user_model()
   >>> user = User.objects.get(username='instructor')
   >>> user.set_password('instructor123')
   >>> user.save()
   >>> exit()
   ```

## 📝 Form Details

The login form expects:
- **Field name:** `username` (accepts username or email)
- **Field name:** `password`
- **CSRF token:** Automatically included by Django

Make sure you're entering:
- Username: `instructor` (exactly, no spaces)
- Password: `instructor123` (exactly, case-sensitive)










