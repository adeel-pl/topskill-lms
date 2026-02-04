# 📋 Complete List of Seeder Files

## 🎯 Primary Seeders (Run for Initial Setup)

### 1. **Main Database Seeder** ⭐ PRIMARY
**File:** `backend/lms/management/commands/seed_data.py`  
**Command:** `python manage.py seed_data`  
**Purpose:** 
- Creates comprehensive initial database data
- Creates users (admin, instructor, students)
- Creates courses, sections, lectures
- Creates categories, tags
- Creates enrollments, reviews, quizzes, assignments
- Creates payments, carts, wishlists
- Creates batches, sessions, attendance
- Creates forums, Q&As, announcements
- Creates certificates, notifications, notes
- **Total:** ~12 courses, 36 sections, 114 lectures, 8 users, 24 enrollments, etc.

**Usage:**
```bash
# Basic usage
python manage.py seed_data

# Skip existing courses
python manage.py seed_data --skip-existing
```

**Environment Variables:**
- `ADMIN_PASSWORD` - Admin user password
- `INSTRUCTOR_PASSWORD` - Instructor user password  
- `STUDENT_PASSWORD` - Student user password

---

### 2. **Portal Data Ensurer**
**File:** `backend/portal/management/commands/ensure_portal_data.py`  
**Command:** `python manage.py ensure_portal_data`  
**Purpose:**
- Ensures instructor user exists
- Assigns instructors to courses without instructors
- Creates sample enrollments, assignments, quizzes
- Creates batch sessions and attendance data
- Ensures portal has sufficient data for display

**Usage:**
```bash
python manage.py ensure_portal_data
```

**Environment Variables:**
- `INSTRUCTOR_PASSWORD` - Instructor user password

---

## 🔧 Maintenance/Update Seeders (Run as Needed)

### 3. **Complete Courses Ensurer**
**File:** `backend/lms/management/commands/ensure_complete_courses.py`  
**Command:** `python manage.py ensure_complete_courses`  
**Purpose:**
- Ensures all courses have complete sections and lectures
- Fills missing course content
- Updates lecture content based on course title
- Adds video IDs to lectures

**Usage:**
```bash
# Basic usage (only fills missing data)
python manage.py ensure_complete_courses

# Force update all courses
python manage.py ensure_complete_courses --force
```

---

### 4. **Video IDs Updater**
**File:** `backend/lms/management/commands/update_video_ids.py`  
**Command:** `python manage.py update_video_ids`  
**Purpose:**
- Updates all lecture video IDs with reliable educational YouTube videos
- Ensures all videos are active and educational
- Uses course-specific video mappings from `video_ids.py`

**Usage:**
```bash
# Basic usage (only updates missing video IDs)
python manage.py update_video_ids

# Force update all video IDs
python manage.py update_video_ids --force
```

**Helper File:** `backend/lms/management/commands/video_ids.py`  
- Contains educational YouTube video ID mappings by topic
- Used by both `seed_data.py` and `update_video_ids.py`

---

### 5. **Course Images Updater**
**File:** `backend/lms/management/commands/update_course_images.py`  
**Command:** `python manage.py update_course_images`  
**Purpose:**
- Updates course thumbnails with relevant images
- Maps course titles to appropriate Unsplash images
- Ensures all courses have proper thumbnails

**Usage:**
```bash
# Basic usage (only updates missing thumbnails)
python manage.py update_course_images

# Force update all thumbnails
python manage.py update_course_images --force
```

---

### 6. **Missing Certificates Creator**
**File:** `backend/lms/management/commands/create_missing_certificates.py`  
**Command:** `python manage.py create_missing_certificates`  
**Purpose:**
- Creates certificates for completed enrollments that are missing certificates
- Finds enrollments with 100% progress but no certificate
- Generates certificates automatically

**Usage:**
```bash
python manage.py create_missing_certificates
```

---

## 📁 File Structure

```
backend/
├── lms/
│   └── management/
│       └── commands/
│           ├── seed_data.py                    ⭐ PRIMARY SEEDER
│           ├── ensure_complete_courses.py       🔧 MAINTENANCE
│           ├── update_video_ids.py             🔧 MAINTENANCE
│           ├── update_course_images.py         🔧 MAINTENANCE
│           ├── create_missing_certificates.py  🔧 MAINTENANCE
│           └── video_ids.py                    📚 HELPER (video mappings)
│
└── portal/
    └── management/
        └── commands/
            └── ensure_portal_data.py            🎯 PORTAL SEEDER
```

---

## 🚀 Recommended Seeding Order for Production

### Initial Setup (Fresh Database):
```bash
# 1. Run migrations
python manage.py migrate

# 2. Run main seeder (creates all initial data)
python manage.py seed_data

# 3. Ensure portal has sufficient data
python manage.py ensure_portal_data

# 4. Ensure all courses are complete
python manage.py ensure_complete_courses

# 5. Update course images
python manage.py update_course_images
```

### Maintenance (Existing Database):
```bash
# Fill any missing course content
python manage.py ensure_complete_courses

# Update missing video IDs
python manage.py update_video_ids

# Create missing certificates
python manage.py create_missing_certificates

# Update course images
python manage.py update_course_images
```

---

## 🐳 Docker Integration

The main seeder is automatically run in Docker:
```yaml
# docker-compose.yml (line 24)
command: sh -c "python manage.py migrate && python manage.py seed_data || true && python manage.py runserver 0.0.0.0:8000"
```

**Note:** The `|| true` ensures the container starts even if seeding fails.

---

## ⚠️ Important Notes for Production

1. **Environment Variables:** Set passwords via environment variables:
   ```bash
   export ADMIN_PASSWORD=your_secure_password
   export INSTRUCTOR_PASSWORD=your_secure_password
   export STUDENT_PASSWORD=your_secure_password
   ```

2. **Skip Existing:** Use `--skip-existing` flag to avoid overwriting existing data:
   ```bash
   python manage.py seed_data --skip-existing
   ```

3. **Force Updates:** Use `--force` flags carefully - they will overwrite existing data:
   ```bash
   python manage.py ensure_complete_courses --force
   python manage.py update_video_ids --force
   python manage.py update_course_images --force
   ```

4. **Backup First:** Always backup your database before running seeders in production.

5. **Test Environment:** Test all seeders in a staging environment first.

---

## 📊 What Each Seeder Creates

| Seeder | Users | Courses | Sections | Lectures | Other Data |
|--------|-------|---------|----------|----------|------------|
| `seed_data.py` | ✅ 8 | ✅ 12 | ✅ 36 | ✅ 114 | ✅ All models |
| `ensure_portal_data.py` | ✅ 1 (instructor) | ❌ | ❌ | ❌ | ✅ Portal-specific |
| `ensure_complete_courses.py` | ❌ | ❌ | ✅ Missing | ✅ Missing | ❌ |
| `update_video_ids.py` | ❌ | ❌ | ❌ | ✅ Video IDs | ❌ |
| `update_course_images.py` | ❌ | ✅ Images | ❌ | ❌ | ❌ |
| `create_missing_certificates.py` | ❌ | ❌ | ❌ | ❌ | ✅ Certificates |

---

## 🔍 Quick Reference

**Primary Seeder:** `backend/lms/management/commands/seed_data.py`  
**Portal Seeder:** `backend/portal/management/commands/ensure_portal_data.py`  
**Maintenance Seeders:** `ensure_complete_courses.py`, `update_video_ids.py`, `update_course_images.py`, `create_missing_certificates.py`  
**Helper File:** `video_ids.py` (contains video ID mappings)

---

**Last Updated:** 2026-02-02  
**Total Seeder Files:** 6 commands + 1 helper file

