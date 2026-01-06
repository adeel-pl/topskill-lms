# User Credentials for TopSkill LMS

## 🔐 Admin User (Full Access)

**Username:** `admin`  
**Password:** `admin123`  
**Email:** `admin@topskill.com`

**Access:**
- ✅ Full access to Django Admin Panel
- ✅ Can manage all courses, users, enrollments
- ✅ Can access frontend admin features
- ✅ Can create/edit/delete any content

**Login URLs:**
- Frontend: http://localhost:3000/login
- Django Admin: http://localhost:8000/admin

---

## 👨‍🏫 Instructor User

**Username:** `instructor`  
**Password:** `instructor123`  
**Email:** `instructor@topskill.com`

**Access:**
- ✅ Can create and manage courses
- ✅ Can create sections, lectures, quizzes, assignments
- ✅ Can view enrollments for their courses
- ✅ Can mark attendance for physical classes
- ✅ Can grade assignments and quizzes

**Login URL:**
- Frontend: http://localhost:3000/login

---

## 👨‍🎓 Student User

**Username:** `student`  
**Password:** `student123`  
**Email:** `student@topskill.com`

**Access:**
- ✅ Can browse and enroll in courses
- ✅ Can access course player and watch lectures
- ✅ Can track learning progress
- ✅ Can submit assignments and take quizzes
- ✅ Can view certificates
- ✅ Already enrolled in 12 courses with varying progress

**Login URL:**
- Frontend: http://localhost:3000/login

**Enrolled Courses:**
The student account is pre-enrolled in 12 courses with different progress percentages:
- Python for Beginners (25% progress)
- Django Web Development (45% progress)
- Data Science Fundamentals (60% progress)
- React - The Complete Guide (75% progress)
- Node.js Backend Development (30% progress)
- Machine Learning with Python (50% progress)
- Docker & Kubernetes Mastery (80% progress)
- Advanced JavaScript (15% progress)
- Full Stack Django & React (90% progress)
- Data Visualization with Python (35% progress)
- API Development: REST & GraphQL (65% progress)
- Python Automation & Scripting (100% progress - Completed!)

---

## 🚀 Quick Start

1. **Start the application:**
   ```bash
   docker-compose up --build
   ```

2. **Access the frontend:**
   - Open: http://localhost:3000
   - Click "Log in" or "Sign up"
   - Use any of the credentials above

3. **Access Django Admin:**
   - Open: http://localhost:8000/admin
   - Login with admin credentials

4. **If users don't exist, run seed command:**
   ```bash
   docker exec topskill-lms-backend-1 python manage.py seed_data
   ```
   Or if running locally:
   ```bash
   cd backend
   python manage.py seed_data
   ```

---

## 📝 Creating New Users

### Via Frontend:
1. Go to http://localhost:3000/register
2. Fill in the registration form
3. New users are created as regular students by default

### Via Django Admin:
1. Login to http://localhost:8000/admin
2. Go to "Users" section
3. Click "Add User"
4. Set `is_staff=True` for admin access
5. Set `is_superuser=True` for superuser access

### Via Command Line:
```bash
# Create superuser
docker exec topskill-lms-backend-1 python manage.py createsuperuser

# Or locally
cd backend
python manage.py createsuperuser
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

## 🎯 Testing Different Roles

### Test as Admin:
1. Login with `admin/admin123`
2. Access Django Admin to manage everything
3. Check frontend for admin-specific features

### Test as Instructor:
1. Login with `instructor/instructor123`
2. Try creating a new course
3. Add sections and lectures
4. View enrolled students

### Test as Student:
1. Login with `student/student123`
2. Browse courses
3. Enroll in a course
4. Watch lectures and track progress
5. Check "My Courses" dashboard

---

## 📞 Support

If you have issues logging in:
1. Check if backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify users exist: Check Django Admin
4. Re-run seed command if needed










