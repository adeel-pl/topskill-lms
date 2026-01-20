from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import (
    Course, Batch, Enrollment, Payment, Attendance, BatchSession, SessionRegistration,
    Lecture, CourseSection, Quiz, Question, QuestionOption, QuizAttempt, Assignment, AssignmentSubmission,
    Review, Wishlist, Category, Tag, Notification, Certificate, LectureProgress,
    Forum, Post, Reply, Resource, Note, Cart, CartItem, QandA, Announcement
)


class UserSerializer(serializers.ModelSerializer):
    """User serializer"""
    role = serializers.SerializerMethodField()
    is_instructor = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined', 'role', 'is_instructor']
        read_only_fields = ['id', 'is_staff', 'date_joined', 'role', 'is_instructor']
    
    def get_role(self, obj):
        """Get user role: 'admin', 'instructor', or 'student'"""
        if obj.is_staff:
            return 'admin'
        elif obj.instructed_courses.exists():
            return 'instructor'
        return 'student'
    
    def get_is_instructor(self, obj):
        """Check if user is an instructor"""
        return obj.instructed_courses.exists()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm Password')
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True, label='Confirm New Password')
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "New password fields didn't match."})
        return attrs


class CategorySerializer(serializers.ModelSerializer):
    """Category serializer"""
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent']


class TagSerializer(serializers.ModelSerializer):
    """Tag serializer"""
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class CourseSectionSerializer(serializers.ModelSerializer):
    """Course section serializer"""
    class Meta:
        model = CourseSection
        fields = ['id', 'title', 'order']


class LectureSerializer(serializers.ModelSerializer):
    """Lecture serializer"""
    class Meta:
        model = Lecture
        fields = ['id', 'title', 'description', 'order', 'content_url', 'youtube_video_id', 
                  'duration_minutes', 'is_preview']


class CourseSectionDetailSerializer(serializers.ModelSerializer):
    """Course section with lectures"""
    lectures = LectureSerializer(many=True, read_only=True)
    
    class Meta:
        model = CourseSection
        fields = ['id', 'title', 'order', 'lectures']


class BatchSerializer(serializers.ModelSerializer):
    """Batch serializer"""
    enrolled_count = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()
    instructor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Batch
        fields = ['id', 'name', 'capacity', 'start_date', 'end_date', 'instructor', 
                  'instructor_name', 'enrolled_count', 'available_slots', 'created_at']
    
    def get_enrolled_count(self, obj):
        return obj.get_enrolled_count()
    
    def get_available_slots(self, obj):
        return obj.get_available_slots()
    
    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() if obj.instructor else None


class BatchSessionSerializer(serializers.ModelSerializer):
    """Batch session serializer"""
    registered_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    batch_name = serializers.CharField(source='batch.name', read_only=True)
    course_title = serializers.CharField(source='batch.course.title', read_only=True)
    
    class Meta:
        model = BatchSession
        fields = ['id', 'title', 'batch', 'batch_name', 'course_title', 'session_number', 
                  'start_datetime', 'end_datetime', 'location', 'description', 
                  'registered_count', 'is_full', 'is_active', 'created_at']


class SessionRegistrationSerializer(serializers.ModelSerializer):
    """Session registration serializer"""
    enrollment_user = serializers.CharField(source='enrollment.user.username', read_only=True)
    enrollment_user_email = serializers.EmailField(source='enrollment.user.email', read_only=True)
    session_title = serializers.CharField(source='session.title', read_only=True)
    session_start = serializers.DateTimeField(source='session.start_datetime', read_only=True)
    
    class Meta:
        model = SessionRegistration
        fields = ['id', 'enrollment', 'enrollment_user', 'enrollment_user_email',
                  'session', 'session_title', 'session_start', 'status', 
                  'registered_at', 'created_at']
        read_only_fields = ['registered_at']


class CourseListSerializer(serializers.ModelSerializer):
    """Course list serializer (minimal data)"""
    instructor_name = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_sections = serializers.SerializerMethodField()
    total_lectures = serializers.SerializerMethodField()
    total_duration_hours = serializers.SerializerMethodField()
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'description', 'short_description', 'modality', 'price', 
                  'max_batch_size', 'thumbnail', 'instructor_name', 'enrolled_count',
                  'average_rating', 'total_sections', 'total_lectures', 'total_duration_hours',
                  'categories', 'tags', 'is_active', 'created_at']
    
    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() if obj.instructor else None
    
    def get_enrolled_count(self, obj):
        return obj.get_enrolled_count()
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return sum(r.rating for r in reviews) / len(reviews)
        return None
    
    def get_total_sections(self, obj):
        return obj.sections.count()
    
    def get_total_lectures(self, obj):
        from .models import Lecture
        return Lecture.objects.filter(section__course=obj).count()
    
    def get_total_duration_hours(self, obj):
        from .models import Lecture
        total_minutes = sum(
            Lecture.objects.filter(section__course=obj).values_list('duration_minutes', flat=True) or [0]
        )
        return round(total_minutes / 60, 2) if total_minutes > 0 else 0


class CourseDetailSerializer(serializers.ModelSerializer):
    """Course detail serializer with full data"""
    sections = CourseSectionDetailSerializer(many=True, read_only=True)
    batches = BatchSerializer(many=True, read_only=True)
    instructor_name = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_sections = serializers.SerializerMethodField()
    total_lectures = serializers.SerializerMethodField()
    total_duration_hours = serializers.SerializerMethodField()
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'description', 'short_description', 'modality', 'price', 
                  'max_batch_size', 'thumbnail', 'instructor', 'instructor_name',
                  'enrolled_count', 'average_rating', 'total_sections', 'total_lectures', 'total_duration_hours',
                  'categories', 'tags', 'sections', 'batches', 'is_active', 'created_at', 'updated_at']
    
    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() if obj.instructor else None
    
    def get_enrolled_count(self, obj):
        return obj.get_enrolled_count()
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return sum(r.rating for r in reviews) / len(reviews)
        return None
    
    def get_total_sections(self, obj):
        return obj.sections.count()
    
    def get_total_lectures(self, obj):
        from .models import Lecture
        return Lecture.objects.filter(section__course=obj).count()
    
    def get_total_duration_hours(self, obj):
        from .models import Lecture
        total_minutes = sum(
            Lecture.objects.filter(section__course=obj).values_list('duration_minutes', flat=True) or [0]
        )
        return round(total_minutes / 60, 2) if total_minutes > 0 else 0


class EnrollmentSerializer(serializers.ModelSerializer):
    """Enrollment serializer"""
    course = CourseListSerializer(read_only=True)
    batch = BatchSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'course', 'batch', 'status', 'progress_percent', 
                  'certificate_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating enrollments"""
    class Meta:
        model = Enrollment
        fields = ['course', 'batch']
    
    def create(self, validated_data):
        user = self.context['request'].user
        course = validated_data['course']
        batch = validated_data.get('batch')
        
        enrollment = Enrollment.objects.create(
            user=user,
            course=course,
            batch=batch,
            status='pending'
        )
        
        # Auto-assign to batch if needed
        if not batch and course.modality in ['physical', 'hybrid']:
            enrollment.assign_to_batch()
        
        return enrollment


class PaymentSerializer(serializers.ModelSerializer):
    """Payment serializer"""
    course = CourseListSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'user', 'course', 'amount', 'status', 'payfast_payment_id',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payments"""
    class Meta:
        model = Payment
        fields = ['course', 'amount']
    
    def validate(self, data):
        course = data['course']
        if 'amount' not in data or data['amount'] != course.price:
            data['amount'] = course.price
        return data


class AttendanceSerializer(serializers.ModelSerializer):
    """Attendance serializer"""
    enrollment = EnrollmentSerializer(read_only=True)
    session = BatchSessionSerializer(read_only=True)
    student_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = ['id', 'enrollment', 'session', 'student_name', 'present', 'note', 
                  'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        return obj.enrollment.user.get_full_name() or obj.enrollment.user.username


class AttendanceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating attendance records"""
    class Meta:
        model = Attendance
        fields = ['enrollment', 'session', 'present', 'note']


class ReviewSerializer(serializers.ModelSerializer):
    """Review serializer"""
    user = UserSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'course', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    class Meta:
        model = Review
        fields = ['course', 'rating', 'comment']
    
    def create(self, validated_data):
        user = self.context['request'].user
        return Review.objects.create(user=user, **validated_data)


class QuestionOptionSerializer(serializers.ModelSerializer):
    """Serializer for question options"""
    class Meta:
        model = QuestionOption
        fields = ['id', 'option_text', 'is_correct', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for quiz questions"""
    options = QuestionOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'points', 'order', 'correct_answer', 'options']


class QuizSerializer(serializers.ModelSerializer):
    """Quiz serializer"""
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'passing_score', 'time_limit_minutes',
                  'max_attempts', 'is_active', 'order', 'questions']


class QuizAttemptSerializer(serializers.ModelSerializer):
    """Quiz attempt serializer"""
    quiz = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all(), required=True)
    enrollment = serializers.PrimaryKeyRelatedField(queryset=Enrollment.objects.all(), required=True)
    quiz_detail = QuizSerializer(source='quiz', read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = ['id', 'enrollment', 'quiz', 'quiz_detail', 'score', 'passed', 'started_at', 'completed_at', 'answers']
        read_only_fields = ['id', 'quiz_detail', 'score', 'passed', 'started_at', 'completed_at', 'answers']
    
    def to_representation(self, instance):
        """Return nested quiz in response"""
        representation = super().to_representation(instance)
        if instance.quiz:
            representation['quiz'] = QuizSerializer(instance.quiz).data
        return representation


class AssignmentSerializer(serializers.ModelSerializer):
    """Assignment serializer"""
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'due_date', 'max_score', 'is_active', 'order']


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    """Assignment submission serializer"""
    assignment = serializers.PrimaryKeyRelatedField(queryset=Assignment.objects.all(), required=True)
    enrollment = serializers.PrimaryKeyRelatedField(queryset=Enrollment.objects.all(), required=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'enrollment', 'assignment', 'submission_text', 'submission_file', 'status',
                  'score', 'feedback', 'submitted_at', 'graded_at']
        read_only_fields = ['id', 'status', 'score', 'feedback', 'submitted_at', 'graded_at']
    
    def to_representation(self, instance):
        """Return nested assignment in response"""
        representation = super().to_representation(instance)
        if instance.assignment:
            representation['assignment'] = AssignmentSerializer(instance.assignment).data
        return representation


class NotificationSerializer(serializers.ModelSerializer):
    """Notification serializer"""
    related_course = CourseListSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 'is_read', 'read_at',
                  'related_course', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at']


class CertificateSerializer(serializers.ModelSerializer):
    """Certificate serializer"""
    enrollment = EnrollmentSerializer(read_only=True)
    
    class Meta:
        model = Certificate
        fields = ['id', 'enrollment', 'certificate_number', 'issued_at', 'pdf_file']


class LectureProgressSerializer(serializers.ModelSerializer):
    """Lecture progress serializer"""
    lecture = LectureSerializer(read_only=True)
    
    class Meta:
        model = LectureProgress
        fields = ['id', 'lecture', 'completed', 'completed_at', 'watch_time_seconds', 'last_position']


class WishlistSerializer(serializers.ModelSerializer):
    """Wishlist serializer"""
    course = CourseListSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'course', 'created_at']


class WishlistCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating wishlist items"""
    class Meta:
        model = Wishlist
        fields = ['course']
    
    def create(self, validated_data):
        user = self.context['request'].user
        return Wishlist.objects.get_or_create(user=user, **validated_data)[0]


# ==================== CART SERIALIZERS ====================

class CartItemSerializer(serializers.ModelSerializer):
    """Cart item serializer"""
    course = CourseListSerializer(read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'course', 'created_at']


class CartSerializer(serializers.ModelSerializer):
    """Cart serializer"""
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'created_at', 'updated_at']
    
    def get_total(self, obj):
        return obj.get_total()


class CartItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for adding items to cart"""
    class Meta:
        model = CartItem
        fields = ['course']


# ==================== COURSE PLAYER SERIALIZERS (Udemy-like) ====================

class LectureWithProgressSerializer(serializers.ModelSerializer):
    """Lecture serializer with progress information"""
    progress = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = Lecture
        fields = ['id', 'title', 'description', 'order', 'content_url', 'youtube_video_id',
                  'duration_minutes', 'is_preview', 'video_type', 'progress', 'is_completed']
    
    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = self.context.get('enrollment')
            if enrollment:
                progress = LectureProgress.objects.filter(
                    enrollment=enrollment,
                    lecture=obj
                ).first()
                if progress:
                    return {
                        'completed': progress.completed,
                        'watch_time_seconds': progress.watch_time_seconds,
                        'last_position': progress.last_position,
                    }
        return None
    
    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = self.context.get('enrollment')
            if enrollment:
                progress = LectureProgress.objects.filter(
                    enrollment=enrollment,
                    lecture=obj,
                    completed=True
                ).exists()
                return progress
        return False


class CourseSectionPlayerSerializer(serializers.ModelSerializer):
    """Course section with lectures for player"""
    lectures = serializers.SerializerMethodField()
    completed_lectures = serializers.SerializerMethodField()
    total_lectures = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseSection
        fields = ['id', 'title', 'order', 'is_preview', 'lectures', 'completed_lectures', 'total_lectures']
    
    def get_lectures(self, obj):
        """Get lectures, filtered for non-enrolled users to only show preview lectures"""
        enrollment = self.context.get('enrollment')
        all_lectures = obj.lectures.all().order_by('order')
        
        # For non-enrolled users, only return preview lectures (and only the first one)
        if not enrollment:
            preview_lectures = [l for l in all_lectures if l.is_preview]
            # Only return the very first preview lecture
            if preview_lectures:
                preview_lectures = [preview_lectures[0]]
            lectures_to_serialize = preview_lectures
        else:
            # Enrolled users see all lectures
            lectures_to_serialize = all_lectures
        
        context = self.context
        return LectureWithProgressSerializer(lectures_to_serialize, many=True, context=context).data
    
    def get_completed_lectures(self, obj):
        enrollment = self.context.get('enrollment')
        if enrollment:
            return LectureProgress.objects.filter(
                enrollment=enrollment,
                lecture__section=obj,
                completed=True
            ).count()
        return 0
    
    def get_total_lectures(self, obj):
        enrollment = self.context.get('enrollment')
        # For non-enrolled users, only count preview lectures (and only the first one)
        if not enrollment:
            preview_lectures = [l for l in obj.lectures.all() if l.is_preview]
            return 1 if preview_lectures else 0
        return obj.lectures.count()


# ==================== RESOURCE & NOTE SERIALIZERS ====================

class ResourceSerializer(serializers.ModelSerializer):
    """Resource serializer"""
    class Meta:
        model = Resource
        fields = ['id', 'title', 'description', 'resource_type', 'file', 'external_url',
                  'is_active', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class QandASerializer(serializers.ModelSerializer):
    """Q&A serializer"""
    class Meta:
        model = QandA
        fields = ['id', 'course', 'question', 'answer', 'order', 'is_active', 'views_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'views_count', 'created_at', 'updated_at']


class AnnouncementSerializer(serializers.ModelSerializer):
    """Announcement serializer"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Announcement
        fields = ['id', 'course', 'title', 'content', 'is_pinned', 'is_active', 'created_by', 'created_by_name', 'created_by_username', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class NoteSerializer(serializers.ModelSerializer):
    """Note serializer"""
    lecture_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Note
        fields = ['id', 'enrollment', 'lecture', 'lecture_title', 'content', 'is_public',
                  'timestamp', 'created_at', 'updated_at']
        read_only_fields = ['id', 'enrollment', 'lecture', 'created_at', 'updated_at']
    
    def get_lecture_title(self, obj):
        return obj.lecture.title if obj.lecture else None

