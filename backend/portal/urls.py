"""
Portal URLs for Instructor and Admin Premium Dashboards
"""
from django.urls import path
from . import views
from . import views_content

app_name = 'portal'

urlpatterns = [
    # Instructor Portal
    path('instructor/', views.instructor_dashboard, name='instructor_dashboard'),
    path('instructor/courses/', views.instructor_courses, name='instructor_courses'),
    path('instructor/courses/create/', views.instructor_course_create, name='instructor_course_create'),
    path('instructor/courses/<int:course_id>/', views.instructor_course_detail, name='instructor_course_detail'),
    path('instructor/courses/<int:course_id>/edit/', views.instructor_course_edit, name='instructor_course_edit'),
    path('instructor/courses/<int:course_id>/delete/', views.instructor_course_delete, name='instructor_course_delete'),
    
    # Instructor - Students
    path('instructor/students/', views.instructor_students, name='instructor_students'),
    path('instructor/students/<int:enrollment_id>/', views.instructor_student_detail, name='instructor_student_detail'),
    
    # Instructor - Assignments
    path('instructor/assignments/', views.instructor_assignments, name='instructor_assignments'),
    path('instructor/assignments/create/', views.instructor_assignment_create, name='instructor_assignment_create'),
    path('instructor/assignments/<int:assignment_id>/', views.instructor_assignment_detail, name='instructor_assignment_detail'),
    path('instructor/assignments/<int:assignment_id>/edit/', views.instructor_assignment_edit, name='instructor_assignment_edit'),
    path('instructor/assignments/<int:assignment_id>/delete/', views.instructor_assignment_delete, name='instructor_assignment_delete'),
    path('instructor/assignments/<int:assignment_id>/submissions/', views.instructor_assignment_submissions, name='instructor_assignment_submissions'),
    path('instructor/assignments/submissions/<int:submission_id>/grade/', views.instructor_submission_grade, name='instructor_submission_grade'),
    
    # Instructor - Quizzes
    path('instructor/quizzes/', views.instructor_quizzes, name='instructor_quizzes'),
    path('instructor/quizzes/create/', views.instructor_quiz_create, name='instructor_quiz_create'),
    path('instructor/quizzes/<int:quiz_id>/', views.instructor_quiz_detail, name='instructor_quiz_detail'),
    path('instructor/quizzes/<int:quiz_id>/edit/', views.instructor_quiz_edit, name='instructor_quiz_edit'),
    path('instructor/quizzes/<int:quiz_id>/delete/', views.instructor_quiz_delete, name='instructor_quiz_delete'),
    
    # Instructor - Quiz Questions
    path('instructor/quizzes/<int:quiz_id>/questions/create/', views_content.instructor_question_create, name='instructor_question_create'),
    path('instructor/quizzes/<int:quiz_id>/questions/<int:question_id>/edit/', views_content.instructor_question_edit, name='instructor_question_edit'),
    path('instructor/quizzes/<int:quiz_id>/questions/<int:question_id>/delete/', views_content.instructor_question_delete, name='instructor_question_delete'),
    
    # Instructor - Course Sections
    path('instructor/courses/<int:course_id>/sections/create/', views_content.instructor_section_create, name='instructor_section_create'),
    path('instructor/courses/<int:course_id>/sections/<int:section_id>/edit/', views_content.instructor_section_edit, name='instructor_section_edit'),
    path('instructor/courses/<int:course_id>/sections/<int:section_id>/delete/', views_content.instructor_section_delete, name='instructor_section_delete'),
    
    # Instructor - Course Lectures
    path('instructor/courses/<int:course_id>/sections/<int:section_id>/lectures/create/', views_content.instructor_lecture_create, name='instructor_lecture_create'),
    path('instructor/courses/<int:course_id>/sections/<int:section_id>/lectures/<int:lecture_id>/edit/', views_content.instructor_lecture_edit, name='instructor_lecture_edit'),
    path('instructor/courses/<int:course_id>/sections/<int:section_id>/lectures/<int:lecture_id>/delete/', views_content.instructor_lecture_delete, name='instructor_lecture_delete'),
    
    # Instructor - Announcements
    path('instructor/courses/<int:course_id>/announcements/create/', views_content.instructor_announcement_create, name='instructor_announcement_create'),
    path('instructor/courses/<int:course_id>/announcements/<int:announcement_id>/edit/', views_content.instructor_announcement_edit, name='instructor_announcement_edit'),
    path('instructor/courses/<int:course_id>/announcements/<int:announcement_id>/delete/', views_content.instructor_announcement_delete, name='instructor_announcement_delete'),
    
    # Instructor - Resources
    path('instructor/courses/<int:course_id>/resources/create/', views_content.instructor_resource_create, name='instructor_resource_create'),
    path('instructor/courses/<int:course_id>/resources/<int:resource_id>/edit/', views_content.instructor_resource_edit, name='instructor_resource_edit'),
    path('instructor/courses/<int:course_id>/resources/<int:resource_id>/delete/', views_content.instructor_resource_delete, name='instructor_resource_delete'),
    
    # Instructor - Q&A
    path('instructor/courses/<int:course_id>/qas/create/', views_content.instructor_qa_create, name='instructor_qa_create'),
    path('instructor/courses/<int:course_id>/qas/<int:qa_id>/edit/', views_content.instructor_qa_edit, name='instructor_qa_edit'),
    path('instructor/courses/<int:course_id>/qas/<int:qa_id>/delete/', views_content.instructor_qa_delete, name='instructor_qa_delete'),
    
    # Instructor - Attendance
    path('instructor/attendance/', views.instructor_attendance, name='instructor_attendance'),
    path('instructor/attendance/mark/', views.instructor_attendance_mark, name='instructor_attendance_mark'),
    
    # Instructor - Analytics
    path('instructor/analytics/', views.instructor_analytics, name='instructor_analytics'),
    
    # Instructor - Reviews
    path('instructor/reviews/', views.instructor_reviews, name='instructor_reviews'),
    path('instructor/reviews/<int:review_id>/', views.instructor_review_detail, name='instructor_review_detail'),
    path('instructor/reviews/<int:review_id>/delete/', views.instructor_review_delete, name='instructor_review_delete'),
    
    # Admin Portal
    path('admin-portal/', views.admin_dashboard, name='admin_dashboard'),
    path('admin-portal/models/', views.admin_models_list, name='admin_models'),
    
    # Admin - Full CRUD
    path('admin-portal/users/', views.admin_users, name='admin_users'),
    path('admin-portal/users/<int:user_id>/', views.admin_user_detail, name='admin_user_detail'),
    path('admin-portal/courses/', views.admin_courses, name='admin_courses'),
    path('admin-portal/courses/create/', views.admin_course_create, name='admin_course_create'),
    path('admin-portal/courses/<int:course_id>/', views.admin_course_detail, name='admin_course_detail'),
    path('admin-portal/courses/<int:course_id>/edit/', views.admin_course_edit, name='admin_course_edit'),
    path('admin-portal/courses/<int:course_id>/delete/', views.admin_course_delete, name='admin_course_delete'),
    path('admin-portal/instructors/', views.admin_instructors, name='admin_instructors'),
    path('admin-portal/instructors/<int:instructor_id>/', views.admin_instructor_detail, name='admin_instructor_detail'),
    path('admin-portal/enrollments/', views.admin_enrollments, name='admin_enrollments'),
    path('admin-portal/enrollments/<int:enrollment_id>/', views.admin_enrollment_detail, name='admin_enrollment_detail'),
    path('admin-portal/enrollments/<int:enrollment_id>/edit/', views.admin_enrollment_edit, name='admin_enrollment_edit'),
    path('admin-portal/payments/', views.admin_payments, name='admin_payments'),
    path('admin-portal/payments/<int:payment_id>/', views.admin_payment_detail, name='admin_payment_detail'),
    path('admin-portal/payments/<int:payment_id>/update/', views.admin_payment_update, name='admin_payment_update'),
    
    # Login/Logout
    path('login/', views.portal_login, name='portal_login'),
    path('logout/', views.portal_logout, name='portal_logout'),
]

