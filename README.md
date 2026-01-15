# TopSkill LMS - Complete Udemy-like Learning Management System

## 📁 Project Structure

```
topskill-lms/
├── backend/          # Django REST API (Python)
│   ├── lms/         # Main LMS app
│   │   ├── models.py           # All database models
│   │   ├── views.py            # API views
│   │   ├── serializers.py      # API serializers
│   │   ├── auth_views.py        # JWT authentication
│   │   ├── cart_views.py        # Shopping cart
│   │   ├── course_player_views.py  # Udemy-like player API
│   │   └── urls.py              # API routes
│   └── config/      # Django settings
│       └── settings.py
│
└── frontend/        # Next.js Frontend (React/TypeScript)
    ├── app/         # Next.js app directory
    │   ├── page.tsx              # Homepage
    │   ├── courses/[slug]/       # Course detail page
    │   ├── learn/[slug]/         # Course player (Udemy-style)
    │   ├── login/                # Login page
    │   └── register/             # Registration page
    └── lib/          # Utilities
        ├── api.ts                # API client
        └── store.ts              # State management
```

## 🚀 Quick Start (Complete Demo)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

Backend will run at: `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start frontend server
npm run dev
```

Frontend will run at: `http://localhost:3000`

## 🎯 Features Implemented

### ✅ Backend (Django REST API)
- Complete database models (Course, Batch, Enrollment, Cart, etc.)
- JWT Authentication
- Shopping Cart System
- **Udemy-like Course Player API**
- Payment Integration (PayFast)
- Progress Tracking
- Quiz & Assignment System
- Forum/Discussion
- Certificate Generation
- Batch Management (Physical Courses)
- Attendance Tracking

### ✅ Frontend (Next.js)
- Homepage with course listings
- Course Detail Page
- **Udemy-like Course Player** (Left sidebar + Video player)
- Login/Registration
- Shopping Cart
- Responsive Design

## 📱 Demo Pages

1. **Homepage**: `http://localhost:3000`
   - Browse all courses
   - Featured courses section

2. **Course Detail**: `http://localhost:3000/courses/{slug}`
   - Course information
   - Enroll button
   - Add to cart

3. **Course Player**: `http://localhost:3000/learn/{slug}`
   - **Left Sidebar**: Course content (sections, lectures)
   - **Right Panel**: Video player
   - Progress tracking
   - Next/Previous navigation

4. **Login**: `http://localhost:3000/login`
5. **Register**: `http://localhost:3000/register`
6. **Cart**: `http://localhost:3000/cart`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/profile/` - Get user profile

### Courses
- `GET /api/courses/` - List all courses
- `GET /api/courses/{id}/` - Course details
- `POST /api/courses/{id}/enroll/` - Enroll in course

### Course Player (Udemy-like)
- `GET /api/courses/{id}/player/content/` - Get course content
- `GET /api/courses/{id}/player/lecture/{lecture_id}/` - Get lecture
- `POST /api/courses/{id}/player/lecture/{lecture_id}/progress/` - Update progress

### Cart
- `GET /api/cart/` - Get cart
- `POST /api/cart/add-item/` - Add course to cart
- `POST /api/cart/checkout/` - Checkout

## 🎨 Udemy-like Course Player

The course player mimics Udemy's interface:

- **Left Sidebar**: 
  - Course sections
  - Lectures list
  - Progress indicators
  - Completion checkmarks

- **Right Panel**:
  - Video player (YouTube or direct URL)
  - Lecture title and description
  - Progress tracking
  - Navigation (Next/Previous)

## 🔧 Environment Variables

### Backend (.env or environment)
```bash
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
GROQ_API_KEY=your_groq_api_key
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📝 Testing the Demo

1. **Create a Course** (via Django Admin):
   - Go to `http://localhost:8000/admin`
   - Login with superuser
   - Create a course with sections and lectures
   - Add YouTube video IDs to lectures

2. **Register/Login**:
   - Go to `http://localhost:3000/register`
   - Create an account
   - Login at `http://localhost:3000/login`

3. **Browse Courses**:
   - View courses on homepage
   - Click on a course to see details

4. **Enroll & Learn**:
   - Enroll in a course
   - Start learning in the Udemy-like player
   - Watch videos and track progress

## 🎯 What's Complete

✅ **Backend**: 100% Complete
- All models, APIs, authentication, payments, etc.

✅ **Frontend**: Core Pages Complete
- Homepage, Course Detail, Course Player (Udemy-style)
- Login, Register, Cart

🔄 **Frontend**: Additional Pages (Can be added)
- Dashboard, My Courses, Certificates, etc.

## 🚀 Production Deployment

1. Set `DEBUG = False` in `backend/config/settings.py`
2. Configure `ALLOWED_HOSTS`
3. Use PostgreSQL database
4. Set up environment variables
5. Build frontend: `npm run build`
6. Deploy backend (Django)
7. Deploy frontend (Vercel/Netlify)

## 📞 Support

All code is in:
- **Backend**: `/backend/lms/` directory
- **Frontend**: `/frontend/app/` directory

The system is **fully functional** and ready for use!































