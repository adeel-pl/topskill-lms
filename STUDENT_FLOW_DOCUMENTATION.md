# Complete Student Flow Documentation
## TopSkill LMS - Comprehensive Student Journey Guide

---

## 📋 Table of Contents
1. [Account Creation & Authentication](#1-account-creation--authentication)
2. [Course Discovery & Browsing](#2-course-discovery--browsing)
3. [Course Enrollment](#3-course-enrollment)
4. [Learning Experience](#4-learning-experience)
5. [Assessments (Quizzes & Assignments)](#5-assessments-quizzes--assignments)
6. [Progress Tracking](#6-progress-tracking)
7. [Certificates & Achievements](#7-certificates--achievements)
8. [Dashboard Features](#8-dashboard-features)
9. [Additional Features](#9-additional-features)
10. [User Journey Flowchart](#10-user-journey-flowchart)

---

## 1. Account Creation & Authentication

### 1.1 Registration
**Location:** `/register`

**Process:**
1. Student visits the registration page
2. Fills in required information:
   - Username
   - Email
   - Password (minimum 8 characters)
   - Confirm Password
   - First Name
   - Last Name
3. Optional: Sign up with Google (OAuth)
4. System validates input:
   - Password match verification
   - Email format validation
   - Username uniqueness check
5. Upon successful registration:
   - Account is created
   - Shopping cart is automatically created
   - Welcome email is sent
   - JWT tokens (access & refresh) are generated
   - User is redirected to `/dashboard/my-courses`

**Backend Endpoint:** `POST /api/auth/register/`

**Features:**
- Real-time form validation
- Password strength requirements
- Google OAuth integration
- Automatic cart creation
- Welcome email notification

---

### 1.2 Login
**Location:** `/login`

**Process:**
1. Student enters credentials (username/email + password)
2. Optional: Login with Google
3. System authenticates user
4. JWT tokens are issued
5. User is redirected to dashboard or intended page

**Backend Endpoint:** `POST /api/auth/login/`

**Features:**
- Supports both username and email login
- JWT token-based authentication
- Token refresh mechanism
- Remember me functionality

---

### 1.3 Logout
**Process:**
1. User clicks logout
2. Refresh token is invalidated
3. Cookies are cleared
4. User is redirected to homepage

**Backend Endpoint:** `POST /api/auth/logout/`

---

## 2. Course Discovery & Browsing

### 2.1 Homepage
**Location:** `/`

**Features:**
- **Hero Section:**
  - Animated floating orbs
  - "New to TopSkill?" section with hero image
  - Search bar for course discovery
  - Call-to-action buttons

- **Course Display:**
  - **Trending Courses Section:**
    - Grid/List view toggle
    - Infinite scroll loading (8 courses per batch)
    - Filter by modality (Online/Physical)
    - Course cards showing:
      - Thumbnail
      - Title
      - Instructor name
      - Rating & review count
      - Enrollment count
      - Price
      - Modality badge
      - Total duration & lecture count

- **Course Categories:**
  - Online courses
  - Physical courses
  - Hybrid courses

**Course Card Information:**
- Course thumbnail
- Course title
- Instructor name
- Average rating (stars)
- Number of reviews
- Enrollment count
- Price
- Modality badge (Online/Physical/Hybrid)
- Total duration
- Number of lectures

---

### 2.2 Course Detail Page
**Location:** `/courses/[slug]`

**Features:**
- **Course Overview:**
  - Full course title
  - Instructor information
  - Course description
  - Course statistics:
    - Number of sections
    - Number of lectures
    - Total duration
    - Course level
  - What you'll learn (features list)
  - Course content preview (sections & lectures)
  - Preview lectures (accessible without enrollment)

- **Enrollment Options:**
  - **If Not Enrolled:**
    - "Enroll Now" button (direct enrollment)
    - "Add to Cart" button
    - Price display
  - **If Enrolled:**
    - "Go to Course" button (redirects to course player)
    - Progress indicator

- **Course Information:**
  - Ratings and reviews
  - Student count
  - Course requirements
  - Course description
  - Instructor bio

**Backend Endpoint:** `GET /api/courses/?slug={slug}`

---

### 2.3 Search & Filter
**Features:**
- Real-time search by course title
- Filter by modality (Online, Physical, Hybrid)
- Filter by price range
- Sort by popularity, rating, price, newest

---

## 3. Course Enrollment

### 3.1 Direct Enrollment
**Process:**
1. Student clicks "Enroll Now" on course detail page
2. System checks:
   - If course is free → Direct enrollment
   - If course is paid → Payment required
3. For paid courses:
   - Payment is processed (PayFast integration)
   - Upon successful payment → Enrollment created
4. Enrollment status set to "active"
5. For physical/hybrid courses:
   - Student is automatically assigned to an available batch
   - Notification sent about batch assignment
6. Enrollment confirmation email sent
7. Student redirected to course player

**Backend Endpoint:** `POST /api/courses/{id}/enroll/`

---

### 3.2 Cart & Checkout
**Location:** `/cart`

**Process:**
1. Student adds courses to cart
2. Cart page displays:
   - All courses in cart
   - Individual course prices
   - Total amount
   - Remove item option
3. Student clicks "Checkout"
4. System processes:
   - Payment integration (PayFast)
   - Auto-enrollment in all courses
   - Cart is cleared
5. Student redirected to `/dashboard/my-courses`

**Cart Features:**
- Add multiple courses
- Remove items
- View total price
- One-click checkout
- Empty cart state

**Backend Endpoints:**
- `GET /api/cart/` - Get cart items
- `POST /api/cart/add/` - Add course to cart
- `DELETE /api/cart/remove/{course_id}/` - Remove course
- `POST /api/cart/checkout/` - Process checkout

---

### 3.3 Enrollment Status
**Status Types:**
- **Pending:** Payment initiated but not completed
- **Active:** Successfully enrolled, can access course
- **Completed:** Finished all course content
- **Cancelled:** Enrollment cancelled

---

## 4. Learning Experience

### 4.1 Course Player
**Location:** `/learn/[slug]`

**Layout:**
- **Left Sidebar (320px width):**
  - Course title
  - Number of lectures
  - Collapsible sections
  - Lecture list with:
    - Lecture title
    - Duration
    - Completion status (checkmark)
    - Preview badge (if preview lecture)
    - Active lecture highlight
  - Section progress (e.g., "2/3 completed")

- **Main Content Area:**
  - Video player (YouTube embed)
  - Lecture title
  - Course tabs:
    - **Overview:** Course description, content list
    - **Reviews:** Student reviews and ratings
    - **Notes:** Personal lecture notes
    - **Questions:** Q&A forum
    - **Announcements:** Instructor announcements
    - **Quizzes:** Course quizzes
    - **Assignments:** Course assignments

- **Navigation:**
  - Previous lecture button
  - Next lecture button
  - Mark as complete button

**Features:**
- **Video Playback:**
  - YouTube video embedding
  - Watch position tracking
  - Automatic progress saving
  - Resume from last position

- **Lecture Navigation:**
  - Click any lecture in sidebar to switch
  - Previous/Next buttons
  - Automatic next lecture on completion

- **Progress Tracking:**
  - Real-time progress updates
  - Lecture completion tracking
  - Section completion tracking
  - Course completion percentage

**Backend Endpoints:**
- `GET /api/courses/{id}/player/content/` - Get course content
- `GET /api/courses/{id}/player/lecture/{lecture_id}/` - Get lecture details
- `POST /api/courses/{id}/player/lecture/{lecture_id}/progress/` - Update watch position
- `POST /api/courses/{id}/player/lecture/{lecture_id}/complete/` - Mark lecture complete

---

### 4.2 Preview Access
**For Non-Enrolled Users:**
- Can access preview lectures (marked with "Preview" badge)
- Cannot access full course content
- Redirected to course detail page if trying to access locked content
- Can see course structure but not watch videos

---

### 4.3 Lecture Notes
**Features:**
- Add notes to any lecture
- Edit existing notes
- Delete notes
- Notes are saved per lecture
- Accessible from course player

**Backend Endpoints:**
- `POST /api/courses/{id}/player/lecture/{lecture_id}/note/` - Add note
- `PATCH /api/notes/{note_id}/` - Update note
- `DELETE /api/notes/{note_id}/` - Delete note

---

### 4.4 Q&A Forum
**Features:**
- Ask questions about course content
- View all questions and answers
- Instructor can answer questions
- Students can see Q&A for enrolled courses

---

### 4.5 Announcements
**Features:**
- View instructor announcements
- Important course updates
- Deadline reminders
- Course-related news

---

## 5. Assessments (Quizzes & Assignments)

### 5.1 Quizzes
**Location:** `/learn/[slug]` → Quizzes tab or `/courses/[slug]/quizzes/[quizId]`

**Quiz Features:**
- **Quiz Information:**
  - Quiz title
  - Description
  - Passing score (e.g., 70%)
  - Time limit (if applicable)
  - Number of questions
  - Number of attempts allowed

- **Taking a Quiz:**
  1. Student clicks "Start Quiz"
  2. Quiz attempt is created
  3. Questions are displayed:
     - Multiple choice
     - True/False
     - Short answer
  4. Student selects answers
  5. Student clicks "Submit Quiz"
  6. Quiz is automatically graded
  7. Results displayed:
     - Score percentage
     - Pass/Fail status
     - Correct/incorrect answers
     - Best score (if multiple attempts)

- **Quiz Attempts:**
  - View previous attempts
  - See scores for each attempt
  - Retake quiz (if attempts remaining)
  - Best score tracking

**Backend Endpoints:**
- `GET /api/quizzes/{quiz_id}/` - Get quiz details
- `POST /api/quizzes/{quiz_id}/attempt/` - Create quiz attempt
- `POST /api/quiz-attempts/{attempt_id}/submit/` - Submit quiz answers
- `GET /api/quizzes/{quiz_id}/attempts/` - Get quiz attempts

**Quiz Grading:**
- Automatic grading upon submission
- Points calculated per question
- Total score percentage
- Pass/Fail determination based on passing score

---

### 5.2 Assignments
**Location:** `/learn/[slug]` → Assignments tab

**Assignment Features:**
- **Assignment Information:**
  - Assignment title
  - Description
  - Instructions
  - Due date
  - Maximum score

- **Submitting an Assignment:**
  1. Student views assignment details
  2. Student writes submission text or uploads file
  3. Student clicks "Submit Assignment"
  4. Submission status: "Submitted"
  5. Instructor grades assignment
  6. Student receives feedback and score

- **Assignment Status:**
  - **Submitted:** Assignment submitted, awaiting grading
  - **Graded:** Instructor has graded the assignment
  - **Returned:** Assignment returned with feedback

- **Viewing Results:**
  - Score display
  - Instructor feedback
  - Submission date
  - Grading date

**Backend Endpoints:**
- `GET /api/assignments/{assignment_id}/` - Get assignment details
- `POST /api/assignments/{assignment_id}/submit/` - Submit assignment
- `PATCH /api/assignment-submissions/{submission_id}/` - Update submission

---

## 6. Progress Tracking

### 6.1 Course Progress
**Tracking Metrics:**
- **Lecture Completion:**
  - Each lecture marked as complete/uncomplete
  - Visual indicators in sidebar
  - Checkmark for completed lectures

- **Section Progress:**
  - Shows "X/Y lectures completed" per section
  - Section completion percentage

- **Course Progress:**
  - Overall course completion percentage
  - Calculated as: (Completed Lectures / Total Lectures) × 100
  - Displayed in:
    - Course player
    - My Courses page
    - Purchase History page

**Automatic Updates:**
- Progress updates when lecture is marked complete
- Progress bar animates to show completion
- Real-time progress calculation

**Backend Endpoint:**
- `POST /api/enrollments/{id}/update_progress/` - Manual progress update (admin)

---

### 6.2 Progress Visualization
**Display Locations:**
1. **My Courses Page:**
   - Progress bar per course
   - Percentage display
   - Visual progress indicator

2. **Course Player:**
   - Section progress
   - Overall course progress

3. **Purchase History:**
   - Progress percentage
   - Progress bar

---

## 7. Certificates & Achievements

### 7.1 Certificate Generation
**Trigger:**
- Course completion (100% progress)
- All lectures completed
- All required quizzes passed (if applicable)
- All assignments submitted (if applicable)

**Process:**
1. System detects course completion
2. Enrollment status changes to "completed"
3. Certificate is automatically generated
4. Certificate number is assigned (format: `CERT-{12-char-hex}`)
5. Notification sent to student
6. Certificate PDF is generated on first download

---

### 7.2 Certificate Viewing & Download
**Location:** `/dashboard/certifications`

**Features:**
- **Certificate List:**
  - All earned certificates
  - Course title
  - Certificate number
  - Issue date
  - Download button

- **Certificate Information:**
  - Student name
  - Course title
  - Completion date
  - Certificate number
  - Institution name (TopSkill)

- **Download:**
  - Click "Download Certificate"
  - PDF is generated (if not already generated)
  - PDF downloads to device
  - Filename: `certificate_{certificate_number}.pdf`

**Backend Endpoints:**
- `GET /api/certificates/` - Get all certificates
- `GET /api/certificates/{id}/download/` - Download certificate PDF

---

### 7.3 Certificate Verification
**Location:** `/verify/[certificateNumber]`

**Features:**
- Public verification page
- Enter certificate number
- System verifies certificate authenticity
- Displays certificate details if valid

**Backend Endpoint:**
- `GET /api/verify-certificate/{certificate_number}/` - Verify certificate

---

## 8. Dashboard Features

### 8.1 My Courses
**Location:** `/dashboard/my-courses`

**Features:**
- **Course Grid Display:**
  - All enrolled courses
  - Course thumbnail
  - Course title
  - Status badge (Active/Completed)
  - Modality badge (Online/Physical/Hybrid)
  - Progress bar with percentage
  - Batch information (for physical/hybrid courses)
  - "Continue Learning" button

- **Actions:**
  - Click course card → Go to course player
  - Refresh progress button
  - Filter by status
  - Sort by progress, date enrolled

- **Empty State:**
  - Message: "No courses yet"
  - "Browse Courses" button

**Backend Endpoint:**
- `GET /api/enrollments/` - Get all enrollments

---

### 8.2 Certifications
**Location:** `/dashboard/certifications`

**Features:**
- Grid view of all certificates
- Certificate card showing:
  - Course title
  - Certificate number
  - Issue date
  - Download button
- Empty state if no certificates

**Backend Endpoint:**
- `GET /api/certificates/` - Get all certificates

---

### 8.3 Purchase History
**Location:** `/dashboard/purchase-history`

**Features:**
- **Enrolled Courses Section:**
  - All purchased courses
  - Progress percentage
  - Progress bar
  - "Continue" button (links to course player)

- **Cart Items Section:**
  - Items still in cart
  - "View Cart" button

- **Transaction History:**
  - Payment date
  - Course name
  - Amount paid
  - Payment status
  - Transaction ID

**Backend Endpoint:**
- `GET /api/payments/` - Get payment history

---

### 8.4 Wishlist
**Location:** `/dashboard/wishlist`

**Features:**
- List of saved courses
- Course cards with:
  - Thumbnail
  - Title
  - Price
  - Remove from wishlist button
- "Enroll Now" button for each course
- Empty state if wishlist is empty

**Backend Endpoints:**
- `GET /api/wishlist/` - Get wishlist
- `POST /api/wishlist/add/{course_id}/` - Add to wishlist
- `DELETE /api/wishlist/remove/{course_id}/` - Remove from wishlist

---

### 8.5 Account Settings
**Location:** `/dashboard/account`

**Features:**
- View profile information
- Edit profile:
  - First name
  - Last name
  - Email
  - Username
- Change password
- View account statistics

**Backend Endpoints:**
- `GET /api/auth/profile/` - Get profile
- `PUT /api/auth/profile/update/` - Update profile
- `POST /api/auth/change-password/` - Change password

---

## 9. Additional Features

### 9.1 Notifications
**Types:**
- Enrollment confirmation
- Batch assignment (for physical/hybrid courses)
- Certificate ready
- Course announcements
- Quiz/Assignment reminders

**Display:**
- Notification badge in navbar
- Notification list
- Mark as read functionality

---

### 9.2 Reviews & Ratings
**Features:**
- Rate courses (1-5 stars)
- Write reviews
- View all reviews
- Average rating calculation
- Review moderation

**Location:** Course detail page, Course player → Reviews tab

**Backend Endpoints:**
- `GET /api/courses/{id}/reviews/` - Get reviews
- `POST /api/courses/{id}/reviews/` - Create review

---

### 9.3 Batch Management (Physical/Hybrid Courses)
**Features:**
- Automatic batch assignment
- Batch information display
- Batch schedule
- Attendance tracking (for physical courses)

**Process:**
1. Student enrolls in physical/hybrid course
2. System automatically assigns to available batch
3. If no batch available, new batch is created
4. Student receives notification about batch assignment
5. Batch details shown in course player and My Courses

---

## 10. User Journey Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDENT JOURNEY FLOWCHART                     │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION/LOGIN
   │
   ├─→ Register Account (/register)
   │   ├─→ Fill form / Google OAuth
   │   ├─→ Account created
   │   └─→ Redirect to Dashboard
   │
   └─→ Login (/login)
       ├─→ Enter credentials
       └─→ Access Dashboard

2. COURSE DISCOVERY
   │
   ├─→ Homepage (/)
   │   ├─→ Browse courses
   │   ├─→ Search courses
   │   ├─→ Filter by modality
   │   └─→ View course cards
   │
   └─→ Course Detail (/courses/[slug])
       ├─→ View course info
       ├─→ Preview lectures
       └─→ See reviews & ratings

3. ENROLLMENT
   │
   ├─→ Direct Enrollment
   │   ├─→ Click "Enroll Now"
   │   ├─→ Payment (if paid)
   │   └─→ Enrollment created
   │
   └─→ Cart & Checkout
       ├─→ Add to Cart
       ├─→ View Cart (/cart)
       ├─→ Checkout
       └─→ Auto-enrollment

4. LEARNING
   │
   └─→ Course Player (/learn/[slug])
       ├─→ Watch lectures
       ├─→ Take notes
       ├─→ Complete quizzes
       ├─→ Submit assignments
       ├─→ Track progress
       └─→ Navigate content

5. ASSESSMENTS
   │
   ├─→ Quizzes
   │   ├─→ Start quiz
   │   ├─→ Answer questions
   │   ├─→ Submit quiz
   │   └─→ View results
   │
   └─→ Assignments
       ├─→ View assignment
       ├─→ Submit work
       └─→ View feedback

6. COMPLETION
   │
   ├─→ Course Progress → 100%
   ├─→ Certificate Generated
   ├─→ View Certificate (/dashboard/certifications)
   └─→ Download PDF

7. DASHBOARD
   │
   ├─→ My Courses (/dashboard/my-courses)
   │   ├─→ View enrolled courses
   │   ├─→ Check progress
   │   └─→ Continue learning
   │
   ├─→ Certifications (/dashboard/certifications)
   │   └─→ Download certificates
   │
   ├─→ Purchase History (/dashboard/purchase-history)
   │   └─→ View transactions
   │
   ├─→ Wishlist (/dashboard/wishlist)
   │   └─→ Manage saved courses
   │
   └─→ Account Settings (/dashboard/account)
       └─→ Update profile
```

---

## 📊 Key Statistics Tracked

1. **Course Progress:**
   - Lecture completion count
   - Section completion
   - Overall course percentage

2. **Quiz Performance:**
   - Attempts taken
   - Scores achieved
   - Best score
   - Pass/Fail status

3. **Assignment Performance:**
   - Submission status
   - Scores received
   - Feedback received

4. **Enrollment Statistics:**
   - Number of courses enrolled
   - Completed courses count
   - Certificates earned
   - Total learning hours

---

## 🔐 Security & Permissions

### Access Control:
- **Public Access:**
  - Homepage
  - Course browsing
  - Course detail pages
  - Preview lectures
  - Certificate verification

- **Authenticated Access:**
  - Course enrollment
  - Course player (full access)
  - Dashboard pages
  - Quizzes & Assignments
  - Certificates
  - Wishlist
  - Purchase history

- **Enrollment-Based Access:**
  - Full course content
  - Quizzes
  - Assignments
  - Certificate generation

---

## 📱 Responsive Design

All pages are fully responsive:
- **Mobile:** Optimized for phones (320px+)
- **Tablet:** Optimized for tablets (768px+)
- **Desktop:** Full experience (1024px+)
- **Large Desktop:** Enhanced layout (1440px+)

---

## 🎨 UI/UX Features

- **Animations:**
  - Smooth page transitions
  - Hover effects on cards
  - Progress bar animations
  - Loading states

- **Color System:**
  - Centralized color palette
  - Consistent theming
  - Accessible contrast ratios

- **User Feedback:**
  - Toast notifications
  - Success/Error messages
  - Loading indicators
  - Empty states

---

## 📝 Notes

- All API endpoints require authentication (except public endpoints)
- JWT tokens are used for authentication
- Progress is automatically tracked
- Certificates are generated automatically upon course completion
- Payment integration via PayFast
- Email notifications for important events

---

## 🔄 Data Flow

1. **Frontend (Next.js):**
   - User interactions
   - API calls via `lib/api.ts`
   - State management via Zustand (`lib/store.ts`)
   - UI components

2. **Backend (Django REST Framework):**
   - API endpoints
   - Business logic
   - Database operations
   - Authentication & authorization

3. **Database:**
   - User data
   - Course data
   - Enrollment & progress
   - Certificates
   - Payments

---

## 📞 Support

For issues or questions:
- Email: info@topskills.pk
- Office: Ground Floor, 75 R1, Johar Town, Lahore, 54000, Pakistan

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**System:** TopSkill LMS






