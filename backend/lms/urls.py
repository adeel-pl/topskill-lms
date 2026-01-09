from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .views import (
    CourseViewSet, BatchViewSet, BatchSessionViewSet, SessionRegistrationViewSet,
    EnrollmentViewSet, PaymentViewSet, AttendanceViewSet, ReviewViewSet, 
    WishlistViewSet, NotificationViewSet, CategoryViewSet, TagViewSet, 
    CourseSectionViewSet, LectureViewSet, QuizViewSet, QuizAttemptViewSet, 
    AssignmentViewSet, AssignmentSubmissionViewSet, LectureProgressViewSet, 
    ResourceViewSet, NoteViewSet, QandAViewSet, AnnouncementViewSet
)
from .auth_views import register, login, logout, profile, update_profile, change_password, forgot_password, reset_password
from .cart_views import CartViewSet
from .course_player_views import CoursePlayerViewSet
from .services import GroqAIService
from .admin_api_views import (
    admin_analytics, admin_courses_list, admin_course_detail,
    admin_students_list, admin_payments_list,
    admin_quizzes_list, admin_quiz_detail,
    admin_questions_list, admin_question_detail,
    admin_users_list, admin_user_detail
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'batch-sessions', BatchSessionViewSet, basename='batch-session')
router.register(r'session-registrations', SessionRegistrationViewSet, basename='session-registration')
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
router.register(r'qandas', QandAViewSet, basename='qanda')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
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
    path('auth/change-password/', change_password, name='change_password'),
    path('auth/forgot-password/', forgot_password, name='forgot_password'),
    path('auth/reset-password/', reset_password, name='reset_password'),
    # Course Player (Udemy-like)
    path('courses/<int:pk>/player/content/', CoursePlayerViewSet.as_view({'get': 'get_course_content'}), name='course-player-content'),
    path('courses/<int:pk>/player/lecture/<int:lecture_id>/', CoursePlayerViewSet.as_view({'get': 'get_lecture'}), name='course-player-lecture'),
    path('courses/<int:pk>/player/lecture/<int:lecture_id>/progress/', CoursePlayerViewSet.as_view({'post': 'update_lecture_progress'}), name='course-player-progress'),
    path('courses/<int:pk>/player/lecture/<int:lecture_id>/complete/', CoursePlayerViewSet.as_view({'post': 'mark_lecture_complete'}), name='course-player-complete'),
    path('courses/<int:pk>/player/lecture/<int:lecture_id>/note/', CoursePlayerViewSet.as_view({'post': 'add_note'}), name='course-player-note'),
    path('courses/<int:pk>/player/forum/', CoursePlayerViewSet.as_view({'get': 'get_forum'}), name='course-player-forum'),
    path('courses/<int:pk>/player/overview/', CoursePlayerViewSet.as_view({'get': 'get_overview'}), name='course-player-overview'),
    # Chatbot
    path('chatbot/', chatbot_view, name='chatbot'),
    # Admin API endpoints
    path('admin/analytics/', admin_analytics, name='admin-analytics'),
    path('admin/courses/', admin_courses_list, name='admin-courses'),
    path('admin/courses/<int:course_id>/', admin_course_detail, name='admin-course-detail'),
    path('admin/courses/<int:course_id>/quizzes/', admin_quizzes_list, name='admin-quizzes'),
    path('admin/courses/<int:course_id>/quizzes/<int:quiz_id>/', admin_quiz_detail, name='admin-quiz-detail'),
    path('admin/courses/<int:course_id>/quizzes/<int:quiz_id>/questions/', admin_questions_list, name='admin-questions'),
    path('admin/courses/<int:course_id>/quizzes/<int:quiz_id>/questions/<int:question_id>/', admin_question_detail, name='admin-question-detail'),
    path('admin/students/', admin_students_list, name='admin-students'),
    path('admin/payments/', admin_payments_list, name='admin-payments'),
    path('admin/users/', admin_users_list, name='admin-users'),
    path('admin/users/<int:user_id>/', admin_user_detail, name='admin-user-detail'),
]

