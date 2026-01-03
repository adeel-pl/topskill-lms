from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .views import (
    CourseViewSet, BatchViewSet, EnrollmentViewSet, PaymentViewSet,
    AttendanceViewSet, ReviewViewSet, WishlistViewSet, NotificationViewSet,
    CategoryViewSet, TagViewSet, CourseSectionViewSet, LectureViewSet,
    QuizViewSet, QuizAttemptViewSet, AssignmentViewSet, AssignmentSubmissionViewSet,
    LectureProgressViewSet, ResourceViewSet, NoteViewSet
)
from .auth_views import register, login, logout, profile, update_profile
from .cart_views import CartViewSet
from .course_player_views import CoursePlayerViewSet
from .services import GroqAIService

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'sections', CourseSectionViewSet, basename='section')
router.register(r'lectures', LectureViewSet, basename='lecture')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'quiz-attempts', QuizAttemptViewSet, basename='quiz-attempt')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'assignment-submissions', AssignmentSubmissionViewSet, basename='assignment-submission')
router.register(r'lecture-progress', LectureProgressViewSet, basename='lecture-progress')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'notes', NoteViewSet, basename='note')
# Course player routes are registered separately below

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatbot_view(request):
    """Chatbot endpoint"""
    user_message = request.data.get('message', '')
    context = request.data.get('context', {})
    
    ai_service = GroqAIService()
    response = ai_service.generate_chatbot_response(user_message, context)
    
    return Response({'response': response}, status=status.HTTP_200_OK)

# Course player routes
player_viewset = CoursePlayerViewSet.as_view({
    'get': 'get_course_content',
})

urlpatterns = [
    path('', include(router.urls)),
    # Authentication endpoints
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', profile, name='profile'),
    path('auth/profile/update/', update_profile, name='update_profile'),
    # Course Player (Udemy-like)
    path('courses/<int:pk>/player/content/', CoursePlayerViewSet.as_view({'get': 'get_course_content'}), name='course-player-content'),
    path('courses/<int:pk>/player/lecture/<int:lecture_id>/', CoursePlayerViewSet.as_view({'get': 'get_lecture'}), name='course-player-lecture'),
    path('courses/<int:pk>/player/lecture/<int:lecture_id>/progress/', CoursePlayerViewSet.as_view({'post': 'update_lecture_progress'}), name='course-player-progress'),
    path('courses/<int:pk>/player/lecture/<int:lecture_id>/note/', CoursePlayerViewSet.as_view({'post': 'add_note'}), name='course-player-note'),
    path('courses/<int:pk>/player/forum/', CoursePlayerViewSet.as_view({'get': 'get_forum'}), name='course-player-forum'),
    path('courses/<int:pk>/player/overview/', CoursePlayerViewSet.as_view({'get': 'get_overview'}), name='course-player-overview'),
    # Chatbot
    path('chatbot/', chatbot_view, name='chatbot'),
]

