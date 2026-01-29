# Complete Instructor Portal Documentation
## TopSkill LMS - Comprehensive Instructor/Teacher Guide

---

## 📋 Table of Contents
1. [Overview & Access](#1-overview--access)
2. [Authentication & Login](#2-authentication--login)
3. [Dashboard Overview](#3-dashboard-overview)
4. [Course Management](#4-course-management)
5. [Course Content Management](#5-course-content-management)
6. [Student Management](#6-student-management)
7. [Assignment Management](#7-assignment-management)
8. [Quiz Management](#8-quiz-management)
9. [Attendance Management](#9-attendance-management)
10. [Analytics & Reports](#10-analytics--reports)
11. [URL Reference](#11-url-reference)
12. [Permissions & Access Control](#12-permissions--access-control)
13. [Future Enhancements](#13-future-enhancements)

---

## 1. Overview & Access

### 1.1 Portal Purpose
The Instructor Portal is a premium, custom-built dashboard designed specifically for teachers and instructors to manage their courses, students, and content. Unlike the default Django admin, this portal provides a user-friendly interface that matches the premium look and feel of the student frontend.

### 1.2 Access Requirements
- **User Role:** Must have `is_instructor=True` or be assigned as an instructor to at least one course
- **Authentication:** Currently uses Django session-based authentication via `/portal/login/`
- **Future Enhancement:** Will implement JWT-based authentication similar to the student portal (see [Future Enhancements](#13-future-enhancements))

### 1.3 Portal URL
**Base URL:** `http://localhost:8000/portal/`  
**Login URL:** `http://localhost:8000/portal/login/`  
**Dashboard URL:** `http://localhost:8000/portal/instructor/`

### 1.4 Key Features
- ✅ **Premium UI/UX:** Matches student portal design with TopSkill branding
- ✅ **Complete CRUD Operations:** All course management without Django admin
- ✅ **Role-Based Access:** Instructors only see and manage their own courses
- ✅ **Comprehensive Course Building:** Sections, lectures, quizzes, assignments
- ✅ **Student Progress Tracking:** View student enrollments, submissions, and progress
- ✅ **Grading System:** Grade assignments and view quiz results
- ✅ **Attendance Management:** Mark attendance for physical/hybrid courses
- ✅ **Analytics Dashboard:** Track course performance and student engagement

---

## 2. Authentication & Login

### 2.1 Current Login System
**Location:** `/portal/login/`

**Process:**
1. Instructor visits `/portal/login/`
2. Enters username and password
3. System authenticates using Django's built-in authentication
4. Upon successful login:
   - User role is determined (`admin`, `instructor`, or `student`)
   - Instructors are redirected to `/portal/instructor/` (dashboard)
   - Admins are redirected to `/portal/admin-portal/`
   - Students are redirected to `/dashboard/my-courses` (frontend)
5. Session is created and maintained

**Backend View:** `portal.views.portal_login`

**Features:**
- Session-based authentication
- Automatic role-based redirection
- Error messages for invalid credentials
- Access control checks on all views

### 2.2 Logout
**Location:** `/portal/logout/`

**Process:**
1. Instructor clicks logout
2. Django session is terminated
3. User is redirected to login page
4. Success message is displayed

**Backend View:** `portal.views.portal_logout`

### 2.3 Future Login System (Planned)
**Note:** The instructor portal will be enhanced with a login system similar to the student portal, including:

- **JWT Token Authentication:** Access and refresh tokens
- **API-Based Login:** RESTful endpoints for authentication
- **Token Refresh Mechanism:** Automatic token renewal
- **Remember Me Functionality:** Extended session management
- **OAuth Integration:** Optional Google/SSO login (if implemented for students)
- **Frontend Integration:** Potential React/Next.js frontend for instructor portal

**Implementation Status:** ⏳ Planned for future development

---

## 3. Dashboard Overview

### 3.1 Dashboard Home
**Location:** `/portal/instructor/`

**Purpose:** Provides an overview of instructor's teaching activities and key metrics.

**Statistics Displayed:**
1. **Total Courses:** Number of courses created by the instructor
2. **Total Students:** Unique students enrolled across all courses
3. **Active Enrollments:** Currently active student enrollments
4. **New Enrollments (7 days):** Recent enrollments in the past week
5. **Pending Grading:** Assignment submissions awaiting instructor review
6. **Upcoming Sessions:** Batch sessions scheduled in the next 7 days
7. **Total Assignments:** All assignments across instructor's courses
8. **Total Quizzes:** All quizzes across instructor's courses

**Recent Courses Section:**
- Displays the 5 most recently created courses
- Shows course title, modality, price, and status
- Quick access to view course details

**Navigation Sidebar:**
- Dashboard (active on home)
- My Courses
- Students
- Assignments
- Quizzes
- Attendance
- Analytics

**Backend View:** `portal.views.instructor_dashboard`

---

## 4. Course Management

### 4.1 Course List
**Location:** `/portal/instructor/courses/`

**Features:**
- Lists all courses where `instructor=request.user`
- Displays course statistics:
  - Student count (total enrollments)
  - Total revenue (sum of paid payments)
- Shows course details:
  - Title
  - Modality (Online/Physical/Hybrid)
  - Price
  - Status (Active/Inactive)
  - Created date
- Actions:
  - **View:** Navigate to course detail page
  - **Create New Course:** Button to create a new course

**Backend View:** `portal.views.instructor_courses`

### 4.2 Course Detail
**Location:** `/portal/instructor/courses/<course_id>/`

**Comprehensive Course View:**
- **Course Information:**
  - Title, description, modality, price
  - Instructor details
  - Enrollment statistics (total students, active students)
  - Recent enrollments list

- **Course Content Sections:**
  1. **Curriculum:** Sections and lectures
  2. **Assignments:** All course assignments
  3. **Quizzes:** All course quizzes
  4. **Announcements:** Course announcements
  5. **Resources:** Course resources (files, links)
  6. **Q&A:** Frequently asked questions

**Actions Available:**
- Edit course
- Delete course
- Create section
- Create lecture
- Create assignment
- Create quiz
- Create announcement
- Create resource
- Create Q&A

**Backend View:** `portal.views.instructor_course_detail`

### 4.3 Create Course
**Location:** `/portal/instructor/courses/create/`

**Form Fields:**
- **Title:** Course title (required)
- **Description:** Full course description
- **Short Description:** Brief description for course cards (max 500 chars)
- **Modality:** Dropdown (Online/Physical/Hybrid)
- **Price:** Decimal field (default: 0)
- **Language:** Course language (default: English)
- **Level:** Dropdown (Beginner/Intermediate/Advanced/All Levels)
- **Is Active:** Checkbox to activate/deactivate course

**Process:**
1. Fill in course details
2. Submit form
3. Course is created with `instructor=request.user`
4. Slug is auto-generated from title
5. Redirect to course detail page

**Backend View:** `portal.views_crud.instructor_course_create`

### 4.4 Edit Course
**Location:** `/portal/instructor/courses/<course_id>/edit/`

**Features:**
- Pre-populated form with existing course data
- All fields from create form are editable
- Slug is regenerated if title changes
- Access restricted to course owner (`instructor=request.user`)

**Backend View:** `portal.views_crud.instructor_course_edit`

### 4.5 Delete Course
**Location:** `/portal/instructor/courses/<course_id>/delete/`

**Process:**
1. Confirmation page displayed
2. Instructor confirms deletion
3. Course and all related content are deleted
4. Redirect to courses list

**Warning:** This action is irreversible and will delete:
- Course sections and lectures
- Assignments and submissions
- Quizzes and attempts
- Enrollments
- All related data

**Backend View:** `portal.views_crud.instructor_course_delete`

---

## 5. Course Content Management

### 5.1 Course Sections

#### 5.1.1 Create Section
**Location:** `/portal/instructor/courses/<course_id>/sections/create/`

**Form Fields:**
- **Title:** Section title (required)
- **Order:** Display order (integer, default: 1)
- **Is Preview:** Checkbox to mark section as preview (accessible without enrollment)

**Process:**
1. Navigate from course detail page
2. Fill section details
3. Submit form
4. Section is created and linked to course
5. Redirect to course detail page

**Backend View:** `portal.views_content.instructor_section_create`

#### 5.1.2 Edit Section
**Location:** `/portal/instructor/courses/<course_id>/sections/<section_id>/edit/`

**Features:**
- Edit section title, order, and preview status
- Access restricted to course owner

**Backend View:** `portal.views_content.instructor_section_edit`

#### 5.1.3 Delete Section
**Location:** `/portal/instructor/courses/<course_id>/sections/<section_id>/delete/`

**Warning:** Deleting a section will also delete all lectures within it.

**Backend View:** `portal.views_content.instructor_section_delete`

### 5.2 Course Lectures

#### 5.2.1 Create Lecture
**Location:** `/portal/instructor/courses/<course_id>/sections/<section_id>/lectures/create/`

**Form Fields:**
- **Title:** Lecture title (required)
- **Description:** Lecture description
- **Order:** Display order within section
- **YouTube Video ID:** YouTube video identifier (e.g., `dQw4w9WgXcQ`)
- **Content URL:** Alternative video URL (if not YouTube)
- **Video Type:** Dropdown (youtube/external/upload)
- **Duration Minutes:** Lecture duration in minutes
- **Is Preview:** Checkbox to mark as preview lecture

**Process:**
1. Navigate from course detail page (select section)
2. Fill lecture details
3. For YouTube videos: Enter only the video ID (not full URL)
4. Submit form
5. Lecture is created and linked to section
6. Redirect to course detail page

**Backend View:** `portal.views_content.instructor_lecture_create`

#### 5.2.2 Edit Lecture
**Location:** `/portal/instructor/courses/<course_id>/sections/<section_id>/lectures/<lecture_id>/edit/`

**Features:**
- Edit all lecture fields
- Change video source (YouTube/external)
- Update duration and preview status

**Backend View:** `portal.views_content.instructor_lecture_edit`

#### 5.2.3 Delete Lecture
**Location:** `/portal/instructor/courses/<course_id>/sections/<section_id>/lectures/<lecture_id>/delete/`

**Backend View:** `portal.views_content.instructor_lecture_delete`

### 5.3 Announcements

#### 5.3.1 Create Announcement
**Location:** `/portal/instructor/courses/<course_id>/announcements/create/`

**Form Fields:**
- **Title:** Announcement title (required)
- **Content:** Announcement body text
- **Is Pinned:** Checkbox to pin announcement at top
- **Is Active:** Checkbox to activate/deactivate

**Purpose:** Communicate important information to enrolled students.

**Backend View:** `portal.views_content.instructor_announcement_create`

#### 5.3.2 Edit Announcement
**Location:** `/portal/instructor/courses/<course_id>/announcements/<announcement_id>/edit/`

**Backend View:** `portal.views_content.instructor_announcement_edit`

#### 5.3.3 Delete Announcement
**Location:** `/portal/instructor/courses/<course_id>/announcements/<announcement_id>/delete/`

**Backend View:** `portal.views_content.instructor_announcement_delete`

### 5.4 Resources

#### 5.4.1 Create Resource
**Location:** `/portal/instructor/courses/<course_id>/resources/create/`

**Form Fields:**
- **Title:** Resource title (required)
- **Description:** Resource description
- **Resource Type:** Dropdown (document/video/link/other)
- **External URL:** Link to external resource
- **File Upload:** Upload file (optional, if not using external URL)
- **Is Active:** Checkbox to activate/deactivate
- **Order:** Display order

**Purpose:** Provide supplementary materials (PDFs, documents, links) to students.

**Backend View:** `portal.views_content.instructor_resource_create`

#### 5.4.2 Edit Resource
**Location:** `/portal/instructor/courses/<course_id>/resources/<resource_id>/edit/`

**Features:**
- Update resource details
- Replace file upload
- Change external URL

**Backend View:** `portal.views_content.instructor_resource_edit`

#### 5.4.3 Delete Resource
**Location:** `/portal/instructor/courses/<course_id>/resources/<resource_id>/delete/`

**Backend View:** `portal.views_content.instructor_resource_delete`

### 5.5 Q&A (Frequently Asked Questions)

#### 5.5.1 Create Q&A
**Location:** `/portal/instructor/courses/<course_id>/qas/create/`

**Form Fields:**
- **Question:** FAQ question (required)
- **Answer:** FAQ answer
- **Order:** Display order
- **Is Active:** Checkbox to activate/deactivate

**Purpose:** Pre-answer common student questions.

**Backend View:** `portal.views_content.instructor_qa_create`

#### 5.5.2 Edit Q&A
**Location:** `/portal/instructor/courses/<course_id>/qas/<qa_id>/edit/`

**Backend View:** `portal.views_content.instructor_qa_edit`

#### 5.5.3 Delete Q&A
**Location:** `/portal/instructor/courses/<course_id>/qas/<qa_id>/delete/`

**Backend View:** `portal.views_content.instructor_qa_delete`

---

## 6. Student Management

### 6.1 Students List
**Location:** `/portal/instructor/students/`

**Features:**
- Lists all students enrolled in instructor's courses
- Shows unique students (distinct users)
- Displays enrollment count per student
- Shows enrollment details:
  - Student name and email
  - Course name
  - Enrollment status (active/pending/completed/cancelled)
  - Enrollment date
  - Progress percentage

**Actions:**
- **View Student Detail:** Click to see detailed student progress

**Backend View:** `portal.views_crud.instructor_students`

### 6.2 Student Detail
**Location:** `/portal/instructor/students/<enrollment_id>/`

**Comprehensive Student View:**
- **Enrollment Information:**
  - Student name, email, username
  - Course name
  - Enrollment status and date
  - Progress percentage

- **Lecture Progress:**
  - List of all lectures in the course
  - Completion status for each lecture
  - Watch position (if tracked)
  - Last accessed date

- **Assignment Submissions:**
  - All assignments for the course
  - Submission status (submitted/graded/pending)
  - Scores and feedback
  - Submission dates

- **Quiz Attempts:**
  - All quiz attempts
  - Scores and pass/fail status
  - Attempt dates
  - Number of attempts per quiz

**Purpose:** Track individual student progress and performance.

**Backend View:** `portal.views_crud.instructor_student_detail`

---

## 7. Assignment Management

### 7.1 Assignments List
**Location:** `/portal/instructor/assignments/`

**Features:**
- Lists all assignments across instructor's courses
- Shows assignment statistics:
  - Total submissions count
  - Pending submissions count (awaiting grading)
- Displays assignment details:
  - Title and description
  - Course name
  - Due date
  - Max score
  - Status (active/inactive)

**Actions:**
- **View:** Navigate to assignment detail
- **Create New Assignment:** Button to create assignment

**Backend View:** `portal.views_crud.instructor_assignments`

### 7.2 Create Assignment
**Location:** `/portal/instructor/assignments/create/`

**Form Fields:**
- **Course:** Dropdown of instructor's active courses (required)
- **Title:** Assignment title (required)
- **Description:** Assignment instructions
- **Due Date:** Date and time deadline (optional)
- **Max Score:** Maximum points (default: 100)
- **Is Active:** Checkbox to activate/deactivate
- **Order:** Display order within course
- **Allow Late Submission:** Checkbox to accept submissions after due date

**Process:**
1. Select course (or pre-selected from course detail page via `?course=<id>`)
2. Fill assignment details
3. Submit form
4. Assignment is created
5. Redirect to assignment detail page

**Backend View:** `portal.views_crud.instructor_assignment_create`

### 7.3 Assignment Detail
**Location:** `/portal/instructor/assignments/<assignment_id>/`

**Features:**
- **Assignment Information:**
  - Title, description, course
  - Due date and max score
  - Status and settings

- **Submissions List:**
  - All student submissions
  - Student name and email
  - Submission status (submitted/graded)
  - Score and feedback
  - Submission date
  - Actions:
    - **View Submission:** See submission details
    - **Grade Submission:** Assign score and feedback

**Backend View:** `portal.views_crud.instructor_assignment_detail`

### 7.4 Edit Assignment
**Location:** `/portal/instructor/assignments/<assignment_id>/edit/`

**Features:**
- Edit all assignment fields
- Update due date and settings
- Access restricted to assignment owner (via course instructor)

**Backend View:** `portal.views_crud.instructor_assignment_edit`

### 7.5 Delete Assignment
**Location:** `/portal/instructor/assignments/<assignment_id>/delete/`

**Warning:** Deleting an assignment will also delete all submissions.

**Backend View:** `portal.views_crud.instructor_assignment_delete`

### 7.6 Grade Submission
**Location:** `/portal/instructor/assignments/submissions/<submission_id>/grade/`

**Form Fields:**
- **Score:** Numeric score (0 to max_score)
- **Feedback:** Written feedback for student

**Process:**
1. View submission details
2. Enter score and feedback
3. Submit grading
4. Submission status changes to "graded"
5. Graded timestamp is recorded
6. Redirect to assignment detail page

**Backend View:** `portal.views_crud.instructor_submission_grade`

### 7.7 View All Submissions
**Location:** `/portal/instructor/assignments/<assignment_id>/submissions/`

**Features:**
- Comprehensive list of all submissions
- Filter by status (submitted/graded)
- Sort by date or score
- Quick access to grade individual submissions

**Backend View:** `portal.views_crud.instructor_assignment_submissions`

---

## 8. Quiz Management

### 8.1 Quizzes List
**Location:** `/portal/instructor/quizzes/`

**Features:**
- Lists all quizzes across instructor's courses
- Shows quiz statistics:
  - Question count
  - Attempt count (total student attempts)
- Displays quiz details:
  - Title and description
  - Course name
  - Passing score
  - Time limit (if set)
  - Max attempts allowed
  - Status (active/inactive)

**Actions:**
- **View:** Navigate to quiz detail
- **Create New Quiz:** Button to create quiz

**Backend View:** `portal.views_crud.instructor_quizzes`

### 8.2 Create Quiz
**Location:** `/portal/instructor/quizzes/create/`

**Form Fields:**
- **Course:** Dropdown of instructor's active courses (required)
- **Title:** Quiz title (required)
- **Description:** Quiz instructions
- **Passing Score:** Minimum score to pass (default: 70%)
- **Time Limit Minutes:** Optional time limit
- **Max Attempts:** Maximum attempts allowed (default: 3)
- **Is Active:** Checkbox to activate/deactivate
- **Order:** Display order within course
- **Allow Retake:** Checkbox to allow retakes after max attempts

**Process:**
1. Select course (or pre-selected from course detail page via `?course=<id>`)
2. Fill quiz details
3. Submit form
4. Quiz is created
5. Redirect to quiz detail page (where questions can be added)

**Backend View:** `portal.views_crud.instructor_quiz_create`

### 8.3 Quiz Detail
**Location:** `/portal/instructor/quizzes/<quiz_id>/`

**Comprehensive Quiz View:**
- **Quiz Information:**
  - Title, description, course
  - Settings (passing score, time limit, max attempts)
  - Statistics:
    - Total questions
    - Total attempts
    - Passed attempts
    - Average score

- **Questions List:**
  - All questions in the quiz
  - Question text and type
  - Points per question
  - Order
  - Actions:
    - **Edit Question:** Modify question and options
    - **Delete Question:** Remove question

- **Quiz Attempts:**
  - All student attempts
  - Student name
  - Score and pass/fail status
  - Attempt date

**Actions:**
- **Add Question:** Create new question
- **Edit Quiz:** Modify quiz settings
- **Delete Quiz:** Remove quiz

**Backend View:** `portal.views_crud.instructor_quiz_detail`

### 8.4 Create Question
**Location:** `/portal/instructor/quizzes/<quiz_id>/questions/create/`

**Question Types Supported:**

1. **Multiple Choice:**
   - Question text
   - Multiple options (typically 4)
   - Mark one or more as correct
   - Points per question

2. **True/False:**
   - Question text
   - Select correct answer (True/False)
   - Points per question

3. **Short Answer:**
   - Question text
   - Correct answer text
   - Points per question

**Form Fields:**
- **Question Text:** The question (required)
- **Question Type:** Dropdown (multiple_choice/true_false/short_answer)
- **Points:** Points awarded for correct answer (default: 1)
- **Order:** Display order within quiz

**For Multiple Choice:**
- **Option Text:** Multiple text fields for options
- **Is Correct:** Checkboxes to mark correct option(s)

**For True/False:**
- **Correct Answer:** Radio button (True/False)

**For Short Answer:**
- **Correct Answer Text:** Text field for expected answer

**Process:**
1. Select question type
2. Fill question details
3. Add options (if multiple choice)
4. Mark correct answer(s)
5. Submit form
6. Question is created with options
7. Redirect to quiz detail page

**Backend View:** `portal.views_content.instructor_question_create`

### 8.5 Edit Question
**Location:** `/portal/instructor/quizzes/<quiz_id>/questions/<question_id>/edit/`

**Features:**
- Edit question text, type, and points
- Update options (old options are deleted and recreated)
- Change correct answer

**Backend View:** `portal.views_content.instructor_question_edit`

### 8.6 Delete Question
**Location:** `/portal/instructor/quizzes/<quiz_id>/questions/<question_id>/delete/`

**Backend View:** `portal.views_content.instructor_question_delete`

### 8.7 Edit Quiz
**Location:** `/portal/instructor/quizzes/<quiz_id>/edit/`

**Features:**
- Edit all quiz settings
- Update passing score, time limit, max attempts
- Change active status

**Backend View:** `portal.views_crud.instructor_quiz_edit`

### 8.8 Delete Quiz
**Location:** `/portal/instructor/quizzes/<quiz_id>/delete/`

**Warning:** Deleting a quiz will also delete all questions and attempts.

**Backend View:** `portal.views_crud.instructor_quiz_delete`

---

## 9. Attendance Management

### 9.1 Attendance Overview
**Location:** `/portal/instructor/attendance/`

**Features:**
- Lists all batch sessions for instructor's courses
- Shows session details:
  - Batch name and course
  - Session date and time
  - Location (for physical courses)
- Displays attendance records:
  - Student name
  - Session date
  - Present/Absent status
  - Check-in timestamp

**Purpose:** Track attendance for physical and hybrid courses with batch sessions.

**Backend View:** `portal.views_crud.instructor_attendance`

### 9.2 Mark Attendance
**Location:** `/portal/instructor/attendance/mark/?session_id=<id>`

**Process:**
1. Select a batch session
2. View list of enrolled students
3. Mark students as present/absent
4. Submit attendance
5. Attendance records are created/updated

**Form Fields:**
- **Session:** Pre-selected batch session
- **Enrollments:** List of active enrollments for the course
- **Present Status:** Checkbox for each student

**Backend View:** `portal.views_crud.instructor_attendance_mark`

**Note:** Attendance is only applicable for courses with batches (physical/hybrid modalities).

---

## 10. Analytics & Reports

### 10.1 Analytics Dashboard
**Location:** `/portal/instructor/analytics/`

**Features:**
- **Course Statistics:**
  - Per-course enrollment count
  - Average progress percentage per course
- **Overall Statistics:**
  - Total enrollments across all courses
  - Average progress across all courses

**Purpose:** Track course performance and student engagement.

**Backend View:** `portal.views_crud.instructor_analytics`

**Future Enhancements:**
- Revenue analytics
- Student retention rates
- Quiz performance metrics
- Assignment completion rates
- Time-on-course analytics
- Export reports (CSV/PDF)

---

## 10.5 Review Management

### 10.5.1 Reviews List
**Location:** `/portal/instructor/reviews/`

**Features:**
- Lists all reviews for instructor's courses
- Shows review statistics:
  - Total reviews count
  - Average rating
- Displays review details:
  - Student name and email
  - Course name
  - Rating (1-5 stars)
  - Comment text
  - Review date
  - Verified purchase status

**Actions:**
- **View Review:** Navigate to review detail page

**Backend View:** `portal.views_crud.instructor_reviews`

### 10.5.2 Review Detail
**Location:** `/portal/instructor/reviews/<review_id>/`

**Comprehensive Review View:**
- **Review Information:**
  - Student details (name, email, username)
  - Course information
  - Rating display (star visualization)
  - Full comment text
  - Review dates (created, updated)
  - Verified purchase status

- **Enrollment Information:**
  - Enrollment date
  - Progress percentage
  - Enrollment status

**Actions:**
- **Delete Review:** Remove inappropriate reviews
- **View Course:** Navigate to course detail

**Backend View:** `portal.views_crud.instructor_review_detail`

### 10.5.3 Delete Review
**Location:** `/portal/instructor/reviews/<review_id>/delete/`

**Process:**
1. Confirmation page displayed
2. Instructor confirms deletion
3. Review is permanently deleted
4. Redirect to reviews list

**Warning:** This action is irreversible.

**Backend View:** `portal.views_crud.instructor_review_delete`

**Note:** Instructors can delete reviews for their courses to moderate inappropriate content. Future enhancement: Add ability to respond to reviews.

---

## 11. URL Reference

### 11.1 Base URLs
- **Portal Login:** `/portal/login/`
- **Portal Logout:** `/portal/logout/`
- **Instructor Dashboard:** `/portal/instructor/`

### 11.2 Course URLs
- **List Courses:** `/portal/instructor/courses/`
- **Create Course:** `/portal/instructor/courses/create/`
- **Course Detail:** `/portal/instructor/courses/<course_id>/`
- **Edit Course:** `/portal/instructor/courses/<course_id>/edit/`
- **Delete Course:** `/portal/instructor/courses/<course_id>/delete/`

### 11.3 Section URLs
- **Create Section:** `/portal/instructor/courses/<course_id>/sections/create/`
- **Edit Section:** `/portal/instructor/courses/<course_id>/sections/<section_id>/edit/`
- **Delete Section:** `/portal/instructor/courses/<course_id>/sections/<section_id>/delete/`

### 11.4 Lecture URLs
- **Create Lecture:** `/portal/instructor/courses/<course_id>/sections/<section_id>/lectures/create/`
- **Edit Lecture:** `/portal/instructor/courses/<course_id>/sections/<section_id>/lectures/<lecture_id>/edit/`
- **Delete Lecture:** `/portal/instructor/courses/<course_id>/sections/<section_id>/lectures/<lecture_id>/delete/`

### 11.5 Assignment URLs
- **List Assignments:** `/portal/instructor/assignments/`
- **Create Assignment:** `/portal/instructor/assignments/create/`
- **Assignment Detail:** `/portal/instructor/assignments/<assignment_id>/`
- **Edit Assignment:** `/portal/instructor/assignments/<assignment_id>/edit/`
- **Delete Assignment:** `/portal/instructor/assignments/<assignment_id>/delete/`
- **View Submissions:** `/portal/instructor/assignments/<assignment_id>/submissions/`
- **Grade Submission:** `/portal/instructor/assignments/submissions/<submission_id>/grade/`

### 11.6 Quiz URLs
- **List Quizzes:** `/portal/instructor/quizzes/`
- **Create Quiz:** `/portal/instructor/quizzes/create/`
- **Quiz Detail:** `/portal/instructor/quizzes/<quiz_id>/`
- **Edit Quiz:** `/portal/instructor/quizzes/<quiz_id>/edit/`
- **Delete Quiz:** `/portal/instructor/quizzes/<quiz_id>/delete/`
- **Create Question:** `/portal/instructor/quizzes/<quiz_id>/questions/create/`
- **Edit Question:** `/portal/instructor/quizzes/<quiz_id>/questions/<question_id>/edit/`
- **Delete Question:** `/portal/instructor/quizzes/<quiz_id>/questions/<question_id>/delete/`

### 11.7 Student URLs
- **List Students:** `/portal/instructor/students/`
- **Student Detail:** `/portal/instructor/students/<enrollment_id>/`

### 11.8 Attendance URLs
- **Attendance Overview:** `/portal/instructor/attendance/`
- **Mark Attendance:** `/portal/instructor/attendance/mark/?session_id=<id>`

### 11.9 Content URLs
- **Create Announcement:** `/portal/instructor/courses/<course_id>/announcements/create/`
- **Edit Announcement:** `/portal/instructor/courses/<course_id>/announcements/<announcement_id>/edit/`
- **Delete Announcement:** `/portal/instructor/courses/<course_id>/announcements/<announcement_id>/delete/`
- **Create Resource:** `/portal/instructor/courses/<course_id>/resources/create/`
- **Edit Resource:** `/portal/instructor/courses/<course_id>/resources/<resource_id>/edit/`
- **Delete Resource:** `/portal/instructor/courses/<course_id>/resources/<resource_id>/delete/`
- **Create Q&A:** `/portal/instructor/courses/<course_id>/qas/create/`
- **Edit Q&A:** `/portal/instructor/courses/<course_id>/qas/<qa_id>/edit/`
- **Delete Q&A:** `/portal/instructor/courses/<course_id>/qas/<qa_id>/delete/`

### 11.10 Analytics URLs
- **Analytics Dashboard:** `/portal/instructor/analytics/`

### 11.11 Review URLs
- **List Reviews:** `/portal/instructor/reviews/`
- **Review Detail:** `/portal/instructor/reviews/<review_id>/`
- **Delete Review:** `/portal/instructor/reviews/<review_id>/delete/`

---

## 12. Permissions & Access Control

### 12.1 Role-Based Access
**Instructor Role:**
- Must have `is_instructor=True` OR be assigned as `instructor` to at least one course
- Determined by `lms.permissions.is_instructor(user)`

**Access Rules:**
- Instructors can only view and manage courses where `course.instructor == request.user`
- All querysets are filtered by `course__instructor=request.user`
- Attempting to access another instructor's course results in 404 or redirect

### 12.2 Permission Checks
**Every View Includes:**
```python
if not is_instructor(request.user):
    messages.error(request, "Access denied. Instructor access required.")
    return redirect('portal:portal_login')
```

**Data Scoping:**
- Courses: `Course.objects.filter(instructor=request.user)`
- Assignments: `Assignment.objects.filter(course__instructor=request.user)`
- Quizzes: `Quiz.objects.filter(course__instructor=request.user)`
- Students: `Enrollment.objects.filter(course__instructor=request.user)`
- Submissions: `AssignmentSubmission.objects.filter(assignment__course__instructor=request.user)`

### 12.3 Security Features
- **Login Required:** All views use `@login_required` decorator
- **Role Verification:** Every view checks instructor status
- **Object-Level Permissions:** `get_object_or_404` with instructor filter
- **CSRF Protection:** All forms include CSRF tokens
- **Session Management:** Secure session-based authentication

---

## 13. Future Enhancements

### 13.1 Authentication System
**Planned:** JWT-based authentication similar to student portal
- RESTful API endpoints for login/logout
- Access and refresh tokens
- Token refresh mechanism
- Frontend integration (potential React/Next.js portal)

**Status:** ⏳ Planned

### 13.2 Additional Features
**Planned Enhancements:**
- **Review Management:** View and respond to course reviews
- **Certificate Generation:** Manually trigger certificate generation
- **Bulk Operations:** Bulk grade assignments, bulk mark attendance
- **Email Notifications:** Send announcements via email
- **File Management:** Enhanced file upload with preview
- **Course Templates:** Save and reuse course templates
- **Advanced Analytics:**
  - Revenue charts and graphs
  - Student engagement metrics
  - Course completion rates
  - Export reports (CSV/PDF/Excel)
- **Communication:**
  - Direct messaging with students
  - Forum moderation tools
  - Announcement scheduling
- **Course Preview:** Preview course as student sees it
- **Bulk Import:** Import questions/quizzes from CSV
- **Video Management:** Direct video upload (not just YouTube)
- **Live Sessions:** Integration with video conferencing (Zoom/Google Meet)

### 13.3 UI/UX Improvements
**Planned:**
- Enhanced mobile responsiveness
- Dark mode toggle
- Real-time notifications
- Drag-and-drop for course content ordering
- Rich text editor for descriptions
- Image upload for course thumbnails
- Progress indicators for bulk operations

### 13.4 Integration Enhancements
**Planned:**
- API endpoints for external integrations
- Webhook support for course events
- Third-party tool integrations (analytics, email marketing)
- Payment gateway integration for instructor payouts

---

## 📝 Notes

### Current Implementation Status
- ✅ **Complete:** All core CRUD operations
- ✅ **Complete:** Course content management (sections, lectures)
- ✅ **Complete:** Assignment and quiz management
- ✅ **Complete:** Student progress tracking
- ✅ **Complete:** Attendance management
- ✅ **Complete:** Premium UI matching student portal
- ✅ **Complete:** Review/rating management
- ⏳ **Planned:** JWT authentication system
- ⏳ **Planned:** Advanced analytics and reporting

### Important Reminders
1. **No Django Admin Access:** Instructors should not use Django admin. All operations are available in the portal.
2. **Data Scoping:** Instructors only see their own courses and related data.
3. **Security:** All views include permission checks and data filtering.
4. **Future Login:** The login system will be enhanced to match the student portal's JWT-based authentication.

---

## 🔗 Related Documentation
- **Student Portal:** See `STUDENT_FLOW_DOCUMENTATION.md`
- **Admin Portal:** See admin portal documentation (if available)
- **API Documentation:** See API documentation for backend endpoints
- **Setup Guide:** See `QUICK_START.md` for installation and setup

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Maintained By:** TopSkill LMS Development Team

