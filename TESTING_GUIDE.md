# Testing Guide - Complete LMS System

## 🚀 Quick Start

### 1. Start Docker Services
```bash
docker-compose up --build
```

This will:
- Start PostgreSQL database
- Start Django backend on port 8000
- Start Next.js frontend on port 3000
- Run migrations automatically
- Seed initial data

### 2. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

## ✅ What's Fixed

### CSS/Styling
- ✅ Fixed Tailwind CSS v4 configuration
- ✅ Added `important: true` to force CSS priority
- ✅ Enhanced CSS specificity with !important flags
- ✅ Added custom utility classes with high specificity
- ✅ Fixed CSS override issues
- ✅ All styles now properly applied and visible

### Backend CRUD Operations
- ✅ **CourseSection** - Full CRUD via `/api/sections/`
- ✅ **Lecture** - Full CRUD via `/api/lectures/`
- ✅ **Quiz** - Full CRUD via `/api/quizzes/`
- ✅ **QuizAttempt** - Full CRUD via `/api/quiz-attempts/`
- ✅ **Assignment** - Full CRUD via `/api/assignments/`
- ✅ **AssignmentSubmission** - Full CRUD via `/api/assignment-submissions/`
- ✅ **LectureProgress** - Full CRUD via `/api/lecture-progress/`
- ✅ **Resource** - Full CRUD via `/api/resources/`
- ✅ **Note** - Full CRUD via `/api/notes/`
- ✅ All existing ViewSets (Course, Enrollment, Payment, etc.)

### Django Admin
- ✅ All models registered in admin panel
- ✅ Proper list displays, filters, and search fields
- ✅ Read-only fields configured correctly

### Docker Configuration
- ✅ Fixed backend Dockerfile with proper dependencies
- ✅ Fixed frontend Dockerfile with npm ci
- ✅ Added healthchecks to docker-compose
- ✅ Fixed environment variables
- ✅ Added proper error handling in commands

## 📋 API Endpoints

### Courses
- `GET /api/courses/` - List all courses
- `GET /api/courses/{id}/` - Course details
- `POST /api/courses/{id}/enroll/` - Enroll in course
- `GET /api/courses/{id}/recommendations/` - Get recommendations

### Course Content
- `GET /api/sections/` - List sections (filter by `?course={id}`)
- `POST /api/sections/` - Create section (instructor only)
- `GET /api/lectures/` - List lectures (filter by `?section={id}` or `?course={id}`)
- `POST /api/lectures/` - Create lecture (instructor only)

### Quizzes
- `GET /api/quizzes/` - List quizzes (filter by `?course={id}`)
- `POST /api/quizzes/` - Create quiz (instructor only)
- `GET /api/quiz-attempts/` - List attempts (filter by `?quiz={id}` or `?enrollment={id}`)
- `POST /api/quiz-attempts/` - Submit quiz attempt

### Assignments
- `GET /api/assignments/` - List assignments (filter by `?course={id}`)
- `POST /api/assignments/` - Create assignment (instructor only)
- `GET /api/assignment-submissions/` - List submissions
- `POST /api/assignment-submissions/` - Submit assignment

### Progress & Notes
- `GET /api/lecture-progress/` - Get progress (filter by `?enrollment={id}` or `?lecture={id}`)
- `POST /api/lecture-progress/` - Update progress
- `GET /api/notes/` - List notes
- `POST /api/notes/` - Create note

### Resources
- `GET /api/resources/` - List resources (filter by `?course={id}`)
- `POST /api/resources/` - Create resource (instructor only)

### Other Endpoints
- `GET /api/enrollments/` - User enrollments
- `GET /api/cart/` - Shopping cart
- `GET /api/wishlist/` - Wishlist items
- `GET /api/notifications/` - User notifications
- `GET /api/reviews/` - Course reviews

## 🧪 Testing Checklist

### Frontend
- [ ] Homepage loads with proper styling
- [ ] Course cards display correctly
- [ ] Course detail page shows all information
- [ ] Cart functionality works
- [ ] Enrollment flow works
- [ ] Course player loads and plays videos
- [ ] Dashboard pages load correctly
- [ ] All CSS styles are applied (check browser inspector)

### Backend APIs
- [ ] All CRUD operations work for each model
- [ ] Permissions are enforced correctly
- [ ] Filtering and search work
- [ ] Error handling is proper
- [ ] Authentication works (JWT tokens)

### Docker
- [ ] All containers start without errors
- [ ] Database connects successfully
- [ ] Backend serves API correctly
- [ ] Frontend connects to backend
- [ ] No port conflicts

## 🔍 Debugging

### CSS Not Working?
1. Check browser console for CSS errors
2. Inspect element to see if classes are applied
3. Check if Tailwind is compiling: `npm run build` in frontend
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### API Errors?
1. Check backend logs: `docker-compose logs backend`
2. Check if database is connected
3. Verify JWT token is valid
4. Check CORS settings in settings.py

### Docker Issues?
1. Rebuild containers: `docker-compose up --build --force-recreate`
2. Check logs: `docker-compose logs`
3. Verify ports are not in use
4. Check database connection string

## 📝 Notes

- All CSS now uses `!important` where needed to override Tailwind
- Tailwind config has `important: true` to ensure priority
- Custom utility classes available: `.bg-purelogics-primary`, `.text-purelogics-green`, etc.
- All models have proper CRUD operations
- Permissions are enforced: instructors can manage their courses, students can only access their own data















