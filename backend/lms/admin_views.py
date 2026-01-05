from django.contrib import admin
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta, datetime
from .models import (
    Course, Enrollment, Payment, User, Quiz, Assignment, 
    Review, Batch, BatchSession, SessionRegistration, Attendance
)


@staff_member_required
def analytics_dashboard(request):
    """Analytics dashboard view with date filtering"""
    # Get date filter parameters
    date_range = request.GET.get('date_range', 'all')  # all, 1day, 1week, 1month, custom
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
            # Make end_date inclusive (end of day)
            end = end.replace(hour=23, minute=59, second=59)
            date_filter = Q(created_at__gte=start, created_at__lte=end)
            date_label = f"{start_date} to {end_date}"
        except ValueError:
            date_filter = Q()
            date_label = "All Time"
    
    # Total courses (not filtered by date as courses are persistent)
    total_courses = Course.objects.filter(is_active=True).count()
    
    # Total enrollments (filtered by date)
    enrollment_qs = Enrollment.objects.all()
    if date_filter:
        enrollment_qs = enrollment_qs.filter(date_filter)
    
    total_enrollments = enrollment_qs.count()
    active_enrollments = enrollment_qs.filter(status='active').count()
    completed_enrollments = enrollment_qs.filter(status='completed').count()
    
    # Total students (unique users enrolled, filtered by date)
    total_students = User.objects.filter(enrollments__in=enrollment_qs).distinct().count() if date_filter else User.objects.filter(enrollments__isnull=False).distinct().count()
    
    # Total revenue (filtered by date)
    payment_qs = Payment.objects.filter(status='paid')
    if date_filter:
        payment_qs = payment_qs.filter(date_filter)
    total_revenue = payment_qs.aggregate(total=Sum('amount'))['total'] or 0
    
    # Course-specific statistics (filtered by date)
    course_stats_qs = Course.objects.filter(is_active=True)
    if date_filter:
        # Filter enrollments by date for course stats
        course_stats_list = []
        for course in course_stats_qs:
            course_enrollments = course.enrollments.filter(date_filter)
            course_payments = Payment.objects.filter(course=course, status='paid')
            if date_filter:
                course_payments = course_payments.filter(date_filter)
            
            course_stats_list.append({
                'course': course,
                'title': course.title,
                'modality': course.modality,
                'enrollment_count': course_enrollments.count(),
                'active_enrollments': course_enrollments.filter(status='active').count(),
                'completed_enrollments': course_enrollments.filter(status='completed').count(),
                'total_revenue': course_payments.aggregate(total=Sum('amount'))['total'] or 0,
                'avg_rating': course.reviews.aggregate(avg=Avg('rating'))['avg'] or 0,
                'review_count': course.reviews.count(),
            })
        # Sort by enrollment count
        course_stats = sorted(course_stats_list, key=lambda x: x['enrollment_count'], reverse=True)[:20]
    else:
        course_stats = Course.objects.filter(is_active=True).annotate(
            enrollment_count=Count('enrollments', distinct=True),
            active_enrollments=Count('enrollments', filter=Q(enrollments__status='active'), distinct=True),
            completed_enrollments=Count('enrollments', filter=Q(enrollments__status='completed'), distinct=True),
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews', distinct=True)
        ).order_by('-enrollment_count')[:20]
        
        # Calculate revenue per course separately
        for course in course_stats:
            course.total_revenue = Payment.objects.filter(
                course=course,
                status='paid'
            ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Recent enrollments (last 30 days) - always show last 30 days regardless of filter
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_enrollments = Enrollment.objects.filter(
        created_at__gte=thirty_days_ago
    ).count()
    
    # Physical class statistics (not filtered by date as they are persistent entities)
    # But we can show registrations/attendance within date range if filter is active
    total_batches = Batch.objects.count()
    total_sessions = BatchSession.objects.count()
    
    if date_filter:
        registration_qs = SessionRegistration.objects.filter(date_filter)
        attendance_qs = Attendance.objects.filter(date_filter)
    else:
        registration_qs = SessionRegistration.objects.all()
        attendance_qs = Attendance.objects.all()
    
    total_session_registrations = registration_qs.count()
    total_attendance_records = attendance_qs.count()
    
    # Quiz and Assignment statistics (not filtered by date as they are course content)
    total_quizzes = Quiz.objects.filter(is_active=True).count()
    total_assignments = Assignment.objects.filter(is_active=True).count()
    
    # Top courses by enrollment (filtered by date)
    if date_filter:
        top_courses_list = []
        for course in Course.objects.filter(is_active=True):
            count = course.enrollments.filter(date_filter).count()
            top_courses_list.append({
                'course': course,
                'title': course.title,
                'modality': course.modality,
                'price': course.price,
                'enrollment_count': count
            })
        top_courses = sorted(top_courses_list, key=lambda x: x['enrollment_count'], reverse=True)[:10]
    else:
        top_courses = Course.objects.filter(is_active=True).annotate(
            enrollment_count=Count('enrollments')
        ).order_by('-enrollment_count')[:10]
    
    # Enrollment trends (based on date filter or default to last 7 days)
    enrollment_trends = []
    if date_range == '1day':
        # Show hourly trends for last 24 hours
        for i in range(24):
            hour = timezone.now() - timedelta(hours=23-i)
            count = Enrollment.objects.filter(
                created_at__gte=hour.replace(minute=0, second=0, microsecond=0),
                created_at__lt=(hour + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
            ).count()
            enrollment_trends.append({
                'date': hour.strftime('%Y-%m-%d %H:00'),
                'count': count
            })
    elif date_range == '1week' or date_range == '1month' or (date_range == 'custom' and start_date and end_date):
        # Show daily trends
        if date_range == '1week':
            days = 7
            start = timezone.now() - timedelta(days=6)
        elif date_range == '1month':
            days = 30
            start = timezone.now() - timedelta(days=29)
        else:
            # Custom range
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d')
                end = datetime.strptime(end_date, '%Y-%m-%d')
                days = (end - start).days + 1
            except ValueError:
                days = 7
                start = timezone.now() - timedelta(days=6)
        
        for i in range(days):
            date = start + timedelta(days=i)
            count = Enrollment.objects.filter(
                created_at__date=date.date()
            ).count()
            enrollment_trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
    else:
        # Default: last 7 days
        for i in range(7):
            date = timezone.now() - timedelta(days=6-i)
            count = Enrollment.objects.filter(
                created_at__date=date.date()
            ).count()
            enrollment_trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
    
    context = {
        'total_courses': total_courses,
        'total_enrollments': total_enrollments,
        'active_enrollments': active_enrollments,
        'completed_enrollments': completed_enrollments,
        'total_students': total_students,
        'total_revenue': total_revenue,
        'course_stats': course_stats,
        'recent_enrollments': recent_enrollments,
        'total_batches': total_batches,
        'total_sessions': total_sessions,
        'total_session_registrations': total_session_registrations,
        'total_attendance_records': total_attendance_records,
        'total_quizzes': total_quizzes,
        'total_assignments': total_assignments,
        'top_courses': top_courses,
        'enrollment_trends': enrollment_trends,
        'date_range': date_range,
        'start_date': start_date,
        'end_date': end_date,
        'date_label': date_label,
    }
    
    return render(request, 'admin/analytics_dashboard.html', context)

