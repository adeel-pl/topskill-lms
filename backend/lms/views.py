from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q, Count, Avg
from django.db import IntegrityError
from django.utils import timezone
from .models import (
    Course, Batch, Enrollment, Payment, Attendance, BatchSession, SessionRegistration,
    Quiz, QuizAttempt, Assignment, AssignmentSubmission, Review, Wishlist,
    Notification, Certificate, LectureProgress, Category, Tag,
    CourseSection, Lecture, Question, QuestionOption, Resource, Note, QandA, Announcement
)
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, BatchSerializer,
    EnrollmentSerializer, EnrollmentCreateSerializer, PaymentSerializer,
    PaymentCreateSerializer, AttendanceSerializer, AttendanceCreateSerializer,
    ReviewSerializer, ReviewCreateSerializer, QuizSerializer, QuizAttemptSerializer,
    AssignmentSerializer, AssignmentSubmissionSerializer, NotificationSerializer,
    CertificateSerializer, LectureProgressSerializer, WishlistSerializer,
    WishlistCreateSerializer, UserSerializer, CategorySerializer, TagSerializer,
    CourseSectionSerializer, CourseSectionDetailSerializer, LectureSerializer,
    BatchSessionSerializer, SessionRegistrationSerializer, QandASerializer, AnnouncementSerializer
)
from .services import PayFastService, GroqAIService
from .permissions import IsInstructorOrReadOnly, IsStudentOrReadOnly


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for courses"""
    queryset = Course.objects.filter(is_active=True).prefetch_related(
        'categories', 'tags', 'batches', 'sections__lectures'
    )
    permission_classes = [permissions.AllowAny]  # Public access to courses
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by slug (for dynamic course pages)
        slug = self.request.query_params.get('slug')
        if slug:
            queryset = queryset.filter(slug=slug)
            return queryset  # Return early for slug filter
        
        # Filter by modality
        modality = self.request.query_params.get('modality')
        if modality:
            queryset = queryset.filter(modality=modality)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(categories__slug=category)
        
        # Filter by tag
        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__slug=tag)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(instructor__username__icontains=search) |
                Q(instructor__first_name__icontains=search) |
                Q(instructor__last_name__icontains=search)
            )
        
        return queryset.distinct()
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll in a course"""
        course = self.get_object()
        user = request.user
        
        # Check if already enrolled
        if Enrollment.objects.filter(user=user, course=course).exists():
            return Response(
                {'error': 'Already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if payment is required
        if course.price > 0:
            # Check for pending or paid payment
            payment = Payment.objects.filter(
                user=user, course=course, status__in=['initiated', 'paid']
            ).first()
            
            if not payment or payment.status != 'paid':
                return Response(
                    {'error': 'Payment required', 'course_price': course.price},
                    status=status.HTTP_402_PAYMENT_REQUIRED
                )
        
        # Create enrollment
        enrollment = Enrollment.objects.create(
            user=user,
            course=course,
            status='active'
        )
        
        # Auto-assign to batch if needed
        if course.modality in ['physical', 'hybrid']:
            enrollment.assign_to_batch()
            
            # Send notification
            Notification.objects.create(
                user=user,
                notification_type='batch_assigned',
                title='Batch Assigned',
                message=f'You have been assigned to a batch for {course.title}',
                related_course=course
            )
        
        # Send enrollment confirmation email
        from django.core.mail import send_mail
        from django.conf import settings
        try:
            send_mail(
                subject=f'Enrollment Confirmation: {course.title}',
                message=f'''
Hello {user.get_full_name() or user.username},

Congratulations! You have successfully enrolled in "{course.title}".

Course Details:
- Title: {course.title}
- Modality: {course.modality.title()}
- Price: ${course.price}

You can now access the course content and start learning.

Start learning: {settings.FRONTEND_URL}/learn/{course.slug}

Best regards,
TopSkill LMS Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email] if user.email else [],
                fail_silently=True,
            )
        except Exception:
            pass  # Email sending is optional
        
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        """Get AI-powered course recommendations"""
        course = self.get_object()
        user = request.user
        
        # Get user's enrolled courses
        enrolled_courses = Enrollment.objects.filter(
            user=user, status='active'
        ).values_list('course_id', flat=True)
        
        # Get recommendations using Groq AI
        ai_service = GroqAIService()
        recommendations = ai_service.get_course_recommendations(
            course_id=course.id,
            user_enrollments=list(enrolled_courses)
        )
        
        # Get recommended courses
        recommended_courses = Course.objects.filter(
            id__in=recommendations,
            is_active=True
        ).exclude(id=course.id)
        
        serializer = CourseListSerializer(recommended_courses, many=True)
        return Response(serializer.data)


class BatchViewSet(viewsets.ModelViewSet):
    """ViewSet for batches"""
    queryset = Batch.objects.all().select_related('course', 'instructor')
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        """Get all sessions for a batch"""
        batch = self.get_object()
        sessions = batch.sessions.all().order_by('start_datetime')
        
        from .serializers import BatchSessionSerializer
        serializer = BatchSessionSerializer(sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def attendance(self, request, pk=None):
        """Get attendance records for a batch"""
        batch = self.get_object()
        
        # Only instructors can view attendance
        if not request.user.is_staff and batch.instructor != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        enrollments = batch.enrollments.filter(status='active')
        attendance_records = Attendance.objects.filter(
            enrollment__in=enrollments,
            session__batch=batch
        ).select_related('enrollment__user', 'session')
        
        serializer = AttendanceSerializer(attendance_records, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def auto_schedule_sessions(self, request, pk=None):
        """Auto-schedule sessions for a batch"""
        from datetime import date, timedelta
        import json
        
        batch = self.get_object()
        
        # Only instructors or staff can schedule sessions
        if not request.user.is_staff and batch.instructor != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        session_date_str = request.data.get('session_date')
        session_duration = request.data.get('session_duration_hours', 2)
        time_slots = request.data.get('time_slots', None)
        
        if not session_date_str:
            return Response(
                {'error': 'session_date is required (YYYY-MM-DD format)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            session_date = date.fromisoformat(session_date_str)
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sessions = batch.auto_schedule_sessions(
            session_date=session_date,
            session_duration_hours=session_duration,
            time_slots=time_slots
        )
        
        serializer = BatchSessionSerializer(sessions, many=True)
        return Response({
            'message': f'Created {len(sessions)} sessions',
            'sessions': serializer.data
        }, status=status.HTTP_201_CREATED)


class EnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for enrollments"""
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Students see only their enrollments
        if not user.is_staff:
            return Enrollment.objects.filter(user=user).select_related('course', 'batch')
        
        # Staff can see all enrollments
        queryset = Enrollment.objects.all().select_related('user', 'course', 'batch')
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Filter by user
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EnrollmentCreateSerializer
        return EnrollmentSerializer
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update course progress"""
        enrollment = self.get_object()
        
        if enrollment.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        progress = request.data.get('progress_percent', 0)
        enrollment.progress_percent = max(0, min(100, float(progress)))
        enrollment.save()
        
        # Check if course is completed
        if enrollment.progress_percent >= 100 and enrollment.status != 'completed':
            enrollment.status = 'completed'
            enrollment.save()
            
            # Generate certificate
            Certificate.objects.get_or_create(enrollment=enrollment)
            
            # Send notification
            Notification.objects.create(
                user=enrollment.user,
                notification_type='certificate_ready',
                title='Certificate Ready',
                message=f'Your certificate for {enrollment.course.title} is ready!',
                related_course=enrollment.course
            )
        
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for payments"""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Users see only their payments
        if not user.is_staff:
            return Payment.objects.filter(user=user).select_related('course')
        
        # Staff can see all payments
        return Payment.objects.all().select_related('user', 'course')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def create(self, request, *args, **kwargs):
        """Create payment and initiate PayFast payment"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        course = serializer.validated_data['course']
        amount = serializer.validated_data['amount']
        
        # Create payment record
        payment = Payment.objects.create(
            user=request.user,
            course=course,
            amount=amount,
            status='initiated'
        )
        
        # Generate PayFast payment URL
        payfast_service = PayFastService()
        payment_url = payfast_service.generate_payment_url(payment)
        
        return Response({
            'payment_id': payment.id,
            'payment_url': payment_url,
            'status': payment.status
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], url_path='notify')
    def notify(self, request):
        """PayFast payment notification webhook"""
        payfast_service = PayFastService()
        result = payfast_service.handle_notification(request.data)
        
        if result['success']:
            return Response({'status': 'ok'}, status=status.HTTP_200_OK)
        return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)


class BatchSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for batch sessions"""
    queryset = BatchSession.objects.all().select_related('batch', 'batch__course')
    serializer_class = BatchSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by batch
        batch_id = self.request.query_params.get('batch')
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(batch__course_id=course_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(start_datetime__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(start_datetime__date__lte=end_date)
        
        return queryset.order_by('start_datetime', 'session_number')
    
    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """Register student for a session"""
        session = self.get_object()
        enrollment_id = request.data.get('enrollment_id')
        
        if not enrollment_id:
            return Response(
                {'error': 'enrollment_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            enrollment = Enrollment.objects.get(id=enrollment_id, user=request.user)
        except Enrollment.DoesNotExist:
            return Response(
                {'error': 'Enrollment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if session is full
        if session.is_full():
            return Response(
                {'error': 'Session is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already registered
        registration, created = SessionRegistration.objects.get_or_create(
            enrollment=enrollment,
            session=session,
            defaults={'status': 'registered'}
        )
        
        if not created:
            return Response(
                {'error': 'Already registered for this session'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = SessionRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def registrations(self, request, pk=None):
        """Get all registrations for a session"""
        session = self.get_object()
        
        # Only instructors or staff can view registrations
        if not request.user.is_staff and session.batch.instructor != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        registrations = session.session_registrations.all().select_related('enrollment__user')
        serializer = SessionRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)


class SessionRegistrationViewSet(viewsets.ModelViewSet):
    """ViewSet for session registrations"""
    serializer_class = SessionRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Students see only their registrations
        if not user.is_staff:
            return SessionRegistration.objects.filter(
                enrollment__user=user
            ).select_related('enrollment', 'session', 'session__batch')
        
        # Staff can see all registrations
        return SessionRegistration.objects.all().select_related('enrollment', 'session', 'session__batch')
    
    def destroy(self, request, *args, **kwargs):
        """Cancel registration"""
        registration = self.get_object()
        
        # Only the student or staff can cancel
        if not request.user.is_staff and registration.enrollment.user != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        registration.status = 'cancelled'
        registration.save()
        
        return Response({'message': 'Registration cancelled'}, status=status.HTTP_200_OK)


class AttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for attendance"""
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Students see only their attendance
        if not user.is_staff:
            return Attendance.objects.filter(
                enrollment__user=user
            ).select_related('enrollment', 'session')
        
        # Staff can see all attendance
        return Attendance.objects.all().select_related('enrollment', 'session')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AttendanceCreateSerializer
        return AttendanceSerializer
    
    @action(detail=False, methods=['post'], url_path='mark')
    def mark_attendance(self, request):
        """Mark attendance for a session"""
        session_id = request.data.get('session_id')
        enrollment_id = request.data.get('enrollment_id')
        present = request.data.get('present', False)
        note = request.data.get('note', '')
        
        try:
            session = BatchSession.objects.get(id=session_id)
            enrollment = Enrollment.objects.get(id=enrollment_id)
            
            # Check permissions
            if not request.user.is_staff and session.batch.instructor != request.user:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            attendance, created = Attendance.objects.get_or_create(
                enrollment=enrollment,
                session=session,
                defaults={'present': present, 'note': note}
            )
            
            if not created:
                attendance.present = present
                attendance.note = note
                attendance.save()
            
            serializer = AttendanceSerializer(attendance)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
        except (BatchSession.DoesNotExist, Enrollment.DoesNotExist):
            return Response(
                {'error': 'Session or enrollment not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for reviews"""
    queryset = Review.objects.all().select_related('user', 'course')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset


class WishlistViewSet(viewsets.ModelViewSet):
    """ViewSet for wishlist"""
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('course')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WishlistCreateSerializer
        return WishlistSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).select_related('related_course')
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
        
        return Response({'status': 'All notifications marked as read'})


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for tags"""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]


# ==================== COURSE CONTENT CRUD ====================

class CourseSectionViewSet(viewsets.ModelViewSet):
    """ViewSet for course sections"""
    serializer_class = CourseSectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = CourseSection.objects.all().select_related('course')
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Staff can see all, instructors can see their courses
        if not self.request.user.is_staff:
            queryset = queryset.filter(course__instructor=self.request.user)
        
        return queryset.order_by('order')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseSectionDetailSerializer
        return CourseSectionSerializer


class LectureViewSet(viewsets.ModelViewSet):
    """ViewSet for lectures"""
    serializer_class = LectureSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Lecture.objects.all().select_related('section', 'section__course')
        
        # Filter by section
        section_id = self.request.query_params.get('section')
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(section__course_id=course_id)
        
        # Staff can see all, instructors can see their courses
        if not self.request.user.is_staff:
            queryset = queryset.filter(section__course__instructor=self.request.user)
        
        return queryset.order_by('section__order', 'order')


class QuizViewSet(viewsets.ModelViewSet):
    """ViewSet for quizzes"""
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Quiz.objects.filter(is_active=True).select_related('course').prefetch_related(
            'questions__options'
        )
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.order_by('order')
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to check enrollment"""
        quiz = self.get_object()
        
        # Staff can always access
        if request.user.is_staff:
            return super().retrieve(request, *args, **kwargs)
        
        # Check if user is enrolled in the course
        if request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(
                user=request.user,
                course=quiz.course,
                status__in=['active', 'completed']
            ).first()
            
            if not enrollment:
                return Response(
                    {'error': 'You must be enrolled in this course to access quizzes.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            # Not authenticated - deny access
            return Response(
                {'error': 'You must be logged in and enrolled in this course to access quizzes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().retrieve(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        # Only instructors or staff can create quizzes
        if not self.request.user.is_staff and course.instructor != self.request.user:
            raise permissions.PermissionDenied("Only course instructors can create quizzes")
        serializer.save()


class QuizAttemptViewSet(viewsets.ModelViewSet):
    """ViewSet for quiz attempts"""
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Students see only their attempts
        if not user.is_staff:
            return QuizAttempt.objects.filter(
                enrollment__user=user
            ).select_related('enrollment', 'quiz')
        
        # Staff can see all attempts
        queryset = QuizAttempt.objects.all().select_related('enrollment', 'quiz')
        
        # Filter by quiz
        quiz_id = self.request.query_params.get('quiz')
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)
        
        # Filter by enrollment
        enrollment_id = self.request.query_params.get('enrollment')
        if enrollment_id:
            queryset = queryset.filter(enrollment_id=enrollment_id)
        
        return queryset
    
    def perform_create(self, serializer):
        enrollment = serializer.validated_data['enrollment']
        # Only the enrolled user can create attempts
        if enrollment.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only create attempts for your own enrollments")
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit quiz answers and grade the quiz"""
        attempt = self.get_object()
        
        # Check if already submitted
        if attempt.completed_at:
            return Response(
                {'error': 'This quiz attempt has already been submitted.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check ownership
        if attempt.enrollment.user != request.user and not request.user.is_staff:
            raise permissions.PermissionDenied("You can only submit your own quiz attempts")
        
        answers = request.data.get('answers', {})
        quiz = attempt.quiz
        
        # Grade the quiz
        total_points = 0
        earned_points = 0
        
        for question in quiz.questions.all():
            total_points += float(question.points)
            question_id = question.id
            user_answer = answers.get(str(question_id)) or answers.get(question_id)
            
            if question.question_type == 'multiple_choice':
                # Check if user selected the correct option
                correct_option = question.options.filter(is_correct=True).first()
                if correct_option and user_answer:
                    try:
                        user_answer_id = int(user_answer)
                        if user_answer_id == correct_option.id:
                            earned_points += float(question.points)
                    except (ValueError, TypeError):
                        pass
            
            elif question.question_type == 'true_false':
                # Check if answer matches correct_answer
                if user_answer and str(user_answer).strip().lower() == str(question.correct_answer).strip().lower():
                    earned_points += float(question.points)
            
            elif question.question_type == 'short_answer':
                # For short answer, we'll give partial credit if answer contains keywords
                # For now, simple exact match (can be improved)
                if user_answer and str(user_answer).strip().lower() == str(question.correct_answer).strip().lower():
                    earned_points += float(question.points)
        
        # Calculate score percentage
        score = (earned_points / total_points * 100) if total_points > 0 else 0
        passed = score >= float(quiz.passing_score)
        
        # Update attempt
        attempt.answers = answers
        attempt.score = round(score, 2)
        attempt.passed = passed
        attempt.completed_at = timezone.now()
        attempt.save()
        
        return Response({
            'id': attempt.id,
            'score': float(attempt.score),
            'passed': attempt.passed,
            'earned_points': earned_points,
            'total_points': total_points,
            'passing_score': float(quiz.passing_score)
        }, status=status.HTTP_200_OK)


class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for assignments"""
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Assignment.objects.filter(is_active=True).select_related('course')
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.order_by('order')
    
    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        # Only instructors or staff can create assignments
        if not self.request.user.is_staff and course.instructor != self.request.user:
            raise permissions.PermissionDenied("Only course instructors can create assignments")
        serializer.save()


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for assignment submissions"""
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Students see only their submissions
        if not user.is_staff:
            return AssignmentSubmission.objects.filter(
                enrollment__user=user
            ).select_related('enrollment', 'assignment')
        
        # Staff can see all submissions
        queryset = AssignmentSubmission.objects.all().select_related('enrollment', 'assignment')
        
        # Filter by assignment
        assignment_id = self.request.query_params.get('assignment')
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)
        
        # Filter by enrollment
        enrollment_id = self.request.query_params.get('enrollment')
        if enrollment_id:
            queryset = queryset.filter(enrollment_id=enrollment_id)
        
        return queryset
    
    def perform_create(self, serializer):
        enrollment = serializer.validated_data['enrollment']
        assignment = serializer.validated_data['assignment']
        
        # Only the enrolled user can create submissions
        if enrollment.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only submit assignments for your own enrollments")
        
        # Check if submission already exists (due to unique_together constraint)
        existing = AssignmentSubmission.objects.filter(
            enrollment=enrollment,
            assignment=assignment
        ).first()
        
        if existing:
            # Update existing submission instead of creating new one
            serializer.instance = existing
            serializer.save()
        else:
            try:
                serializer.save()
            except IntegrityError:
                # Handle race condition where submission was created between check and save
                existing = AssignmentSubmission.objects.get(
                    enrollment=enrollment,
                    assignment=assignment
                )
                serializer.instance = existing
                serializer.save()


class LectureProgressViewSet(viewsets.ModelViewSet):
    """ViewSet for lecture progress"""
    serializer_class = LectureProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Students see only their progress
        if not user.is_staff:
            return LectureProgress.objects.filter(
                enrollment__user=user
            ).select_related('enrollment', 'lecture')
        
        # Staff can see all progress
        queryset = LectureProgress.objects.all().select_related('enrollment', 'lecture')
        
        # Filter by enrollment
        enrollment_id = self.request.query_params.get('enrollment')
        if enrollment_id:
            queryset = queryset.filter(enrollment_id=enrollment_id)
        
        # Filter by lecture
        lecture_id = self.request.query_params.get('lecture')
        if lecture_id:
            queryset = queryset.filter(lecture_id=lecture_id)
        
        return queryset
    
    def perform_create(self, serializer):
        enrollment = serializer.validated_data['enrollment']
        # Only the enrolled user can create progress
        if enrollment.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only track progress for your own enrollments")
        serializer.save()
        
        # Update enrollment progress
        enrollment.update_progress()


class ResourceViewSet(viewsets.ModelViewSet):
    """ViewSet for course resources"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        from .serializers import ResourceSerializer
        self.serializer_class = ResourceSerializer
        
        queryset = Resource.objects.filter(is_active=True).select_related('course')
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.order_by('order')
    
    def get_serializer_class(self):
        from .serializers import ResourceSerializer
        return ResourceSerializer
    
    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        # Only instructors or staff can create resources
        if not self.request.user.is_staff and course.instructor != self.request.user:
            raise permissions.PermissionDenied("Only course instructors can create resources")
        serializer.save()


class NoteViewSet(viewsets.ModelViewSet):
    """ViewSet for student notes"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        from .serializers import NoteSerializer
        self.serializer_class = NoteSerializer
        
        user = self.request.user
        
        # Students see only their notes
        if not user.is_staff:
            return Note.objects.filter(
                enrollment__user=user
            ).select_related('enrollment', 'lecture')
        
        # Staff can see all notes
        queryset = Note.objects.all().select_related('enrollment', 'lecture')
        
        # Filter by enrollment
        enrollment_id = self.request.query_params.get('enrollment')
        if enrollment_id:
            queryset = queryset.filter(enrollment_id=enrollment_id)
        
        # Filter by lecture
        lecture_id = self.request.query_params.get('lecture')
        if lecture_id:
            queryset = queryset.filter(lecture_id=lecture_id)
        
        return queryset.order_by('-updated_at')
    
    def get_serializer_class(self):
        from .serializers import NoteSerializer
        return NoteSerializer
    
    def perform_create(self, serializer):
        enrollment = serializer.validated_data['enrollment']
        # Only the enrolled user can create notes
        if enrollment.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only create notes for your own enrollments")
        serializer.save()


class QandAViewSet(viewsets.ModelViewSet):
    """ViewSet for Q&A (FAQ) - Full CRUD for admins/instructors, read-only for others"""
    serializer_class = QandASerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        # Public users see only active Q&As
        if not self.request.user.is_authenticated:
            queryset = QandA.objects.filter(is_active=True)
        # Authenticated users see all (for admin/instructor management)
        elif self.request.user.is_staff:
            queryset = QandA.objects.all()
        # Instructors see Q&As for their courses
        else:
            queryset = QandA.objects.filter(
                Q(is_active=True) | Q(course__instructor=self.request.user)
            )
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.order_by('order', 'created_at')
    
    def perform_create(self, serializer):
        """Only staff and course instructors can create Q&As"""
        course = serializer.validated_data['course']
        if not self.request.user.is_staff and course.instructor != self.request.user:
            raise permissions.PermissionDenied("Only course instructors can create Q&As")
        serializer.save()
    
    def perform_update(self, serializer):
        """Only staff and course instructors can update Q&As"""
        qanda = self.get_object()
        if not self.request.user.is_staff and qanda.course.instructor != self.request.user:
            raise permissions.PermissionDenied("Only course instructors can update Q&As")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Only staff and course instructors can delete Q&As"""
        if not self.request.user.is_staff and instance.course.instructor != self.request.user:
            raise permissions.PermissionDenied("Only course instructors can delete Q&As")
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Increment view count for a Q&A"""
        qanda = self.get_object()
        qanda.views_count += 1
        qanda.save()
        return Response({'views_count': qanda.views_count})


class AnnouncementViewSet(viewsets.ModelViewSet):
    """ViewSet for announcements - Full CRUD for admins/instructors, read-only for others"""
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        # Public users see only active announcements
        if not self.request.user.is_authenticated:
            queryset = Announcement.objects.filter(is_active=True)
        # Authenticated users see all (for admin/instructor management)
        elif self.request.user.is_staff:
            queryset = Announcement.objects.all()
        # Instructors see announcements for their courses
        else:
            queryset = Announcement.objects.filter(
                Q(is_active=True) | Q(course__instructor=self.request.user)
            )
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.order_by('-is_pinned', '-created_at')
    
    def perform_create(self, serializer):
        """Only staff and course instructors can create announcements"""
        course = serializer.validated_data['course']
        if not self.request.user.is_staff and course.instructor != self.request.user:
            raise permissions.PermissionDenied("Only course instructors can create announcements")
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """Only staff and course instructors can update announcements"""
        announcement = self.get_object()
        if not self.request.user.is_staff and announcement.course.instructor != self.request.user:
            raise permissions.PermissionDenied("Only course instructors can update announcements")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Only staff and course instructors can delete announcements"""
        if not self.request.user.is_staff and instance.course.instructor != self.request.user:
            raise permissions.PermissionDenied("Only course instructors can delete announcements")
        instance.delete()

