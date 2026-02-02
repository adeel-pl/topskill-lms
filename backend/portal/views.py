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
    Batch, BatchSession, Attendance, LectureProgress, QuizAttempt,
    CourseSection, Lecture, Announcement, Resource, QandA
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
    # Instructor - Reviews
    instructor_reviews, instructor_review_detail, instructor_review_delete,
    # Instructor - Courses CRUD
    instructor_course_create, instructor_course_edit, instructor_course_delete,
    # Admin - Full CRUD
    admin_users, admin_user_detail, admin_courses, admin_course_detail,
    admin_course_create, admin_course_edit, admin_course_delete,
    admin_instructors, admin_instructor_detail,
    admin_enrollments, admin_enrollment_detail, admin_enrollment_edit,
    admin_payments, admin_payment_detail, admin_payment_update,
)


def get_user_role(user):
    """Get user role: 'admin', 'instructor', or 'student'"""
    if is_admin(user):
        return 'admin'
    elif is_instructor(user):
        return 'instructor'
    # Check if user is a potential instructor (not staff, not superuser, no enrollments as student)
    # This allows new instructors who registered through portal to access instructor dashboard
    elif user.is_authenticated and not user.is_staff and not user.is_superuser:
        # If user has no student enrollments, they're likely an instructor
        has_enrollments = Enrollment.objects.filter(user=user).exists()
        if not has_enrollments:
            return 'instructor'  # New instructor without courses yet
    return 'student'


def auto_login_for_testing(request):
    """Helper to auto-login for testing - TEMPORARY"""
    if not request.user.is_authenticated:
        try:
            from django.contrib.auth import authenticate
            # Try instructor first
            user = authenticate(username='instructor', password='instructor123')
            if not user:
                # Try test_teacher
                user = authenticate(username='test_teacher', password='teacher123')
            if user:
                login(request, user)
                return user
        except Exception as e:
            print(f"Auto-login error: {e}")
    return request.user if request.user.is_authenticated else None


# @login_required  # TEMPORARILY DISABLED FOR TESTING
def instructor_dashboard(request):
    """Instructor Dashboard Home - TEMPORARILY NO LOGIN REQUIRED FOR TESTING"""
    user = auto_login_for_testing(request)
    if not user:
        messages.warning(request, "TESTING MODE: Accessing without login")
        # Create a dummy user context for template
        user = type('obj', (object,), {'username': 'test', 'is_authenticated': False})()
    
    # Get instructor's courses (or all if testing)
    if user and hasattr(user, 'instructed_courses'):
        courses = Course.objects.filter(instructor=user)
    else:
        courses = Course.objects.all()[:5]  # Show first 5 for testing
    
    # Statistics
    total_courses = courses.count() if hasattr(courses, 'count') else len(courses)
    if user and hasattr(user, 'id'):
        total_students = Enrollment.objects.filter(course__instructor=user).values('user').distinct().count()
        active_enrollments = Enrollment.objects.filter(
            course__instructor=user,
            status='active'
        ).count()
        recent_enrollments = Enrollment.objects.filter(
            course__instructor=user,
            created_at__gte=timezone.now() - timedelta(days=7)
        ).count()
        pending_assignments = AssignmentSubmission.objects.filter(
            assignment__course__instructor=user,
            status='submitted'
        ).count()
        total_assignments = Assignment.objects.filter(course__instructor=user).count()
        total_quizzes = Quiz.objects.filter(course__instructor=user).count()
        upcoming_sessions = BatchSession.objects.filter(
            batch__course__instructor=user,
            start_datetime__gte=timezone.now(),
            start_datetime__lte=timezone.now() + timedelta(days=7)
        ).count()
    else:
        # Testing mode - show all
        total_students = User.objects.filter(is_staff=False).count()
        active_enrollments = Enrollment.objects.filter(status='active').count()
        recent_enrollments = Enrollment.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).count()
        pending_assignments = AssignmentSubmission.objects.filter(status='submitted').count()
        total_assignments = Assignment.objects.count()
        total_quizzes = Quiz.objects.count()
        upcoming_sessions = BatchSession.objects.filter(
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
        'courses': courses[:5] if hasattr(courses, '__getitem__') else list(courses)[:5],
    }
    
    return render(request, 'portal/instructor/dashboard.html', context)


# @login_required  # TEMPORARILY DISABLED FOR TESTING
def instructor_courses(request):
    """Instructor Courses List - TEMPORARILY NO LOGIN REQUIRED FOR TESTING"""
    user = auto_login_for_testing(request)
    if user and hasattr(user, 'instructed_courses'):
        courses = Course.objects.filter(instructor=user).order_by('-created_at')
    else:
        courses = Course.objects.all().order_by('-created_at')
    return render(request, 'portal/instructor/courses.html', {'courses': courses})


# @login_required  # TEMPORARILY DISABLED FOR TESTING
def instructor_course_detail(request, course_id):
    """Instructor Course Detail - TEMPORARILY NO LOGIN REQUIRED FOR TESTING"""
    user = auto_login_for_testing(request)
    try:
        if user and hasattr(user, 'instructed_courses'):
            course = Course.objects.get(id=course_id, instructor=user)
        else:
            course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        messages.error(request, "Course not found.")
        return redirect('portal:instructor_courses')
    # Get all course sections with lectures (ordered)
    sections = CourseSection.objects.filter(course=course).prefetch_related('lectures').order_by('order')
    
    # Get course assignments
    assignments = Assignment.objects.filter(course=course).prefetch_related('submissions').order_by('-created_at')
    
    # Get course quizzes
    quizzes = Quiz.objects.filter(course=course).prefetch_related('questions').order_by('-created_at')
    
    # Get course announcements
    announcements = Announcement.objects.filter(course=course).order_by('-is_pinned', '-created_at')
    
    # Get course resources
    resources = Resource.objects.filter(course=course).order_by('-created_at')
    
    # Get course Q&As
    qandas = QandA.objects.filter(course=course).order_by('-created_at')
    
    # Get enrollments for this course
    enrollments = Enrollment.objects.filter(course=course).select_related('user').order_by('-created_at')
    
    # Statistics
    total_students = enrollments.values('user').distinct().count()
    active_students = enrollments.filter(status='active').values('user').distinct().count()
    pending_submissions = AssignmentSubmission.objects.filter(
        assignment__course=course,
        status='submitted'
    ).count()
    
    # Recent enrollments (last 10)
    recent_enrollments = enrollments[:10]
    
    context = {
        'course': course,
        'sections': sections,
        'assignments': assignments,
        'quizzes': quizzes,
        'announcements': announcements,
        'resources': resources,
        'qandas': qandas,
        'total_students': total_students,
        'active_students': active_students,
        'pending_submissions': pending_submissions,
        'recent_enrollments': recent_enrollments,
    }
    
    return render(request, 'portal/instructor/course_detail.html', context)


# @login_required  # TEMPORARILY DISABLED FOR TESTING
def admin_dashboard(request):
    """Admin Dashboard Home - TEMPORARILY NO LOGIN REQUIRED FOR TESTING"""
    user = auto_login_for_testing(request)
    
    # Overall statistics
    total_users = User.objects.count()
    total_courses = Course.objects.count()
    total_enrollments = Enrollment.objects.count()
    total_payments = Payment.objects.count()
    total_instructors = User.objects.filter(instructed_courses__isnull=False).distinct().count()
    
    # Recent activity (last 7 days)
    recent_enrollments_count = Enrollment.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    recent_courses_queryset = Course.objects.filter(
        created_at__gte=timezone.now() - timedelta(days=7)
    ).select_related('instructor').order_by('-created_at')[:10]
    
    # Pending payments
    pending_payments = Payment.objects.filter(status='pending').count()
    
    context = {
        'total_users': total_users,
        'total_courses': total_courses,
        'total_enrollments': total_enrollments,
        'total_payments': total_payments,
        'total_instructors': total_instructors,
        'recent_enrollments': recent_enrollments_count,
        'recent_courses': recent_courses_queryset,
        'pending_payments': pending_payments,
    }
    
    return render(request, 'portal/admin/dashboard.html', context)


@login_required
def admin_models_list(request):
    """Admin Models List - shows all Django models"""
    if not is_admin(request.user):
        messages.error(request, "Access denied. Admin access required.")
        return redirect('portal:portal_login')

    
    return render(request, 'portal/admin/models_list.html')


def portal_register(request):
    """Register new instructor - NEW FEATURE"""
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip()
        password_confirm = request.POST.get('password_confirm', '').strip()
        first_name = request.POST.get('first_name', '').strip()
        last_name = request.POST.get('last_name', '').strip()
        
        # Validation
        if not username or not email or not password:
            messages.error(request, "All fields are required.")
            return render(request, 'portal/register.html')
        
        if password != password_confirm:
            messages.error(request, "Passwords do not match.")
            return render(request, 'portal/register.html')
        
        if len(password) < 8:
            messages.error(request, "Password must be at least 8 characters.")
            return render(request, 'portal/register.html')
        
        # Check if user exists
        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists.")
            return render(request, 'portal/register.html')
        
        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already exists.")
            return render(request, 'portal/register.html')
        
        # Create user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_active=True,
                is_staff=False  # Instructor, not admin
            )
            
            # Auto-login
            from django.contrib.auth import authenticate
            auth_user = authenticate(username=username, password=password)
            if auth_user:
                login(request, auth_user)
                messages.success(request, f"Account created successfully! Welcome, {user.get_full_name() or user.username}!")
                return redirect('portal:instructor_dashboard')
            else:
                messages.success(request, "Account created! Please log in.")
                return redirect('portal:portal_login')
        except Exception as e:
            messages.error(request, f"Error creating account: {str(e)}")
            return render(request, 'portal/register.html')
    
    return render(request, 'portal/register.html')


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
        username_or_email = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()
        
        # Debug: Print what we received (force flush to ensure output)
        import sys
        sys.stdout.write('\n[PORTAL LOGIN DEBUG] ==========\n')
        sys.stdout.write(f'[PORTAL LOGIN DEBUG] Username/Email received: "{username_or_email}" (length: {len(username_or_email)})\n')
        sys.stdout.write(f'[PORTAL LOGIN DEBUG] Password received: length={len(password)}, repr={repr(password[:5])}...\n')
        sys.stdout.write(f'[PORTAL LOGIN DEBUG] POST keys: {list(request.POST.keys())}\n')
        sys.stdout.write(f'[PORTAL LOGIN DEBUG] All POST data: {dict(request.POST)}\n')
        sys.stdout.flush()
        
        # Try to authenticate - first try as username
        user = authenticate(request, username=username_or_email, password=password)
        
        # If that fails, try as email
        if user is None:
            try:
                user_obj = User.objects.get(Q(email=username_or_email) | Q(username=username_or_email))
                user = authenticate(request, username=user_obj.username, password=password)
                sys.stdout.write(f'[PORTAL LOGIN DEBUG] Email auth attempt: found user "{user_obj.username}", auth result: {user.username if user else "FAILED"}\n')
            except User.DoesNotExist:
                user = None
                sys.stdout.write(f'[PORTAL LOGIN DEBUG] No user found with email/username: "{username_or_email}"\n')
        
        sys.stdout.write(f'[PORTAL LOGIN DEBUG] Final auth result: {user.username if user else "FAILED"}\n')
        sys.stdout.flush()
        
        if user:
            login(request, user)
            role = get_user_role(user)
            
            # Debug output
            import sys
            sys.stdout.write(f'\n[PORTAL LOGIN] User: {user.username}, Role: {role}\n')
            sys.stdout.write(f'[PORTAL LOGIN] Redirecting to: ')
            sys.stdout.flush()
            
            if role == 'admin':
                sys.stdout.write('admin_dashboard\n')
                sys.stdout.flush()
                return redirect('portal:admin_dashboard')
            elif role == 'instructor':
                # Always redirect instructors to instructor portal
                sys.stdout.write('instructor_dashboard (/portal/instructor/)\n')
                sys.stdout.flush()
                return redirect('portal:instructor_dashboard')
            else:
                # Students go to student frontend
                sys.stdout.write('/dashboard/my-courses (student)\n')
                sys.stdout.flush()
                return redirect('/dashboard/my-courses')
        else:
            messages.error(request, "Invalid username or password.")
    
    return render(request, 'portal/login.html')


def portal_login_bypass(request):
    """
    DEVELOPMENT ONLY: Bypass login for testing
    Usage: /portal/login-bypass/?username=instructor
    """
    if not request.user.is_authenticated:
        username = request.GET.get('username', 'instructor')
        password = request.GET.get('password', 'instructor123')
        
        from django.contrib.auth import authenticate
        user = authenticate(request, username=username, password=password)
        
        if user:
            login(request, user)
            messages.success(request, f"Logged in as {user.username} (BYPASS MODE - DEV ONLY)")
            role = get_user_role(user)
            if role == 'admin':
                return redirect('portal:admin_dashboard')
            elif role == 'instructor':
                return redirect('portal:instructor_dashboard')
            else:
                return redirect('/dashboard/my-courses')
        else:
            messages.error(request, f"Failed to login as {username}")
            return redirect('portal:portal_login')
    else:
        # Already logged in, redirect to appropriate dashboard
        role = get_user_role(request.user)
        if role == 'admin':
            return redirect('portal:admin_dashboard')
        elif role == 'instructor':
            return redirect('portal:instructor_dashboard')
        else:
            return redirect('/dashboard/my-courses')


@login_required
def portal_logout(request):
    """Portal Logout"""
    logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('portal:portal_login')
