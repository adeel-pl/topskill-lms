# 🔐 Admin Credentials

## Default Admin Account

**URL**: http://localhost:8000/admin/

**Username**: `admin`  
**Password**: `admin123`

## Change Password

To change the admin password:

```bash
cd backend
python manage.py changepassword admin
```

Or create a new superuser:

```bash
python manage.py createsuperuser
```

## API Authentication

The API endpoint `http://localhost:8000/api/` requires authentication. This is **normal behavior**.

To test the API:

1. **Register a user**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/register/ \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@test.com","password":"test123","password2":"test123"}'
   ```

2. **Login to get token**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"test123"}'
   ```

3. **Use token in API calls**:
   ```bash
   curl http://localhost:8000/api/courses/ \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## Public Endpoints (No Auth Required)

Some endpoints don't require authentication:
- `/api/auth/register/` - User registration
- `/api/auth/login/` - User login
- `/api/courses/` - List courses (if configured as public)






































