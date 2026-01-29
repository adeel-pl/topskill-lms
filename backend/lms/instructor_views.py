"""
API Views for Instructor Listing (Public/Student Access)
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.db.models import Count, Avg, Q
from .models import Course, Review, Enrollment

@api_view(['GET'])
@permission_classes([AllowAny])
def instructors_list(request):
    """
    Get list of all instructors with their courses
    Public endpoint - accessible to all users
    """
    # Get all users who are instructors (have at least one course)
    instructors = User.objects.filter(
        instructed_courses__isnull=False
    ).distinct().annotate(
        course_count=Count('instructed_courses', filter=Q(instructed_courses__is_active=True)),
        total_students=Count('instructed_courses__enrollments', distinct=True),
        avg_rating=Avg('instructed_courses__reviews__rating')
    ).order_by('-date_joined')
    
    instructors_data = []
    for instructor in instructors:
        # Get active courses for this instructor
        courses = Course.objects.filter(
            instructor=instructor,
            is_active=True
        ).annotate(
            enrolled_count=Count('enrollments', filter=Q(enrollments__status__in=['active', 'pending'])),
            avg_rating=Avg('reviews__rating'),
            review_count=Count('reviews')
        ).order_by('-created_at')[:10]  # Limit to 10 most recent courses
        
        instructors_data.append({
            'id': instructor.id,
            'username': instructor.username,
            'first_name': instructor.first_name,
            'last_name': instructor.last_name,
            'email': instructor.email,
            'full_name': instructor.get_full_name() or instructor.username,
            'date_joined': instructor.date_joined.isoformat(),
            'course_count': instructor.course_count,
            'total_students': instructor.total_students,
            'avg_rating': round(instructor.avg_rating or 0, 1),
            'courses': [{
                'id': course.id,
                'title': course.title,
                'slug': course.slug,
                'short_description': course.short_description,
                'price': float(course.price),
                'modality': course.modality,
                'thumbnail': course.thumbnail,
                'enrolled_count': course.enrolled_count,
                'avg_rating': round(course.avg_rating or 0, 1),
                'review_count': course.review_count,
                'created_at': course.created_at.isoformat(),
            } for course in courses]
        })
    
    return Response({
        'count': len(instructors_data),
        'results': instructors_data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def instructor_detail(request, instructor_id):
    """
    Get detailed information about a specific instructor
    Public endpoint - accessible to all users
    """
    try:
        instructor = User.objects.get(id=instructor_id)
    except User.DoesNotExist:
        return Response({'error': 'Instructor not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is an instructor
    courses = Course.objects.filter(instructor=instructor)
    if not courses.exists():
        return Response({'error': 'User is not an instructor'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get all active courses
    active_courses = courses.filter(is_active=True).annotate(
        enrolled_count=Count('enrollments', filter=Q(enrollments__status__in=['active', 'pending'])),
        avg_rating=Avg('reviews__rating'),
        review_count=Count('reviews')
    ).order_by('-created_at')
    
    # Calculate statistics
    total_courses = active_courses.count()
    total_students = Enrollment.objects.filter(
        course__instructor=instructor,
        status__in=['active', 'pending']
    ).values('user').distinct().count()
    
    all_reviews = Review.objects.filter(course__instructor=instructor)
    avg_rating = all_reviews.aggregate(avg=Avg('rating'))['avg'] or 0
    
    return Response({
        'id': instructor.id,
        'username': instructor.username,
        'first_name': instructor.first_name,
        'last_name': instructor.last_name,
        'email': instructor.email,
        'full_name': instructor.get_full_name() or instructor.username,
        'date_joined': instructor.date_joined.isoformat(),
        'bio': getattr(instructor, 'bio', ''),
        'statistics': {
            'total_courses': total_courses,
            'total_students': total_students,
            'avg_rating': round(avg_rating, 1),
            'total_reviews': all_reviews.count(),
        },
        'courses': [{
            'id': course.id,
            'title': course.title,
            'slug': course.slug,
            'description': course.description,
            'short_description': course.short_description,
            'price': float(course.price),
            'modality': course.modality,
            'thumbnail': course.thumbnail,
            'enrolled_count': course.enrolled_count,
            'avg_rating': round(course.avg_rating or 0, 1),
            'review_count': course.review_count,
            'created_at': course.created_at.isoformat(),
        } for course in active_courses]
    }, status=status.HTTP_200_OK)

