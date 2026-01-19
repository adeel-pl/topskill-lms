# 🎯 TopSkill LMS - Complete Demo Guide

## 📍 Where Everything Is Located

### Backend Code (Django/Python)
**Location**: `/backend/lms/`

- `models.py` - All database models (Course, Batch, Enrollment, Cart, etc.)
- `views.py` - Main API endpoints
- `auth_views.py` - JWT authentication (login, register)
- `cart_views.py` - Shopping cart functionality
- `course_player_views.py` - **Udemy-like course player API**
- `serializers.py` - API data serialization
- `urls.py` - API route definitions
- `services.py` - PayFast & Groq AI integration

### Frontend Code (Next.js/React)
**Location**: `/frontend/app/`

- `page.tsx` - Homepage (course listings)
- `courses/[slug]/page.tsx` - Course detail page
- `learn/[slug]/page.tsx` - **Udemy-like course player** (Left sidebar + Video)
- `login/page.tsx` - Login page
- `register/page.tsx` - Registration page
- `lib/api.ts` - API client for backend
- `lib/store.ts` - State management (Zustand)

## 🚀 Running the Complete Demo

### Step 1: Start Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Create admin user
python manage.py runserver
```

✅ Backend running at: `http://localhost:8000`

### Step 2: Start Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
npm run dev
```

✅ Frontend running at: `http://localhost:3000`

## 🎬 Demo Flow

### 1. Create Test Course (Admin)

1. Go to `http://localhost:8000/admin`
2. Login with superuser credentials
3. Create a **Course**:
   - Title: "Python for Beginners"
   - Description: "Learn Python from scratch"
   - Price: 49.99
   - Modality: Online
   - Slug: `python-for-beginners`
4. Create **Course Sections**:
   - Section 1: "Introduction"
   - Section 2: "Variables and Data Types"
5. Create **Lectures**:
   - Lecture 1: "Welcome to Python" (YouTube video ID)
   - Lecture 2: "Installing Python"
   - Add `youtube_video_id` for each lecture

### 2. Test Frontend

1. **Homepage**: `http://localhost:3000`
   - See all courses listed
   - Click on a course

2. **Course Detail**: `http://localhost:3000/courses/python-for-beginners`
   - View course information
   - Click "Enroll Now" or "Add to Cart"

3. **Register/Login**: `http://localhost:3000/register`
   - Create account
   - Login at `http://localhost:3000/login`

4. **Course Player** (Udemy-like): `http://localhost:3000/learn/python-for-beginners`
   - **Left Sidebar**: Course content (sections, lectures)
   - **Right Panel**: Video player
   - Click lectures to switch videos
   - Progress is tracked automatically

## 🎨 Udemy-like Features

### Course Player Interface
- ✅ **Left Sidebar**: Course content tree
- ✅ **Video Player**: YouTube integration
- ✅ **Progress Tracking**: Automatic watch time tracking
- ✅ **Lecture Navigation**: Next/Previous buttons
- ✅ **Completion Indicators**: Checkmarks for completed lectures

### Shopping Cart
- ✅ Add courses to cart
- ✅ Checkout process
- ✅ Payment integration ready (PayFast)

### Enrollment System
- ✅ One-click enrollment
- ✅ Automatic progress tracking
- ✅ Certificate generation on completion

## 📱 All Pages

| Page | URL | Description |
|------|-----|-------------|
| Homepage | `/` | Browse all courses |
| Course Detail | `/courses/{slug}` | Course information & enrollment |
| Course Player | `/learn/{slug}` | **Udemy-like learning interface** |
| Login | `/login` | User login |
| Register | `/register` | User registration |
| Cart | `/cart` | Shopping cart |

## 🔑 API Endpoints (Backend)

All APIs are at: `http://localhost:8000/api/`

### Key Endpoints:
- `POST /api/auth/register/` - Register
- `POST /api/auth/login/` - Login (JWT)
- `GET /api/courses/` - List courses
- `GET /api/courses/{id}/player/content/` - **Course player content**
- `POST /api/cart/add-item/` - Add to cart
- `POST /api/courses/{id}/enroll/` - Enroll

## ✅ What's Complete

### Backend (100%)
- ✅ All models and database
- ✅ JWT authentication
- ✅ Course player API (Udemy-style)
- ✅ Cart system
- ✅ Payment integration
- ✅ Progress tracking
- ✅ All CRUD operations

### Frontend (Core Pages)
- ✅ Homepage
- ✅ Course detail page
- ✅ **Udemy-like course player**
- ✅ Login/Register
- ✅ Shopping cart (basic)

## 🎯 Next Steps (Optional)

You can add:
- Dashboard pages
- My Courses page
- Certificates page
- Profile settings
- More styling/polish

## 🐛 Troubleshooting

**Backend not starting?**
- Check Python version (3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Run migrations: `python manage.py migrate`

**Frontend not starting?**
- Install dependencies: `npm install`
- Check `.env.local` file exists
- Check Node version (18+)

**API errors?**
- Make sure backend is running
- Check CORS settings in `backend/config/settings.py`
- Verify API URL in `.env.local`

## 📞 Summary

**Everything is ready!**

- **Backend**: Complete Django REST API
- **Frontend**: Core Udemy-like interface
- **Demo**: Fully functional

Just run both servers and start using the system!




































