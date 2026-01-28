# 🚀 TopSkill LMS - All Portal Credentials

Complete credentials and access URLs for all 4 portals.

---

## 📋 Quick Reference Table

| Portal | Username | Password | URL |
|--------|----------|----------|-----|
| **Student Portal** | `student` | `student123` | http://localhost:3000/login |
| **Instructor Portal** | `instructor` | `instructor123` | http://localhost:8000/portal/login |
| **Admin Portal** | `admin` | `admin123` | http://localhost:8000/portal/login |
| **Django Admin** | `admin` | `admin123` | http://localhost:8000/admin |

---

## 👨‍🎓 1. Student Portal (Frontend)

**URL:** http://localhost:3000/login  
**Username:** `student`  
**Password:** `student123`  
**Email:** `student@topskill.com`

### Access:
- ✅ Browse and enroll in courses
- ✅ Course player - watch lectures
- ✅ Track learning progress
- ✅ Submit assignments and take quizzes
- ✅ View certificates
- ✅ Wishlist management
- ✅ Purchase history
- ✅ Account settings

### Dashboard Pages:
- `/dashboard/my-courses` - My enrolled courses
- `/dashboard/certifications` - Certificates
- `/dashboard/purchase-history` - Payment history
- `/dashboard/wishlist` - Saved courses
- `/dashboard/account` - Account settings

### Pre-enrolled Courses:
The student account is pre-enrolled in 12 courses with varying progress.

---

## 👨‍🏫 2. Instructor Portal (Premium Dashboard)

**URL:** http://localhost:8000/portal/login  
**Username:** `instructor`  
**Password:** `instructor123`  
**Email:** `instructor@topskill.com`

### Access:
- ✅ Dashboard with statistics (courses, students, enrollments)
- ✅ Manage own courses (create, edit, view)
- ✅ View enrolled students for their courses
- ✅ Manage assignments and quizzes
- ✅ View assignment submissions (pending grading)
- ✅ Track student progress
- ✅ Manage batches and sessions (for physical/hybrid courses)
- ✅ Mark attendance

### Portal Pages:
- `/portal/instructor/` - Dashboard home
- `/portal/instructor/courses/` - All instructor's courses
- `/portal/instructor/courses/<id>/` - Course detail with students, assignments, quizzes

### Data Available:
- 12 courses assigned to instructor
- 24 total enrollments
- 12 assignments
- 10 pending submissions (ready for grading)
- 12 quizzes

---

## 👑 3. Admin Portal (Premium Dashboard)

**URL:** http://localhost:8000/portal/login  
**Username:** `admin`  
**Password:** `admin123`  
**Email:** `admin@topskill.com`

### Access:
- ✅ Dashboard with platform-wide statistics
- ✅ View all courses, students, enrollments
- ✅ View all payments and revenue
- ✅ Quick access to all Django admin models
- ✅ Recent activity monitoring
- ✅ Full platform overview

### Portal Pages:
- `/portal/admin-portal/` - Dashboard home
- `/portal/admin-portal/models/` - Quick access to all Django admin models
- `/admin/` - Full Django admin (also accessible)

### Statistics Shown:
- Total courses, students, enrollments
- Total revenue
- Total instructors
- Active courses
- Total assignments and quizzes

---

## ⚙️ 4. Django Admin (Default Admin)

**URL:** http://localhost:8000/admin  
**Username:** `admin`  
**Password:** `admin123`  
**Email:** `admin@topskill.com`

### Access:
- ✅ Full CRUD access to ALL models
- ✅ User management
- ✅ All LMS models (32+ models)
- ✅ Authentication & Authorization
- ✅ Complete system control

### Available Models:
- **Auth:** Users, Groups, Tokens
- **LMS:** All 32+ models including:
  - Courses, Sections, Lectures
  - Enrollments, Payments, Certificates
  - Quizzes, Questions, Assignments
  - Batches, Sessions, Attendance
  - Forums, Posts, Reviews
  - And more...

---

## 🔐 All User Credentials Summary

### Admin User
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@topskill.com`
- **Access:** Full access to all portals + Django admin
- **is_staff:** ✅ Yes
- **is_superuser:** ✅ Yes

### Instructor User
- **Username:** `instructor`
- **Password:** `instructor123`
- **Email:** `instructor@topskill.com`
- **Access:** Instructor Portal + Student Portal (can browse courses)
- **is_staff:** ❌ No
- **Courses:** 12 courses assigned

### Student User
- **Username:** `student`
- **Password:** `student123`
- **Email:** `student@topskill.com`
- **Access:** Student Portal only
- **is_staff:** ❌ No
- **Enrollments:** 12 courses pre-enrolled

---

## 🚀 Quick Start Testing

### Test Student Portal:
1. Go to: http://localhost:3000/login
2. Login: `student` / `student123`
3. Navigate to: `/dashboard/my-courses`

### Test Instructor Portal:
1. Go to: http://localhost:8000/portal/login
2. Login: `instructor` / `instructor123`
3. You'll be redirected to: `/portal/instructor/`
4. View dashboard, courses, students

### Test Admin Portal:
1. Go to: http://localhost:8000/portal/login
2. Login: `admin` / `admin123`
3. You'll be redirected to: `/portal/admin-portal/`
4. View platform statistics and access all models

### Test Django Admin:
1. Go to: http://localhost:8000/admin
2. Login: `admin` / `admin123`
3. Full CRUD access to all models

---

## 📝 Creating/Resetting Users

If users don't exist or you need to reset:

```bash
# Run seed data command
cd backend
python3 manage.py seed_data

# Or ensure portal data
python3 manage.py ensure_portal_data
```

---

## 🔒 Security Note

⚠️ **These are default development credentials. Change them in production!**

For production:
1. Change all default passwords
2. Use strong, unique passwords
3. Enable two-factor authentication
4. Regularly rotate passwords
5. Use environment variables for sensitive data

---

## 🎯 Testing Checklist

### ✅ Student Portal Testing:
- [ ] Login with student credentials
- [ ] View enrolled courses
- [ ] Browse course catalog
- [ ] Add courses to wishlist
- [ ] View purchase history
- [ ] Access course player

### ✅ Instructor Portal Testing:
- [ ] Login with instructor credentials
- [ ] View dashboard statistics
- [ ] View all courses
- [ ] View course detail with students
- [ ] Check pending assignments
- [ ] View enrollments

### ✅ Admin Portal Testing:
- [ ] Login with admin credentials
- [ ] View platform statistics
- [ ] Access "All Models" page
- [ ] View recent courses and enrollments
- [ ] Check all stat cards

### ✅ Django Admin Testing:
- [ ] Login with admin credentials
- [ ] Access all model sections
- [ ] Create/edit/delete records
- [ ] Test user management

---

## 📞 Troubleshooting

### Can't login?
1. Check if backend is running: `python3 manage.py runserver`
2. Verify users exist: Check Django Admin → Users
3. Run seed command: `python3 manage.py seed_data`
4. Run portal data command: `python3 manage.py ensure_portal_data`

### Portal not loading?
1. Check Django server is running on port 8000
2. Check frontend server is running on port 3000
3. Verify portal app is in INSTALLED_APPS
4. Check browser console for errors

### Missing data?
1. Run: `python3 manage.py seed_data` (creates all data)
2. Run: `python3 manage.py ensure_portal_data` (ensures portal has data)

---

## 🎉 Ready to Test!

All portals are ready with test data. Use the credentials above to test each portal!

