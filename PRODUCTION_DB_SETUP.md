# 🗄️ Production Database Setup Guide

## 🔍 The Issue Explained

### Problem
When testing locally, credentials were being set in the **local database**, but the application was running in **Docker** which uses a **separate Docker database**. This caused authentication failures.

### Solution for Production
On production, you have two options:

1. **Use Database Dump** (Recommended for testing) - Restore the exact same database
2. **Run Seed Commands** - Let Django create users with seed_data command

---

## 📦 Option 1: Using Database Dump (Recommended)

### Step 1: Export Database from Local Docker

```bash
# Create dump from local Docker database
docker exec topskill-lms-db-1 pg_dump -U postgres topskill_lms > database_dump.sql
```

### Step 2: Transfer to Production Server

```bash
# Copy dump file to production server
scp database_dump.sql user@topskill-lms.server3.purelogics.net:/path/to/topskill-lms/
```

### Step 3: Restore on Production

**On production server:**

```bash
# SSH into production server
ssh user@topskill-lms.server3.purelogics.net

# Navigate to project directory
cd /path/to/topskill-lms

# Stop services (if running)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Copy dump into Docker container and restore
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d db
sleep 5  # Wait for DB to start

# Restore database
docker exec -i topskill-lms-db-1 psql -U postgres -d topskill_lms < database_dump.sql

# Or if using different container name:
cat database_dump.sql | docker exec -i <db-container-name> psql -U postgres -d topskill_lms

# Restart all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Step 4: Verify

```bash
# Check users exist
docker exec topskill-lms-backend-1 python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
print('Users:', User.objects.count())
print('Instructor:', User.objects.filter(username='instructor').exists())
"
```

---

## 🌱 Option 2: Using Seed Commands

### On Production Server:

```bash
# SSH into production server
ssh user@topskill-lms.server3.purelogics.net

# Navigate to project directory
cd /path/to/topskill-lms

# Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for services to be ready
sleep 10

# Run seed command (creates all users and data)
docker exec topskill-lms-backend-1 python manage.py seed_data

# Set specific passwords if needed
docker exec topskill-lms-backend-1 python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(username='instructor')
user.set_password('instructor123')
user.save()
print('Password set for instructor')
"
```

---

## 🔐 Default Credentials (After Seed/Dump)

### Admin User
- **Username:** `admin`
- **Password:** `admin123` (or set via `ADMIN_PASSWORD` env var)
- **Email:** `admin@topskill.com`

### Instructor User
- **Username:** `instructor`
- **Password:** `instructor123` (or set via `INSTRUCTOR_PASSWORD` env var)
- **Email:** `instructor@topskill.com`

### Student User
- **Username:** `student`
- **Password:** `student123` (or set via `STUDENT_PASSWORD` env var)
- **Email:** `student@topskill.com`

### Additional Instructors (from dump)
- **Username:** `test_teacher` / **Password:** `teacher123`
- **Username:** `teacher122` / **Password:** `purelogics`

---

## 🚨 Important Notes

### 1. Database Connection
Make sure production `docker-compose.yml` has correct database settings:
```yaml
environment:
  - DATABASE_URL=postgresql://postgres:postgres@db:5432/topskill_lms
```

### 2. Migrations
After restoring dump, migrations should already be applied. But if needed:
```bash
docker exec topskill-lms-backend-1 python manage.py migrate
```

### 3. Static Files
After restoring, collect static files:
```bash
docker exec topskill-lms-backend-1 python manage.py collectstatic --noinput
```

### 4. Password Security
⚠️ **Change default passwords in production!**

```bash
# Set secure passwords via environment variables
export ADMIN_PASSWORD=your_secure_password
export INSTRUCTOR_PASSWORD=your_secure_password
export STUDENT_PASSWORD=your_secure_password

# Then run seed with env vars
docker exec -e ADMIN_PASSWORD=$ADMIN_PASSWORD \
           -e INSTRUCTOR_PASSWORD=$INSTRUCTOR_PASSWORD \
           -e STUDENT_PASSWORD=$STUDENT_PASSWORD \
           topskill-lms-backend-1 python manage.py seed_data
```

---

## 🔄 Complete Production Setup Workflow

```bash
# 1. On production server, pull latest code
cd /path/to/topskill-lms
git pull origin main

# 2. Stop services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# 3. Restore database dump
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d db
sleep 5
cat database_dump.sql | docker exec -i topskill-lms-db-1 psql -U postgres -d topskill_lms

# 4. Rebuild and start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 5. Verify
docker exec topskill-lms-backend-1 python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
print('Total users:', User.objects.count())
"
```

---

## 📋 Database Dump File

The dump file `database_dump.sql` contains:
- ✅ All user accounts with passwords (hashed)
- ✅ All courses, sections, lectures
- ✅ All enrollments and progress
- ✅ All assignments, quizzes, submissions
- ✅ All categories, tags, reviews
- ✅ Complete database schema

**File Location:** `database_dump.sql` (in project root)

---

## 🐛 Troubleshooting

### Issue: "relation does not exist"
**Solution:** Run migrations first:
```bash
docker exec topskill-lms-backend-1 python manage.py migrate
```

### Issue: "password authentication failed"
**Solution:** Check database credentials in docker-compose.yml match dump

### Issue: "connection refused"
**Solution:** Wait for database to fully start:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d db
sleep 10  # Wait longer
```

### Issue: Users not authenticating
**Solution:** Reset passwords manually:
```bash
docker exec topskill-lms-backend-1 python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(username='instructor')
user.set_password('instructor123')
user.save()
"
```

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Database restored successfully
- [ ] Users can log in at `/portal/login/`
- [ ] Admin can access `/admin/`
- [ ] Instructor can access `/portal/instructor/`
- [ ] Courses are visible
- [ ] API endpoints work at `/api/courses/`





