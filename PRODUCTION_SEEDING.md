# 🌱 Production Database Seeding Guide

## Current Situation

### Production Database: **12 courses** ✅
- The seeder creates exactly **12 courses**:
  - 8 Online courses
  - 2 Physical courses  
  - 1 Hybrid course
  - 1 Internship course

### Local Database: **25 courses** 📊
- You have more courses on local (likely added manually or from multiple seed runs)

---

## 📊 Seeder Breakdown

The `seed_data.py` creates:

1. **Online Courses (8):**
   - Python for Beginners
   - PostgreSQL Advanced
   - Git & GitHub Mastery
   - Shopify E-commerce Mastery
   - Django Web Development
   - React - The Complete Guide
   - Node.js Backend Development
   - Full Stack Django & React

2. **Physical Courses (2):**
   - Python Programming - Physical Class
   - Web Development Bootcamp

3. **Hybrid Courses (1):**
   - Full Stack Development - Hybrid

4. **Internship Courses (1):**
   - Software Development Internship

**Total: 12 courses**

---

## 🎯 Options to Get All 25 Courses on Production

### Option 1: Export from Local and Import to Production (Recommended)

```bash
# On LOCAL machine:
cd backend
python manage.py dumpdata lms.Course --indent 2 > courses_export.json

# Then on PRODUCTION server:
cd backend
python manage.py loaddata courses_export.json
```

### Option 2: Run Seeder on Production (Will only create 12 courses)

```bash
# On PRODUCTION server:
cd backend
python manage.py seed_data
```

### Option 3: Add Missing Courses Manually

1. Go to Django Admin on production: `https://topskill-lms.server3.purelogics.net/admin/`
2. Add courses manually
3. Or use Django shell to add courses programmatically

---

## 🔍 Check Current Course Count

### On Production:
```bash
# SSH into production server
cd /path/to/backend
python manage.py shell

# Then in Python shell:
from lms.models import Course
print(f'Total courses: {Course.objects.count()}')
```

### On Local:
```bash
cd backend
python manage.py shell

# Then in Python shell:
from lms.models import Course
print(f'Total courses: {Course.objects.count()}')
```

---

## 🚀 Recommended Action

Since you have 25 courses on local and want them on production:

1. **Export courses from local:**
   ```bash
   cd backend
   python manage.py dumpdata lms.Course lms.CourseSection lms.Lecture --indent 2 > courses_full_export.json
   ```

2. **Transfer to production server:**
   ```bash
   scp courses_full_export.json user@server3.purelogics.net:/path/to/backend/
   ```

3. **Import on production:**
   ```bash
   # On production server
   cd backend
   python manage.py loaddata courses_full_export.json
   ```

---

## ⚠️ Important Notes

1. **Export includes relationships:** Make sure to export related models (sections, lectures, etc.)
2. **User references:** Courses reference instructors (User model), ensure users exist on production
3. **Categories/Tags:** Ensure categories and tags exist before importing courses
4. **Backup first:** Always backup production database before importing

---

## 📋 Full Export Command (Recommended)

```bash
# Export everything related to courses
python manage.py dumpdata \
  lms.Category \
  lms.Tag \
  lms.Course \
  lms.CourseCategory \
  lms.CourseTag \
  lms.CourseSection \
  lms.Lecture \
  --indent 2 > courses_complete_export.json
```

This exports:
- Categories
- Tags
- Courses
- Course-Category relationships
- Course-Tag relationships
- Sections
- Lectures

---

## ✅ After Import

1. Verify courses count:
   ```bash
   python manage.py shell
   from lms.models import Course
   Course.objects.count()  # Should show 25
   ```

2. Check API:
   ```bash
   curl https://topskill-lms.server3.purelogics.net/api/courses/ | jq '.count'
   # Should show 25
   ```

3. Test frontend:
   - Visit homepage
   - Should see all 25 courses






