"""
Admin API Views for Premium Dashboard
Provides JSON API endpoints for admin dashboard analytics and data
Supports role-based access: Admin (full access) and Instructor (own data only)
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum, Avg, Q, F
from django.utils import timezone
from django.utils.text import slugify
from datetime import timedelta, datetime
from .models import (
    Course, Enrollment, Payment, User, Quiz, Assignment, Question, QuestionOption,
    Review, Batch, BatchSession, SessionRegistration, Attendance,
    Lecture, CourseSection, QuizAttempt, AssignmentSubmission, Category, Tag
)
from .permissions import is_admin, is_instructor, is_admin_or_instructor
from .serializers import (
    CourseDetailSerializer, QuizSerializer, QuestionSerializer, UserSerializer
)


def get_user_role(user):
    """Get user role: 'admin', 'instructor', or 'student'"""
    if is_admin(user):
        return 'admin'
    elif is_instructor(user):
        return 'instructor'
    return 'student'


def get_course_queryset(user):
    """Get courses queryset filtered by user role"""
    if is_admin(user):
        return Course.objects.all()
    elif is_instructor(user):
        return Course.objects.filter(instructor=user)
    return Course.objects.none()


def get_enrollment_queryset(user):
    """Get enrollments queryset filtered by user role"""
    if is_admin(user):
        return Enrollment.objects.all()
    elif is_instructor(user):
        # Get enrollments for courses where user is instructor
        return Enrollment.objects.filter(course__instructor=user)
    return Enrollment.objects.none()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_analytics(request):
    """Get comprehensive analytics for admin/instructor dashboard"""
    if not is_admin_or_instructor(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    user_role = get_user_role(request.user)
    is_admin_user = is_admin(request.user)
    
    # Get date filter parameters
    date_range = request.GET.get('date_range', 'all')
    start_date = request.GET.get('start_date', '')
    end_date = request.GET.get('end_date', '')
    
    # Calculate date filter
    date_filter = Q()
    date_label = "All Time"
    
    if date_range == '1day':
        start = timezone.now() - timedelta(days=1)
        date_filter = Q(created_at__gte=start)
        date_label = "Last 24 Hours"
    elif date_range == '1week':
        start = timezone.now() - timedelta(days=7)
        date_filter = Q(created_at__gte=start)
        date_label = "Last 7 Days"
    elif date_range == '1month':
        start = timezone.now() - timedelta(days=30)
        date_filter = Q(created_at__gte=start)
        date_label = "Last 30 Days"
    elif date_range == 'custom' and start_date and end_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            end = datetime.strptime(end_date, '%Y-%m-%d')
            end = end.replace(hour=23, minute=59, second=59)
            date_filter = Q(created_at__gte=start, created_at__lte=end)
            date_label = f"{start_date} to {end_date}"
        except ValueError:
            date_filter = Q()
            date_label = "All Time"
    
    # Get course queryset based on role
    course_qs = get_course_queryset(request.user)
    enrollment_qs = get_enrollment_queryset(request.user)
    
    # Overall Statistics
    total_courses = course_qs.filter(is_active=True).count()
    
    if date_filter:
        enrollment_qs = enrollment_qs.filter(date_filter)
    
    total_enrollments = enrollment_qs.count()
    active_enrollments = enrollment_qs.filter(status='active').count()
    completed_enrollments = enrollment_qs.filter(status='completed').count()
    
    # Students: For admin, all students; for instructor, only students in their courses
    if is_admin_user:
        total_students = User.objects.filter(enrollments__in=enrollment_qs).distinct().count() if date_filter else User.objects.filter(enrollments__isnull=False).distinct().count()
    else:
        total_students = User.objects.filter(enrollments__in=enrollment_qs).distinct().count()
    
    # Revenue: For instructor, only revenue from their courses
    if is_admin_user:
        payment_qs = Payment.objects.filter(status='paid')
    else:
        payment_qs = Payment.objects.filter(status='paid', course__instructor=request.user)
    
    if date_filter:
        payment_qs = payment_qs.filter(date_filter)
    total_revenue = payment_qs.aggregate(total=Sum('amount'))['total'] or 0
    
    # Enrollment trends
    enrollment_trends = []
    if date_range == '1day':
        for i in range(24):
            hour = timezone.now() - timedelta(hours=23-i)
            count = enrollment_qs.filter(
                created_at__gte=hour.replace(minute=0, second=0, microsecond=0),
                created_at__lt=(hour + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
            ).count()
            enrollment_trends.append({
                'date': hour.strftime('%Y-%m-%d %H:00'),
                'count': count
            })
    elif date_range in ['1week', '1month'] or (date_range == 'custom' and start_date and end_date):
        if date_range == '1week':
            days = 7
            start = timezone.now() - timedelta(days=6)
        elif date_range == '1month':
            days = 30
            start = timezone.now() - timedelta(days=29)
        else:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d')
                end = datetime.strptime(end_date, '%Y-%m-%d')
                days = (end - start).days + 1
            except ValueError:
                days = 7
                start = timezone.now() - timedelta(days=6)
        
        for i in range(days):
            date = start + timedelta(days=i)
            count = enrollment_qs.filter(created_at__date=date.date()).count()
            enrollment_trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
    else:
        for i in range(7):
            date = timezone.now() - timedelta(days=6-i)
            count = enrollment_qs.filter(created_at__date=date.date()).count()
            enrollment_trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
    
    # Revenue trends
    revenue_trends = []
    if date_range == '1day':
        for i in range(24):
            hour = timezone.now() - timedelta(hours=23-i)
            revenue = payment_qs.filter(
                created_at__gte=hour.replace(minute=0, second=0, microsecond=0),
                created_at__lt=(hour + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
            ).aggregate(total=Sum('amount'))['total'] or 0
            revenue_trends.append({
                'date': hour.strftime('%Y-%m-%d %H:00'),
                'revenue': float(revenue)
            })
    else:
        days = 7 if date_range == 'all' else (30 if date_range == '1month' else 7)
        start = timezone.now() - timedelta(days=days-1)
        for i in range(days):
            date = start + timedelta(days=i)
            revenue = payment_qs.filter(
                created_at__date=date.date()
            ).aggregate(total=Sum('amount'))['total'] or 0
            revenue_trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'revenue': float(revenue)
            })
    
    # Top courses (filtered by role)
    top_courses = course_qs.filter(is_active=True).annotate(
        enrollment_count=Count('enrollments', filter=date_filter if date_filter else Q(), distinct=True),
        revenue=Sum('payments__amount', filter=Q(payments__status='paid') & (date_filter if date_filter else Q()))
    ).order_by('-enrollment_count')[:10]
    
    top_courses_data = [{
        'id': course.id,
        'title': course.title,
        'enrollment_count': course.enrollment_count or 0,
        'revenue': float(course.revenue or 0),
        'rating': float(course.rating or 0),
        'num_reviews': course.num_reviews or 0,
    } for course in top_courses]
    
    # Course statistics by modality
    course_by_modality = course_qs.filter(is_active=True).values('modality').annotate(
        count=Count('id')
    )
    
    # Payment statistics
    if is_admin_user:
        payment_stats = {
            'total': Payment.objects.count(),
            'paid': Payment.objects.filter(status='paid').count(),
            'pending': Payment.objects.filter(status='initiated').count(),
            'failed': Payment.objects.filter(status='failed').count(),
        }
    else:
        instructor_payments = Payment.objects.filter(course__instructor=request.user)
        payment_stats = {
            'total': instructor_payments.count(),
            'paid': instructor_payments.filter(status='paid').count(),
            'pending': instructor_payments.filter(status='initiated').count(),
            'failed': instructor_payments.filter(status='failed').count(),
        }
    
    return Response({
        'role': user_role,
        'overview': {
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'active_enrollments': active_enrollments,
            'completed_enrollments': completed_enrollments,
            'total_students': total_students,
            'total_revenue': float(total_revenue),
            'date_label': date_label,
        },
        'trends': {
            'enrollments': enrollment_trends,
            'revenue': revenue_trends,
        },
        'top_courses': top_courses_data,
        'course_by_modality': list(course_by_modality),
        'payment_stats': payment_stats,
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_courses_list(request):
    """Get all courses or create new course for admin/instructor management"""
    if not is_admin_or_instructor(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'POST':
        # Create new course
        if not is_admin(request.user) and not is_instructor(request.user):
            return Response({'error': 'Only admins and instructors can create courses'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        # If instructor (not admin), set instructor to themselves
        if is_instructor(request.user) and not is_admin(request.user):
            data['instructor'] = request.user.id
        
        # Generate slug if not provided
        if 'slug' not in data and 'title' in data:
            data['slug'] = slugify(data['title'])
        
        serializer = CourseDetailSerializer(data=data)
        if serializer.is_valid():
            course = serializer.save()
            if is_instructor(request.user) and not is_admin(request.user):
                course.instructor = request.user
                course.save()
            return Response(CourseDetailSerializer(course).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET: List courses
    courses = get_course_queryset(request.user).prefetch_related('categories', 'tags', 'instructor').annotate(
        enrollment_count=Count('enrollments', distinct=True),
        total_revenue=Sum('payments__amount', filter=Q(payments__status='paid')),
        avg_rating=Avg('reviews__rating'),
    )
    
    # Search
    search = request.GET.get('search')
    if search:
        courses = courses.filter(Q(title__icontains=search) | Q(description__icontains=search))
    
    # Filter by modality
    modality = request.GET.get('modality')
    if modality:
        courses = courses.filter(modality=modality)
    
    # Filter by status
    is_active = request.GET.get('is_active')
    if is_active is not None:
        courses = courses.filter(is_active=is_active.lower() == 'true')
    
    # Pagination
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    start = (page - 1) * page_size
    end = start + page_size
    
    total = courses.count()
    courses_list = courses[start:end]
    
    return Response({
        'count': total,
        'results': [{
            'id': course.id,
            'title': course.title,
            'slug': course.slug,
            'modality': course.modality,
            'price': float(course.price),
            'instructor': course.instructor.username if course.instructor else None,
            'instructor_id': course.instructor.id if course.instructor else None,
            'is_active': course.is_active,
            'enrollment_count': course.enrollment_count or 0,
            'total_revenue': float(course.total_revenue or 0),
            'rating': float(course.avg_rating or 0),
            'created_at': course.created_at.isoformat(),
        } for course in courses_list],
        'page': page,
        'page_size': page_size,
    })


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_course_detail(request, course_id):
    """Get, update, or delete a specific course"""
    if not is_admin_or_instructor(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        course = get_course_queryset(request.user).get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = CourseDetailSerializer(course)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        # Check permission: instructor can only update their own courses
        if is_instructor(request.user) and not is_admin(request.user):
            if course.instructor != request.user:
                return Response({'error': 'You can only update your own courses'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CourseDetailSerializer(course, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only admins can delete courses
        if not is_admin(request.user):
            return Response({'error': 'Only admins can delete courses'}, status=status.HTTP_403_FORBIDDEN)
        course.delete()
        return Response({'message': 'Course deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_students_list(request):
    """Get all students for admin/instructor management"""
    if not is_admin_or_instructor(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # For instructors, only show students enrolled in their courses
    if is_instructor(request.user) and not is_admin(request.user):
        students = User.objects.filter(
            enrollments__course__instructor=request.user
        ).distinct().annotate(
            enrollment_count=Count('enrollments', filter=Q(enrollments__course__instructor=request.user), distinct=True),
            total_spent=Sum('payments__amount', filter=Q(payments__status='paid', payments__course__instructor=request.user)),
            courses_completed=Count('enrollments', filter=Q(enrollments__status='completed', enrollments__course__instructor=request.user), distinct=True),
        )
    else:
        # Admin sees all students
        students = User.objects.filter(enrollments__isnull=False).distinct().annotate(
            enrollment_count=Count('enrollments', distinct=True),
            total_spent=Sum('payments__amount', filter=Q(payments__status='paid')),
            courses_completed=Count('enrollments', filter=Q(enrollments__status='completed'), distinct=True),
        )
    
    # Search
    search = request.GET.get('search')
    if search:
        students = students.filter(
            Q(username__icontains=search) | 
            Q(email__icontains=search) | 
            Q(first_name__icontains=search) | 
            Q(last_name__icontains=search)
        )
    
    # Pagination
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    start = (page - 1) * page_size
    end = start + page_size
    
    total = students.count()
    students_list = students[start:end]
    
    return Response({
        'count': total,
        'results': [{
            'id': student.id,
            'username': student.username,
            'email': student.email,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'is_active': student.is_active,
            'date_joined': student.date_joined.isoformat(),
            'enrollment_count': student.enrollment_count or 0,
            'total_spent': float(student.total_spent or 0),
            'courses_completed': student.courses_completed or 0,
        } for student in students_list],
        'page': page,
        'page_size': page_size,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_payments_list(request):
    """Get all payments for admin/instructor management"""
    if not is_admin_or_instructor(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    # Filter payments based on role
    if is_instructor(request.user) and not is_admin(request.user):
        payments = Payment.objects.filter(course__instructor=request.user).select_related('user', 'course').order_by('-created_at')
    else:
        payments = Payment.objects.all().select_related('user', 'course').order_by('-created_at')
    
    # Filter by status
    status_filter = request.GET.get('status')
    if status_filter:
        payments = payments.filter(status=status_filter)
    
    # Search
    search = request.GET.get('search')
    if search:
        payments = payments.filter(
            Q(user__username__icontains=search) |
            Q(course__title__icontains=search) |
            Q(payfast_payment_id__icontains=search)
        )
    
    # Date filter
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    if start_date:
        payments = payments.filter(created_at__gte=start_date)
    if end_date:
        payments = payments.filter(created_at__lte=end_date)
    
    # Pagination
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    start = (page - 1) * page_size
    end = start + page_size
    
    total = payments.count()
    payments_list = payments[start:end]
    
    return Response({
        'count': total,
        'results': [{
            'id': payment.id,
            'user': payment.user.username,
            'user_email': payment.user.email,
            'course': payment.course.title if payment.course else None,
            'course_id': payment.course.id if payment.course else None,
            'amount': float(payment.amount),
            'status': payment.status,
            'payfast_payment_id': payment.payfast_payment_id,
            'created_at': payment.created_at.isoformat(),
        } for payment in payments_list],
        'page': page,
        'page_size': page_size,
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_quizzes_list(request, course_id):
    """Get all quizzes for a course or create new quiz"""
    if not is_admin_or_instructor(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        course = get_course_queryset(request.user).get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'POST':
        # Create new quiz
        data = request.data.copy()
        data['course'] = course_id
        serializer = QuizSerializer(data=data)
        if serializer.is_valid():
            quiz = serializer.save()
            return Response(QuizSerializer(quiz).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET: List quizzes
    quizzes = Quiz.objects.filter(course=course).order_by('order')
    serializer = QuizSerializer(quizzes, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_quiz_detail(request, course_id, quiz_id):
    """Get, update, or delete a specific quiz"""
    if not is_admin_or_instructor(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        course = get_course_queryset(request.user).get(id=course_id)
        quiz = Quiz.objects.get(id=quiz_id, course=course)
    except (Course.DoesNotExist, Quiz.DoesNotExist):
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = QuizSerializer(quiz)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = QuizSerializer(quiz, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        quiz.delete()
        return Response({'message': 'Quiz deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_questions_list(request, course_id, quiz_id):
    """Get all questions for a quiz or create new question"""
    if not is_admin_or_instructor(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        course = get_course_queryset(request.user).get(id=course_id)
        quiz = Quiz.objects.get(id=quiz_id, course=course)
    except (Course.DoesNotExist, Quiz.DoesNotExist):
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'POST':
        # Create new question
        data = request.data.copy()
        data['quiz'] = quiz_id
        serializer = QuestionSerializer(data=data)
        if serializer.is_valid():
            question = serializer.save()
            return Response(QuestionSerializer(question).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET: List questions
    questions = Question.objects.filter(quiz=quiz).order_by('order')
    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_question_detail(request, course_id, quiz_id, question_id):
    """Get, update, or delete a specific question"""
    if not is_admin_or_instructor(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        course = get_course_queryset(request.user).get(id=course_id)
        quiz = Quiz.objects.get(id=quiz_id, course=course)
        question = Question.objects.get(id=question_id, quiz=quiz)
    except (Course.DoesNotExist, Quiz.DoesNotExist, Question.DoesNotExist):
        return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = QuestionSerializer(question)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = QuestionSerializer(question, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        question.delete()
        return Response({'message': 'Question deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """Get all users or create new user (admin only)"""
    if not is_admin(request.user):
        return Response({'error': 'Only admins can manage users'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'POST':
        # Create new user
        from django.contrib.auth.hashers import make_password
        from .serializers import UserRegistrationSerializer
        
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Set role if provided
            if 'is_staff' in request.data:
                user.is_staff = request.data['is_staff'] == True or request.data['is_staff'] == 'true'
                user.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET: List users
    users = User.objects.all().annotate(
        course_count=Count('instructed_courses', distinct=True),
        enrollment_count=Count('enrollments', distinct=True),
    )
    
    # Filter by role
    role = request.GET.get('role')
    if role == 'admin':
        users = users.filter(is_staff=True)
    elif role == 'instructor':
        users = users.filter(instructed_courses__isnull=False).distinct()
    elif role == 'student':
        users = users.filter(enrollments__isnull=False, is_staff=False).distinct()
    
    # Search
    search = request.GET.get('search')
    if search:
        users = users.filter(
            Q(username__icontains=search) | 
            Q(email__icontains=search) | 
            Q(first_name__icontains=search) | 
            Q(last_name__icontains=search)
        )
    
    # Pagination
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    start = (page - 1) * page_size
    end = start + page_size
    
    total = users.count()
    users_list = users[start:end]
    
    return Response({
        'count': total,
        'results': [{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat(),
            'course_count': user.course_count or 0,
            'enrollment_count': user.enrollment_count or 0,
            'role': 'admin' if user.is_staff else ('instructor' if user.course_count > 0 else 'student'),
        } for user in users_list],
        'page': page,
        'page_size': page_size,
    })


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, user_id):
    """Get or update a specific user (admin only)"""
    if not is_admin(request.user):
        return Response({'error': 'Only admins can manage users'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        # Update user
        serializer = UserSerializer(user, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            # Update is_staff if provided
            if 'is_staff' in request.data:
                user.is_staff = request.data['is_staff'] == True or request.data['is_staff'] == 'true'
                user.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
