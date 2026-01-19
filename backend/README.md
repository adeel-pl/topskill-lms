# TopSkill LMS Backend

Django REST API backend for TopSkill Learning Management System supporting both online and physical courses.

## Features

- ✅ Course Management (Online, Physical, Hybrid)
- ✅ Automatic Batch Management
- ✅ Student Enrollment & Progress Tracking
- ✅ PayFast Payment Integration (Pakistan)
- ✅ Groq AI Integration for Course Recommendations
- ✅ Attendance Tracking for Physical Classes
- ✅ Certificate Generation
- ✅ Role-based Access Control (Admin, Instructor, Student)
- ✅ RESTful API with Token Authentication

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file or set environment variables:

```bash
# PayFast Configuration
export PAYFAST_MERCHANT_ID='your_merchant_id'
export PAYFAST_MERCHANT_KEY='your_merchant_key'
export PAYFAST_PASSPHRASE='your_passphrase'
export PAYFAST_SANDBOX='True'  # Set to 'False' for production
export PAYFAST_RETURN_URL='http://localhost:3000/payment/success'
export PAYFAST_CANCEL_URL='http://localhost:3000/payment/cancel'
export PAYFAST_NOTIFY_URL='http://localhost:8000/api/payments/notify/'

# Groq API
export GROQ_API_KEY='your_groq_api_key'

# Database (Optional - defaults to SQLite)
export DB_NAME='topskill_lms'
export DB_USER='postgres'
export DB_PASSWORD='your_password'
export DB_HOST='localhost'
export DB_PORT='5432'
```

### 3. Database Setup

For SQLite (default):
```bash
python manage.py migrate
```

For PostgreSQL:
1. Uncomment PostgreSQL configuration in `config/settings.py`
2. Create database: `createdb topskill_lms`
3. Run migrations: `python manage.py migrate`

### 4. Create Superuser

```bash
python manage.py createsuperuser
```

### 5. Run Development Server

```bash
python manage.py runserver
```

API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/login/` - Get authentication token

### Courses
- `GET /api/courses/` - List all courses
- `GET /api/courses/{id}/` - Get course details
- `POST /api/courses/{id}/enroll/` - Enroll in a course
- `GET /api/courses/{id}/recommendations/` - Get AI recommendations

### Batches
- `GET /api/batches/` - List batches
- `GET /api/batches/{id}/sessions/` - Get batch sessions
- `GET /api/batches/{id}/attendance/` - Get batch attendance

### Enrollments
- `GET /api/enrollments/` - List user enrollments
- `POST /api/enrollments/` - Create enrollment
- `POST /api/enrollments/{id}/update_progress/` - Update progress

### Payments
- `POST /api/payments/` - Create payment (returns PayFast URL)
- `POST /api/payments/notify/` - PayFast webhook

### Attendance
- `GET /api/attendance/` - List attendance records
- `POST /api/attendance/mark/` - Mark attendance

### Reviews
- `GET /api/reviews/` - List reviews
- `POST /api/reviews/` - Create review

### Wishlist
- `GET /api/wishlist/` - List wishlist items
- `POST /api/wishlist/` - Add to wishlist

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/{id}/mark_read/` - Mark as read

### Chatbot
- `POST /api/chatbot/` - Get AI response

## Batch Management

The system automatically creates batches when:
- Enrollment exceeds batch capacity
- Physical or hybrid courses require batch assignment

Batches are created with:
- Automatic naming: `{Course Title} - Batch {N}`
- Capacity based on course `max_batch_size`
- Auto-assignment of students to available batches

## PayFast Integration

1. Create payment: `POST /api/payments/` with `course` and `amount`
2. Redirect user to returned `payment_url`
3. PayFast will call webhook at `/api/payments/notify/`
4. Enrollment is automatically activated on successful payment

## Groq AI Integration

- Course recommendations based on user's enrolled courses
- Chatbot for student support
- Set `GROQ_API_KEY` environment variable to enable

## Testing

```bash
python manage.py test
```

## Production Deployment

1. Set `DEBUG = False` in `settings.py`
2. Configure `ALLOWED_HOSTS`
3. Use PostgreSQL database
4. Set up proper CORS origins
5. Configure static files serving
6. Use environment variables for secrets




































