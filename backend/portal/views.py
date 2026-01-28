"""
Portal Views for Instructor and Admin Premium Dashboards
"""
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta

from lms.models import (
    Course, Enrollment, Payment, Quiz, Assignment, AssignmentSubmission,
    Batch, BatchSession, Attendance, LectureProgress, QuizAttempt
)
from lms.permissions import is_admin, is_instructor

# Import CRUD views
from .views_crud import (
    # Instructor - Students
    instructor_students, instructor_student_detail,
    # Instructor - Assignments
    instructor_assignments, instructor_assignment_create, instructor_assignment_detail,
    instructor_assignment_edit, instructor_assignment_delete,
    instructor_assignment_submissions, instructor_submission_grade,
    # Instructor - Quizzes
    instructor_quizzes, instructor_quiz_create, instructor_quiz_detail,
    instructor_quiz_edit, instructor_quiz_delete,
    # Instructor - Attendance
    instructor_attendance, instructor_attendance_mark,
    # Instructor - Analytics
    instructor_analytics,
    # Instructor - Courses CRUD
    instructor_course_create, instructor_course_edit, instructor_course_delete,
    # Admin - Full CRUD
    admin_users, admin_user_detail, admin_courses, admin_course_detail,
)


def get_user_role(user):
    """Get user role: 'admin', 'instructor', or 'student'"""
    if is_admin(user):
        return 'admin'
    elif is_instructor(user):
        return 'instructor'
    return 'student'


@login_required
def instructor_dashboard(request):
    """Instructor Dashboard Home"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    # Get instructor's courses
    courses = Course.objects.filter(instructor=request.user)
    
    # Statistics
    total_courses = courses.count()
    total_students = Enrollment.objects.filter(course__instructor=request.user).values('user').distinct().count()
    active_enrollments = Enrollment.objects.filter(
        course__instructor=request.user,
        status='active'
    ).count()
    
    # Recent enrollments (last 7 days)
    recent_enrollments = Enrollment.objects.filter(
        course__instructor=request.user,
        created_at__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Pending assignments to grade
    pending_assignments = AssignmentSubmission.objects.filter(
        assignment__course__instructor=request.user,
        status='submitted'
    ).count()
    
    # Total assignments
    total_assignments = Assignment.objects.filter(course__instructor=request.user).count()
    
    # Total quizzes
    total_quizzes = Quiz.objects.filter(course__instructor=request.user).count()
    
    # Upcoming sessions (next 7 days)
    upcoming_sessions = BatchSession.objects.filter(
        batch__course__instructor=request.user,
        start_datetime__gte=timezone.now(),
        start_datetime__lte=timezone.now() + timedelta(days=7)
    ).count()
    
    context = {
        'total_courses': total_courses,
        'total_students': total_students,
        'active_enrollments': active_enrollments,
        'recent_enrollments': recent_enrollments,
        'pending_assignments': pending_assignments,
        'upcoming_sessions': upcoming_sessions,
        'total_assignments': total_assignments,
        'total_quizzes': total_quizzes,
        'courses': courses[:5],  # Recent 5 courses
    }
    
    return render(request, 'portal/instructor/dashboard.html', context)


@login_required
def instructor_courses(request):
    """Instructor Courses List"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    courses = Course.objects.filter(instructor=request.user).annotate(
        student_count=Count('enrollments'),
        total_revenue=Sum('payments__amount', filter=Q(payments__status='paid'))
    ).order_by('-created_at')
    
    context = {
        'courses': courses,
    }
    
    return render(request, 'portal/instructor/courses.html', context)


@login_required
def instructor_course_detail(request, course_id):
    """Instructor Course Detail Page"""
    if not is_instructor(request.user):
        messages.error(request, "Access denied. Instructor access required.")
        return redirect('portal:portal_login')
    
    try:
        course = Course.objects.get(id=course_id, instructor=request.user)
    except Course.DoesNotExist:
        messages.error(request, "Course not found or access denied.")
        return redirect('portal:instructor_courses')
    
    # Get course statistics
    enrollments = Enrollment.objects.filter(course=course)
    total_students = enrollments.count()
    active_students = enrollments.filter(status='active').count()
    
    # Recent enrollments
    recent_enrollments = enrollments.order_by('-created_at')[:10]
    
    # Course Content (Sections & Lectures)
    from lms.models import CourseSection, Lecture
    sections = CourseSection.objects.filter(course=course).prefetch_related('lectures').order_by('order')
    
    # Assignments
    assignments = Assignment.objects.filter(course=course).order_by('order')
    pending_submissions = AssignmentSubmission.objects.filter(
        assignment__course=course,
        status='submitted'
    ).count()
    
    # Quizzes
    quizzes = Quiz.objects.filter(course=course).order_by('order')
    
    # Announcements
    from lms.models import Announcement
    announcements = Announcement.objects.filter(course=course).order_by('-is_pinned', '-created_at')
    
    # Resources
    from lms.models import Resource
    resources = Resource.objects.filter(course=course).order_by('order')
    
    # Q&A
    from lms.models import QandA
    qandas = QandA.objects.filter(course=course).order_by('order')
    
    context = {
        'course': course,
        'total_students': total_students,
        'active_students': active_students,
        'recent_enrollments': recent_enrollments,
        'sections': sections,
        'assignments': assignments,
        'pending_submissions': pending_submissions,
        'quizzes': quizzes,
        'announcements': announcements,
        'resources': resources,
        'qandas': qandas,
    }
    
    return render(request, 'portal/instructor/course_detail.html', context)


@login_required
def admin_dashboard(request):
    """Admin Premium Dashboard"""
    if not is_admin(request.user):
        messages.error(request, "Access denied. Admin access required.")
        return redirect('portal:portal_login')
    
    # Overall statistics
    total_courses = Course.objects.count()
    total_students = Enrollment.objects.values('user').distinct().count()
    total_enrollments = Enrollment.objects.count()
    total_revenue = Payment.objects.filter(status='paid').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Additional stats
    total_instructors = User.objects.filter(instructed_courses__isnull=False).distinct().count()
    active_courses = Course.objects.filter(is_active=True).count()
    total_assignments = Assignment.objects.count()
    total_quizzes = Quiz.objects.filter(course__isnull=False).count()
    
    # Recent activity
    recent_courses = Course.objects.order_by('-created_at')[:5]
    recent_enrollments = Enrollment.objects.select_related('user', 'course').order_by('-created_at')[:10]
    
    context = {
        'total_courses': total_courses,
        'total_students': total_students,
        'total_enrollments': total_enrollments,
        'total_revenue': total_revenue,
        'total_instructors': total_instructors,
        'active_courses': active_courses,
        'total_assignments': total_assignments,
        'total_quizzes': total_quizzes,
        'recent_courses': recent_courses,
        'recent_enrollments': recent_enrollments,
    }
    
    return render(request, 'portal/admin/dashboard.html', context)


@login_required
def admin_models_list(request):
    """Admin Models List - Quick access to all Django admin models"""
    if not is_admin(request.user):
        messages.error(request, "Access denied. Admin access required.")
        return redirect('portal:portal_login')
    
    return render(request, 'portal/admin/models_list.html')


def portal_login(request):
    """Portal Login - redirects based on role"""
    if request.user.is_authenticated:
        role = get_user_role(request.user)
        if role == 'admin':
            return redirect('portal:admin_dashboard')
        elif role == 'instructor':
            return redirect('portal:instructor_dashboard')
        else:
            # Student - redirect to frontend
            return redirect('/dashboard/my-courses')
    
    if request.method == 'POST':
        from django.contrib.auth import authenticate
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            role = get_user_role(user)
            if role == 'admin':
                return redirect('portal:admin_dashboard')
            elif role == 'instructor':
                return redirect('portal:instructor_dashboard')
            else:
                return redirect('/dashboard/my-courses')
        else:
            messages.error(request, "Invalid username or password.")
    
    return render(request, 'portal/login.html')


@login_required
def portal_logout(request):
    """Portal Logout"""
    logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('portal:portal_login')
