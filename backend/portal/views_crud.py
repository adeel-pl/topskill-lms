"""
CRUD Views for Instructor and Admin Portals
Full create, read, update, delete functionality
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from django.http import JsonResponse
from datetime import timedelta
from django.forms import modelform_factory
from django import forms

from django.contrib.auth.models import User
from lms.models import (
    Course, Enrollment, Payment, Quiz, Assignment, AssignmentSubmission,
    Batch, BatchSession, Attendance, LectureProgress, QuizAttempt,
    Question, QuestionOption, BatchSession
)
from lms.permissions import is_admin, is_instructor


# ============================================
# INSTRUCTOR PORTAL - STUDENTS
# ============================================

@login_required
def instructor_students(request):
    """Instructor Students List - All students enrolled in instructor's courses"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    # Get all enrollments for instructor's courses
    enrollments = Enrollment.objects.filter(
        course__instructor=request.user
    ).select_related('user', 'course').order_by('-created_at')
    
    # Get unique students
    students = User.objects.filter(
        enrollments__course__instructor=request.user
    ).distinct().annotate(
        enrollment_count=Count('enrollments', filter=Q(enrollments__course__instructor=request.user))
    )
    
    context = {
        'enrollments': enrollments,
        'students': students,
    }
    
    return render(request, 'portal/instructor/students.html', context)


@login_required
def instructor_student_detail(request, enrollment_id):
    """Instructor Student Detail - View student progress and submissions"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    enrollment = get_object_or_404(
        Enrollment,
        id=enrollment_id,
        course__instructor=request.user
    )
    
    # Get student's progress
    lecture_progress = LectureProgress.objects.filter(
        enrollment=enrollment
    ).select_related('lecture')
    
    # Get submissions
    assignment_submissions = AssignmentSubmission.objects.filter(
        enrollment=enrollment
    ).select_related('assignment')
    
    # Get quiz attempts
    quiz_attempts = QuizAttempt.objects.filter(
        enrollment=enrollment
    ).select_related('quiz')
    
    context = {
        'enrollment': enrollment,
        'lecture_progress': lecture_progress,
        'assignment_submissions': assignment_submissions,
        'quiz_attempts': quiz_attempts,
    }
    
    return render(request, 'portal/instructor/student_detail.html', context)


# ============================================
# INSTRUCTOR PORTAL - ASSIGNMENTS
# ============================================

@login_required
def instructor_assignments(request):
    """Instructor Assignments List"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    assignments = Assignment.objects.filter(
        course__instructor=request.user
    ).select_related('course').annotate(
        submission_count=Count('submissions'),
        pending_count=Count('submissions', filter=Q(submissions__status='submitted'))
    ).order_by('-created_at')
    
    context = {
        'assignments': assignments,
    }
    
    return render(request, 'portal/instructor/assignments.html', context)


@login_required
def instructor_assignment_create(request):
    """Create new assignment"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    courses = Course.objects.filter(instructor=request.user, is_active=True)

    # Pre-select course if provided in query string (coming from course detail page)
    selected_course_id = request.GET.get('course')
    
    if request.method == 'POST':
        course_id = request.POST.get('course')
        try:
            course = Course.objects.get(id=course_id, instructor=request.user)
        except Course.DoesNotExist:
            messages.error(request, "Invalid course selected.")
            return redirect('portal:instructor_assignment_create')
        
        assignment = Assignment.objects.create(
            course=course,
            title=request.POST.get('title'),
            description=request.POST.get('description', ''),
            due_date=request.POST.get('due_date') or None,
            max_score=request.POST.get('max_score', 100),
            is_active=request.POST.get('is_active') == 'on',
            order=request.POST.get('order', 1),
            allow_late_submission=request.POST.get('allow_late_submission') == 'on',
        )
        
        messages.success(request, f"Assignment '{assignment.title}' created successfully!")
        return redirect('portal:instructor_assignment_detail', assignment_id=assignment.id)
    
    context = {
        'courses': courses,
        'selected_course_id': selected_course_id,
    }
    
    return render(request, 'portal/instructor/assignment_form.html', {'form_type': 'create', **context})


@login_required
def instructor_assignment_detail(request, assignment_id):
    """Assignment detail with submissions"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    assignment = get_object_or_404(
        Assignment,
        id=assignment_id,
        course__instructor=request.user
    )
    
    submissions = AssignmentSubmission.objects.filter(
        assignment=assignment
    ).select_related('enrollment__user').order_by('-submitted_at')
    
    context = {
        'assignment': assignment,
        'submissions': submissions,
    }
    
    return render(request, 'portal/instructor/assignment_detail.html', context)


@login_required
def instructor_assignment_edit(request, assignment_id):
    """Edit assignment"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    assignment = get_object_or_404(
        Assignment,
        id=assignment_id,
        course__instructor=request.user
    )
    
    if request.method == 'POST':
        assignment.title = request.POST.get('title')
        assignment.description = request.POST.get('description', '')
        assignment.due_date = request.POST.get('due_date') or None
        assignment.max_score = request.POST.get('max_score', 100)
        assignment.is_active = request.POST.get('is_active') == 'on'
        assignment.order = request.POST.get('order', 1)
        assignment.allow_late_submission = request.POST.get('allow_late_submission') == 'on'
        assignment.save()
        
        messages.success(request, f"Assignment '{assignment.title}' updated successfully!")
        return redirect('portal:instructor_assignment_detail', assignment_id=assignment.id)
    
    context = {
        'assignment': assignment,
        'form_type': 'edit',
    }
    
    return render(request, 'portal/instructor/assignment_form.html', context)


@login_required
def instructor_assignment_delete(request, assignment_id):
    """Delete assignment"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    assignment = get_object_or_404(
        Assignment,
        id=assignment_id,
        course__instructor=request.user
    )
    
    if request.method == 'POST':
        title = assignment.title
        assignment.delete()
        messages.success(request, f"Assignment '{title}' deleted successfully!")
        return redirect('portal:instructor_assignments')
    
    context = {
        'assignment': assignment,
    }
    
    return render(request, 'portal/instructor/assignment_delete.html', context)


@login_required
def instructor_assignment_submissions(request, assignment_id):
    """View all submissions for an assignment"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    assignment = get_object_or_404(
        Assignment,
        id=assignment_id,
        course__instructor=request.user
    )
    
    submissions = AssignmentSubmission.objects.filter(
        assignment=assignment
    ).select_related('enrollment__user').order_by('-submitted_at')
    
    context = {
        'assignment': assignment,
        'submissions': submissions,
    }
    
    return render(request, 'portal/instructor/assignment_submissions.html', context)


@login_required
def instructor_submission_grade(request, submission_id):
    """Grade an assignment submission"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    submission = get_object_or_404(
        AssignmentSubmission,
        id=submission_id,
        assignment__course__instructor=request.user
    )
    
    if request.method == 'POST':
        score = request.POST.get('score')
        feedback = request.POST.get('feedback', '')
        
        if score:
            submission.score = float(score)
            submission.feedback = feedback
            submission.status = 'graded'
            submission.graded_at = timezone.now()
            submission.save()
            
            messages.success(request, "Submission graded successfully!")
            return redirect('portal:instructor_assignment_detail', assignment_id=submission.assignment.id)
        else:
            messages.error(request, "Please provide a score.")
    
    context = {
        'submission': submission,
    }
    
    return render(request, 'portal/instructor/submission_grade.html', context)


# ============================================
# INSTRUCTOR PORTAL - QUIZZES
# ============================================

@login_required
def instructor_quizzes(request):
    """Instructor Quizzes List"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    quizzes = Quiz.objects.filter(
        course__instructor=request.user
    ).select_related('course').annotate(
        question_count=Count('questions'),
        attempt_count=Count('attempts')
    ).order_by('-created_at')
    
    context = {
        'quizzes': quizzes,
    }
    
    return render(request, 'portal/instructor/quizzes.html', context)


@login_required
def instructor_quiz_create(request):
    """Create new quiz"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    courses = Course.objects.filter(instructor=request.user, is_active=True)
    
    # Pre-select course if provided in query string
    selected_course_id = request.GET.get('course')
    
    if request.method == 'POST':
        course_id = request.POST.get('course')
        try:
            course = Course.objects.get(id=course_id, instructor=request.user)
        except Course.DoesNotExist:
            messages.error(request, "Invalid course selected.")
            return redirect('portal:instructor_quiz_create')
        
        quiz = Quiz.objects.create(
            course=course,
            title=request.POST.get('title'),
            description=request.POST.get('description', ''),
            passing_score=request.POST.get('passing_score', 70),
            time_limit_minutes=request.POST.get('time_limit_minutes') or None,
            max_attempts=request.POST.get('max_attempts', 3),
            is_active=request.POST.get('is_active') == 'on',
            order=request.POST.get('order', 1),
            allow_retake=request.POST.get('allow_retake') == 'on',
        )
        
        messages.success(request, f"Quiz '{quiz.title}' created successfully!")
        return redirect('portal:instructor_quiz_detail', quiz_id=quiz.id)
    
    context = {
        'courses': courses,
        'selected_course_id': selected_course_id,
    }
    
    return render(request, 'portal/instructor/quiz_form.html', {'form_type': 'create', **context})


@login_required
def instructor_quiz_detail(request, quiz_id):
    """Quiz detail with questions"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    quiz = get_object_or_404(
        Quiz,
        id=quiz_id,
        course__instructor=request.user
    )
    
    questions = Question.objects.filter(quiz=quiz).prefetch_related('options').order_by('order')
    attempts = QuizAttempt.objects.filter(quiz=quiz).select_related('enrollment__user').order_by('-started_at')
    
    # Calculate quiz statistics
    total_questions = questions.count()
    total_attempts = attempts.count()
    passed_attempts = attempts.filter(passed=True).count()
    avg_score = attempts.aggregate(avg=Avg('score'))['avg'] or 0
    
    context = {
        'quiz': quiz,
        'questions': questions,
        'attempts': attempts,
        'total_questions': total_questions,
        'total_attempts': total_attempts,
        'passed_attempts': passed_attempts,
        'avg_score': round(avg_score, 1),
    }
    
    return render(request, 'portal/instructor/quiz_detail.html', context)


@login_required
def instructor_quiz_edit(request, quiz_id):
    """Edit quiz"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    quiz = get_object_or_404(
        Quiz,
        id=quiz_id,
        course__instructor=request.user
    )
    
    if request.method == 'POST':
        quiz.title = request.POST.get('title')
        quiz.description = request.POST.get('description', '')
        quiz.passing_score = request.POST.get('passing_score', 70)
        quiz.time_limit_minutes = request.POST.get('time_limit_minutes') or None
        quiz.max_attempts = request.POST.get('max_attempts', 3)
        quiz.is_active = request.POST.get('is_active') == 'on'
        quiz.order = request.POST.get('order', 1)
        quiz.allow_retake = request.POST.get('allow_retake') == 'on'
        quiz.save()
        
        messages.success(request, f"Quiz '{quiz.title}' updated successfully!")
        return redirect('portal:instructor_quiz_detail', quiz_id=quiz.id)
    
    context = {
        'quiz': quiz,
        'form_type': 'edit',
    }
    
    return render(request, 'portal/instructor/quiz_form.html', context)


@login_required
def instructor_quiz_delete(request, quiz_id):
    """Delete quiz"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    quiz = get_object_or_404(
        Quiz,
        id=quiz_id,
        course__instructor=request.user
    )
    
    if request.method == 'POST':
        title = quiz.title
        quiz.delete()
        messages.success(request, f"Quiz '{title}' deleted successfully!")
        return redirect('portal:instructor_quizzes')
    
    context = {
        'quiz': quiz,
    }
    
    return render(request, 'portal/instructor/quiz_delete.html', context)


# ============================================
# INSTRUCTOR PORTAL - ATTENDANCE
# ============================================

@login_required
def instructor_attendance(request):
    """Instructor Attendance Management"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    # Get all sessions for instructor's batches
    sessions = BatchSession.objects.filter(
        batch__course__instructor=request.user
    ).select_related('batch', 'batch__course').order_by('-start_datetime')
    
    # Get attendance records
    attendance_records = Attendance.objects.filter(
        session__batch__course__instructor=request.user
    ).select_related('enrollment__user', 'session').order_by('-checked_in_at')
    
    context = {
        'sessions': sessions,
        'attendance_records': attendance_records,
    }
    
    return render(request, 'portal/instructor/attendance.html', context)


@login_required
def instructor_attendance_mark(request):
    """Mark attendance for a session"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    if request.method == 'POST':
        session_id = request.POST.get('session_id')
        enrollment_ids = request.POST.getlist('enrollments')
        present_status = request.POST.get('present') == 'true'
        
        try:
            session = BatchSession.objects.get(
                id=session_id,
                batch__course__instructor=request.user
            )
        except BatchSession.DoesNotExist:
            messages.error(request, "Invalid session.")
            return redirect('portal:instructor_attendance')
        
        for enrollment_id in enrollment_ids:
            try:
                enrollment = Enrollment.objects.get(
                    id=enrollment_id,
                    course=session.batch.course
                )
                Attendance.objects.update_or_create(
                    enrollment=enrollment,
                    session=session,
                    defaults={
                        'present': present_status,
                        'checked_in_at': timezone.now() if present_status else None,
                    }
                )
            except Enrollment.DoesNotExist:
                continue
        
        messages.success(request, "Attendance marked successfully!")
        return redirect('portal:instructor_attendance')
    
    # GET request - show form
    session_id = request.GET.get('session_id')
    if session_id:
        try:
            session = BatchSession.objects.get(
                id=session_id,
                batch__course__instructor=request.user
            )
            enrollments = Enrollment.objects.filter(
                course=session.batch.course,
                status='active'
            ).select_related('user')
            
            context = {
                'session': session,
                'enrollments': enrollments,
            }
            return render(request, 'portal/instructor/attendance_mark.html', context)
        except BatchSession.DoesNotExist:
            messages.error(request, "Invalid session.")
    
    return redirect('portal:instructor_attendance')


# ============================================
# INSTRUCTOR PORTAL - ANALYTICS
# ============================================

@login_required
def instructor_analytics(request):
    """Instructor Analytics Dashboard"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    courses = Course.objects.filter(instructor=request.user)
    
    # Course statistics
    course_stats = []
    for course in courses:
        enrollments = Enrollment.objects.filter(course=course)
        avg_progress = enrollments.aggregate(avg=Avg('progress_percent'))['avg'] or 0
        course_stats.append({
            'course': course,
            'enrollments': enrollments.count(),
            'avg_progress': round(avg_progress, 1),
        })
    
    # Overall stats
    total_enrollments = Enrollment.objects.filter(course__instructor=request.user).count()
    avg_progress_all = Enrollment.objects.filter(
        course__instructor=request.user
    ).aggregate(avg=Avg('progress_percent'))['avg'] or 0
    
    context = {
        'course_stats': course_stats,
        'total_enrollments': total_enrollments,
        'avg_progress_all': round(avg_progress_all, 1),
    }
    
    return render(request, 'portal/instructor/analytics.html', context)


# ============================================
# ADMIN PORTAL - FULL CRUD
# ============================================

@login_required
def admin_users(request):
    """Admin Users List"""
    if not is_admin(request.user):
        messages.error(request, "Access denied. Admin access required.")
        return redirect('portal:portal_login')
    
    users = User.objects.all().annotate(
        enrollment_count=Count('enrollments'),
        course_count=Count('instructed_courses')
    ).order_by('-date_joined')
    
    context = {
        'users': users,
    }
    
    return render(request, 'portal/admin/users.html', context)


@login_required
def admin_user_detail(request, user_id):
    """Admin User Detail"""
    if not is_admin(request.user):
        messages.error(request, "Access denied. Admin access required.")
        return redirect('portal:portal_login')
    
    user = get_object_or_404(User, id=user_id)
    
    enrollments = Enrollment.objects.filter(user=user).select_related('course')
    instructed_courses = Course.objects.filter(instructor=user)
    
    context = {
        'user': user,
        'enrollments': enrollments,
        'instructed_courses': instructed_courses,
    }
    
    return render(request, 'portal/admin/user_detail.html', context)


@login_required
def admin_courses(request):
    """Admin Courses List"""
    if not is_admin(request.user):
        messages.error(request, "Access denied. Admin access required.")
        return redirect('portal:portal_login')
    
    courses = Course.objects.all().select_related('instructor').annotate(
        enrollment_count=Count('enrollments'),
        student_count=Count('enrollments', distinct=True)
    ).order_by('-created_at')
    
    context = {
        'courses': courses,
    }
    
    return render(request, 'portal/admin/courses.html', context)


@login_required
def admin_course_detail(request, course_id):
    """Admin Course Detail"""
    if not is_admin(request.user):
        messages.error(request, "Access denied. Admin access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id)
    
    enrollments = Enrollment.objects.filter(course=course).select_related('user')
    assignments = Assignment.objects.filter(course=course)
    quizzes = Quiz.objects.filter(course=course)
    
    context = {
        'course': course,
        'enrollments': enrollments,
        'assignments': assignments,
        'quizzes': quizzes,
    }
    
    return render(request, 'portal/admin/course_detail.html', context)


# ============================================
# INSTRUCTOR PORTAL - COURSES CRUD
# ============================================

@login_required
def instructor_course_create(request):
    """Create new course - Instructor Portal"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    if request.method == 'POST':
        from django.utils.text import slugify
        
        course = Course.objects.create(
            title=request.POST.get('title'),
            slug=slugify(request.POST.get('title')),
            description=request.POST.get('description', ''),
            short_description=request.POST.get('short_description', ''),
            modality=request.POST.get('modality', 'online'),
            price=request.POST.get('price', 0),
            instructor=request.user,
            is_active=request.POST.get('is_active') == 'on',
            language=request.POST.get('language', 'English'),
            level=request.POST.get('level', 'all'),
        )
        
        messages.success(request, f"Course '{course.title}' created successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    return render(request, 'portal/instructor/course_form.html', {'form_type': 'create'})


@login_required
def instructor_course_edit(request, course_id):
    """Edit course - Instructor Portal"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    
    if request.method == 'POST':
        from django.utils.text import slugify
        
        course.title = request.POST.get('title')
        course.slug = slugify(request.POST.get('title'))
        course.description = request.POST.get('description', '')
        course.short_description = request.POST.get('short_description', '')
        course.modality = request.POST.get('modality', 'online')
        course.price = request.POST.get('price', 0)
        course.is_active = request.POST.get('is_active') == 'on'
        course.language = request.POST.get('language', 'English')
        course.level = request.POST.get('level', 'all')
        course.save()
        
        messages.success(request, f"Course '{course.title}' updated successfully!")
        return redirect('portal:instructor_course_detail', course_id=course.id)
    
    context = {
        'course': course,
        'form_type': 'edit',
    }
    
    return render(request, 'portal/instructor/course_form.html', context)


@login_required
def instructor_course_delete(request, course_id):
    """Delete course - Instructor Portal"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    
    if request.method == 'POST':
        title = course.title
        course.delete()
        messages.success(request, f"Course '{title}' deleted successfully!")
        return redirect('portal:instructor_courses')
    
    context = {
        'course': course,
    }
    
    return render(request, 'portal/instructor/course_delete.html', context)

