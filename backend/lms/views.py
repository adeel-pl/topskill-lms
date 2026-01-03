from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q, Count, Avg
from django.utils import timezone
from .models import (
    Course, Batch, Enrollment, Payment, Attendance, BatchSession,
    Quiz, QuizAttempt, Assignment, AssignmentSubmission, Review, Wishlist,
    Notification, Certificate, LectureProgress, Category, Tag,
    CourseSection, Lecture, Question, QuestionOption, Resource, Note
)
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, BatchSerializer,
    EnrollmentSerializer, EnrollmentCreateSerializer, PaymentSerializer,
    PaymentCreateSerializer, AttendanceSerializer, AttendanceCreateSerializer,
    ReviewSerializer, ReviewCreateSerializer, QuizSerializer, QuizAttemptSerializer,
    AssignmentSerializer, AssignmentSubmissionSerializer, NotificationSerializer,
    CertificateSerializer, LectureProgressSerializer, WishlistSerializer,
    WishlistCreateSerializer, UserSerializer, CategorySerializer, TagSerializer,
    CourseSectionSerializer, CourseSectionDetailSerializer, LectureSerializer
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
                Q(title__icontains=search) | Q(description__icontains=search)
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
        queryset = Quiz.objects.filter(is_active=True).select_related('course')
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.order_by('order')
    
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
        # Only the enrolled user can create submissions
        if enrollment.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only submit assignments for your own enrollments")
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

