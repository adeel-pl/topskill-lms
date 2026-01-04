from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class TimeStampedModel(models.Model):
    """Abstract base model with created_at and updated_at fields"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ==================== CATEGORY & TAGS ====================

class Category(TimeStampedModel):
    """Course categories with hierarchical support"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name='children', blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(TimeStampedModel):
    """Tags for courses"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ==================== COURSE MODELS ====================

class Course(TimeStampedModel):
    """Main course model supporting online, physical, and hybrid modalities"""
    MODALITY_CHOICES = [
        ('online', 'Online'),
        ('physical', 'Physical'),
        ('hybrid', 'Hybrid'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    short_description = models.TextField(max_length=500, blank=True, help_text="Brief description for course cards")
    modality = models.CharField(max_length=20, choices=MODALITY_CHOICES, default='online')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    max_batch_size = models.PositiveIntegerField(default=25, help_text="Maximum students per batch for physical courses")
    is_active = models.BooleanField(default=True)
    thumbnail = models.URLField(blank=True)
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='instructed_courses', null=True, blank=True)
    categories = models.ManyToManyField(Category, through='CourseCategory', related_name='course_set')
    tags = models.ManyToManyField(Tag, through='CourseTag', related_name='course_set')
    
    # Additional fields for Udemy-like features
    language = models.CharField(max_length=50, default='English')
    level = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('all', 'All Levels')
    ], default='all')
    total_duration_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    total_lectures = models.PositiveIntegerField(default=0)
    total_students = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    num_reviews = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
        # Auto-update course statistics (using string reference to avoid circular import)
        self._update_course_stats()
    
    def _update_course_stats(self):
        """Update course statistics from actual content"""
        # Import here to avoid circular import
        from .models import Lecture
        total_lectures = Lecture.objects.filter(section__course=self).count()
        total_duration = sum(
            Lecture.objects.filter(section__course=self).values_list('duration_minutes', flat=True) or [0]
        )
        # Update without triggering save again to avoid recursion
        Course.objects.filter(id=self.id).update(
            total_lectures=total_lectures,
            total_duration_hours=round(total_duration / 60, 2) if total_duration > 0 else 0
        )

    def __str__(self):
        return self.title

    def get_enrolled_count(self):
        """Get total number of enrolled students"""
        return self.enrollments.filter(status__in=['pending', 'active']).count()

    def get_active_batches(self):
        """Get all active batches for this course"""
        return self.batches.filter(course=self).order_by('start_date')

    def create_batches_if_needed(self):
        """Automatically create batches if enrollment exceeds capacity"""
        if self.modality in ['physical', 'hybrid']:
            enrolled_count = self.get_enrolled_count()
            existing_batches = self.batches.all()
            total_capacity = sum(batch.capacity for batch in existing_batches)
            
            if enrolled_count > total_capacity:
                needed_capacity = enrolled_count - total_capacity
                batches_needed = (needed_capacity + self.max_batch_size - 1) // self.max_batch_size
                
                for i in range(batches_needed):
                    batch_num = existing_batches.count() + i + 1
                    Batch.objects.create(
                        course=self,
                        name=f"{self.title} - Batch {batch_num}",
                        capacity=self.max_batch_size,
                        instructor=self.instructor
                    )


class CourseCategory(TimeStampedModel):
    """Many-to-many relationship between Course and Category"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_categories')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='course_categories')

    class Meta:
        unique_together = ['course', 'category']


class CourseTag(TimeStampedModel):
    """Many-to-many relationship between Course and Tag"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='course_tags')

    class Meta:
        unique_together = ['course', 'tag']


class Prerequisite(TimeStampedModel):
    """Course prerequisites"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='prerequisites')
    required_course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='required_for')

    class Meta:
        unique_together = ['course', 'required_course']


# ==================== COURSE CONTENT ====================

class CourseSection(TimeStampedModel):
    """Sections within a course"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=1)
    is_preview = models.BooleanField(default=False, help_text="Allow preview of this section")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lecture(TimeStampedModel):
    """Lectures within a section"""
    section = models.ForeignKey(CourseSection, on_delete=models.CASCADE, related_name='lectures')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)
    content_url = models.URLField(blank=True, help_text="Direct video URL")
    youtube_video_id = models.CharField(max_length=50, blank=True, help_text='YouTube video ID')
    duration_minutes = models.PositiveIntegerField(default=0)
    is_preview = models.BooleanField(default=False, help_text="Allow preview without enrollment")
    video_type = models.CharField(max_length=20, choices=[
        ('youtube', 'YouTube'),
        ('vimeo', 'Vimeo'),
        ('direct', 'Direct URL'),
        ('uploaded', 'Uploaded File')
    ], default='youtube')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


# ==================== BATCH MANAGEMENT (Physical Courses) ====================

class Batch(TimeStampedModel):
    """Batches for physical courses"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='batches')
    name = models.CharField(max_length=255)
    capacity = models.PositiveIntegerField(default=25)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='instructed_batches', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.course.title} - {self.name}"

    def get_enrolled_count(self):
        """Get number of students enrolled in this batch"""
        return self.enrollments.filter(status__in=['pending', 'active']).count()

    def is_full(self):
        """Check if batch is at capacity"""
        return self.get_enrolled_count() >= self.capacity

    def get_available_slots(self):
        """Get remaining available slots"""
        return max(0, self.capacity - self.get_enrolled_count())
    
    def auto_schedule_sessions(self, session_date, session_duration_hours=2, time_slots=None):
        """
        Automatically create sessions for a given date when enrollment exceeds capacity.
        
        Args:
            session_date: Date for the sessions
            session_duration_hours: Duration of each session in hours (default 2)
            time_slots: Optional list of time slots like ['14:00', '16:00', '18:00']
                       If None, will auto-generate based on enrollment
        
        Returns:
            List of created BatchSession objects
        """
        from django.utils import timezone
        from datetime import datetime, timedelta
        import math
        
        enrolled_count = self.get_enrolled_count()
        if enrolled_count == 0:
            return []
        
        # Calculate how many sessions needed
        sessions_needed = math.ceil(enrolled_count / self.capacity)
        
        # Generate time slots if not provided
        if not time_slots:
            # Default: Start at 2pm, create slots every 2 hours
            start_hour = 14  # 2pm
            time_slots = []
            for i in range(sessions_needed):
                hour = start_hour + (i * session_duration_hours)
                if hour >= 24:
                    hour = hour % 24
                time_slots.append(f"{hour:02d}:00")
        
        created_sessions = []
        session_num = 1
        
        # Get existing sessions for this date to avoid duplicates
        existing_sessions = self.sessions.filter(
            start_datetime__date=session_date
        ).count()
        
        if existing_sessions > 0:
            # Sessions already exist for this date
            return self.sessions.filter(start_datetime__date=session_date)
        
        for time_slot in time_slots[:sessions_needed]:
            # Parse time slot
            hour, minute = map(int, time_slot.split(':'))
            
            # Create datetime objects
            start_datetime = timezone.make_aware(
                datetime.combine(session_date, datetime.min.time().replace(hour=hour, minute=minute))
            )
            end_datetime = start_datetime + timedelta(hours=session_duration_hours)
            
            # Create session
            session = BatchSession.objects.create(
                batch=self,
                title=f"Session {session_num} - {session_date.strftime('%B %d, %Y')}",
                start_datetime=start_datetime,
                end_datetime=end_datetime,
                location=self.course.instructor.profile.location if hasattr(self.course.instructor, 'profile') else '',
                session_number=session_num,
                is_active=True
            )
            
            created_sessions.append(session)
            session_num += 1
        
        # Auto-assign students to sessions
        self.auto_assign_students_to_sessions(created_sessions)
        
        return created_sessions
    
    def auto_assign_students_to_sessions(self, sessions):
        """Automatically assign enrolled students to sessions"""
        enrollments = self.enrollments.filter(status__in=['pending', 'active']).order_by('created_at')
        
        session_index = 0
        for enrollment in enrollments:
            if session_index >= len(sessions):
                session_index = 0  # Cycle back to first session if needed
            
            session = sessions[session_index]
            
            # Check if already registered
            if not SessionRegistration.objects.filter(enrollment=enrollment, session=session).exists():
                SessionRegistration.objects.create(
                    enrollment=enrollment,
                    session=session,
                    status='registered'
                )
            
            # Move to next session when current is full
            if session.get_registered_count() >= self.capacity:
                session_index += 1


class BatchSession(TimeStampedModel):
    """Individual sessions for physical batches with automatic scheduling"""
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=255)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    session_number = models.PositiveIntegerField(default=1, help_text="Session number in the batch")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['start_datetime', 'session_number']
        unique_together = ['batch', 'session_number', 'start_datetime']

    def __str__(self):
        return f"{self.batch.name} - {self.title} (Session {self.session_number})"
    
    def get_registered_count(self):
        """Get number of students registered for this session"""
        return self.session_registrations.filter(status='registered').count()
    
    def is_full(self):
        """Check if session is at capacity"""
        return self.get_registered_count() >= self.batch.capacity


class SessionRegistration(TimeStampedModel):
    """Student registration for specific physical session"""
    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('attended', 'Attended'),
        ('absent', 'Absent'),
        ('cancelled', 'Cancelled'),
    ]
    
    enrollment = models.ForeignKey('Enrollment', on_delete=models.CASCADE, related_name='session_registrations')
    session = models.ForeignKey(BatchSession, on_delete=models.CASCADE, related_name='session_registrations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registered')
    registered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['enrollment', 'session']
    
    def __str__(self):
        return f"{self.enrollment.user.username} - {self.session.title}"


# ==================== ENROLLMENT & PROGRESS ====================

class Enrollment(TimeStampedModel):
    """Student enrollment in courses"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, related_name='enrollments', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    certificate_url = models.URLField(blank=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"

    def assign_to_batch(self):
        """Automatically assign student to an available batch"""
        if self.course.modality in ['physical', 'hybrid'] and not self.batch:
            # Find available batch
            for batch in self.course.batches.filter(is_active=True):
                if not batch.is_full():
                    self.batch = batch
                    self.save()
                    return
            
            # Create new batch if needed
            self.course.create_batches_if_needed()
            
            # Try again after creating batches
            for batch in self.course.batches.filter(is_active=True):
                if not batch.is_full():
                    self.batch = batch
                    self.save()
                    return

    def update_progress(self):
        """Update enrollment progress based on completed lectures"""
        total_lectures = self.course.sections.aggregate(
            total=models.Count('lectures')
        )['total'] or 1
        
        completed_lectures = LectureProgress.objects.filter(
            enrollment=self,
            completed=True
        ).count()
        
        self.progress_percent = (completed_lectures / total_lectures) * 100
        self.save()
        
        # Check if course is completed
        if self.progress_percent >= 100 and self.status != 'completed':
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.save()


class LectureProgress(TimeStampedModel):
    """Track student progress through lectures"""
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lecture_progress')
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='progress')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)
    watch_time_seconds = models.PositiveIntegerField(default=0, help_text="Total time watched in seconds")
    last_position = models.PositiveIntegerField(default=0, help_text="Last watched position in seconds")

    class Meta:
        unique_together = ['enrollment', 'lecture']

    def __str__(self):
        return f"{self.enrollment.user.username} - {self.lecture.title}"

    def save(self, *args, **kwargs):
        if self.completed and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()
            # Update enrollment progress
            self.enrollment.update_progress()
        super().save(*args, **kwargs)


# ==================== CART & PAYMENT ====================

class Cart(TimeStampedModel):
    """Shopping cart for course enrollment"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    
    def get_total(self):
        """Calculate total cart value"""
        return sum(item.course.price for item in self.items.all())
    
    def __str__(self):
        return f"Cart for {self.user.username}"


class CartItem(TimeStampedModel):
    """Items in shopping cart"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['cart', 'course']

    def __str__(self):
        return f"{self.cart.user.username} - {self.course.title}"


class Payment(TimeStampedModel):
    """Payment records with PayFast integration"""
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    cart = models.ForeignKey(Cart, on_delete=models.SET_NULL, null=True, blank=True, help_text="If payment is for entire cart")
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    payfast_payment_id = models.CharField(max_length=128, blank=True)
    payfast_signature = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount} - {self.status}"


# ==================== QUIZ & ASSIGNMENTS ====================

class Quiz(TimeStampedModel):
    """Quizzes for courses"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    passing_score = models.DecimalField(max_digits=5, decimal_places=2, default=70.0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    time_limit_minutes = models.PositiveIntegerField(blank=True, null=True)
    max_attempts = models.PositiveIntegerField(default=3)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=1)
    allow_retake = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Question(TimeStampedModel):
    """Questions within quizzes"""
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='multiple_choice')
    points = models.DecimalField(max_digits=5, decimal_places=2, default=1.0, validators=[MinValueValidator(0)])
    order = models.PositiveIntegerField(default=1)
    correct_answer = models.TextField(help_text='JSON string for multiple choice, or text for short answer')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.question_text[:50]


class QuestionOption(TimeStampedModel):
    """Options for multiple choice questions"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.option_text


class QuizAttempt(TimeStampedModel):
    """Student quiz attempts"""
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    passed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    answers = models.JSONField(default=dict, blank=True)
    attempt_number = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.enrollment.user.username} - {self.quiz.title}"


class Assignment(TimeStampedModel):
    """Assignments for courses"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField(blank=True, null=True)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=100.0, validators=[MinValueValidator(0)])
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=1)
    allow_late_submission = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class AssignmentSubmission(TimeStampedModel):
    """Student assignment submissions"""
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
        ('returned', 'Returned'),
    ]

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='assignment_submissions')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    submission_text = models.TextField(blank=True)
    submission_file = models.FileField(upload_to='assignments/', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    graded_at = models.DateTimeField(blank=True, null=True)
    is_late = models.BooleanField(default=False)

    class Meta:
        ordering = ['-submitted_at']
        unique_together = ['enrollment', 'assignment']

    def __str__(self):
        return f"{self.enrollment.user.username} - {self.assignment.title}"


# ==================== ATTENDANCE (Physical Courses) ====================

class Attendance(TimeStampedModel):
    """Attendance tracking for physical classes"""
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendance_records')
    session = models.ForeignKey(BatchSession, on_delete=models.CASCADE, related_name='attendance_records')
    present = models.BooleanField(default=False)
    note = models.CharField(max_length=255, blank=True)
    checked_in_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ['enrollment', 'session']

    def __str__(self):
        return f"{self.enrollment.user.username} - {self.session.title}"


# ==================== REVIEWS & RATINGS ====================

class Review(TimeStampedModel):
    """Course reviews and ratings"""
    RATING_CHOICES = [(i, i) for i in range(1, 6)]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField(choices=RATING_CHOICES, default=5)
    comment = models.TextField(blank=True)
    is_verified_purchase = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username} - {self.course.title} - {self.rating} stars"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update course rating
        reviews = Review.objects.filter(course=self.course)
        if reviews.exists():
            avg_rating = reviews.aggregate(avg=models.Avg('rating'))['avg']
            self.course.rating = round(avg_rating, 2)
            self.course.num_reviews = reviews.count()
            self.course.save(update_fields=['rating', 'num_reviews'])


# ==================== WISHLIST ====================

class Wishlist(TimeStampedModel):
    """User wishlist for courses"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='wishlisted_by')

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"


# ==================== FORUM & DISCUSSION ====================

class Forum(TimeStampedModel):
    """Course discussion forums"""
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='forum')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.course.title} - Forum"


class Post(TimeStampedModel):
    """Posts in course forums"""
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='posts')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_posts')
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    post_type = models.CharField(max_length=20, choices=[
        ('question', 'Question'),
        ('discussion', 'Discussion'),
        ('announcement', 'Announcement')
    ], default='discussion')

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.title


class Reply(TimeStampedModel):
    """Replies to forum posts"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_replies')
    content = models.TextField()
    parent_reply = models.ForeignKey('self', on_delete=models.CASCADE, related_name='child_replies', blank=True, null=True)
    is_answer = models.BooleanField(default=False, help_text="Mark as answer to question")

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Reply to {self.post.title}"


# ==================== RESOURCES ====================

class Resource(TimeStampedModel):
    """Course resources (PDFs, videos, etc.)"""
    RESOURCE_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('video', 'Video'),
        ('code', 'Code File'),
        ('image', 'Image'),
        ('other', 'Other'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES, default='other')
    file = models.FileField(upload_to='resources/', blank=True)
    external_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


# ==================== NOTES ====================

class Note(TimeStampedModel):
    """Student notes for lectures"""
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='notes')
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField()
    is_public = models.BooleanField(default=False)
    timestamp = models.PositiveIntegerField(default=0, help_text="Video timestamp in seconds")

    class Meta:
        ordering = ['-updated_at']
        unique_together = ['enrollment', 'lecture', 'timestamp']

    def __str__(self):
        return f"{self.enrollment.user.username} - {self.lecture.title}"


# ==================== Q&A (FAQ) ====================

class QandA(TimeStampedModel):
    """Course-specific frequently asked questions and answers"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='qandas')
    question = models.TextField()
    answer = models.TextField()
    order = models.PositiveIntegerField(default=1, help_text="Display order")
    is_active = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0, help_text="Number of times this Q&A was viewed")

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = "Q&A"
        verbose_name_plural = "Q&As"

    def __str__(self):
        return f"{self.course.title} - {self.question[:50]}"


# ==================== ANNOUNCEMENTS ====================

class Announcement(TimeStampedModel):
    """Course announcements"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='announcements')
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_pinned = models.BooleanField(default=False, help_text="Pin to top of announcements list")
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='announcements_created')

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


# ==================== NOTIFICATIONS ====================

class Notification(TimeStampedModel):
    """User notifications"""
    NOTIFICATION_TYPE_CHOICES = [
        ('course_update', 'Course Update'),
        ('batch_assigned', 'Batch Assigned'),
        ('assignment_due', 'Assignment Due'),
        ('certificate_ready', 'Certificate Ready'),
        ('quiz_graded', 'Quiz Graded'),
        ('assignment_graded', 'Assignment Graded'),
        ('forum_reply', 'Forum Reply'),
        ('enrollment_confirmed', 'Enrollment Confirmed'),
        ('payment_success', 'Payment Successful'),
        ('new_lecture', 'New Lecture Added'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    related_course = models.ForeignKey(Course, on_delete=models.CASCADE, blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


# ==================== CERTIFICATES ====================

class Certificate(TimeStampedModel):
    """Course completion certificates"""
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='certificate')
    certificate_number = models.CharField(max_length=50, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    pdf_file = models.FileField(upload_to='certificates/', blank=True)

    def save(self, *args, **kwargs):
        if not self.certificate_number:
            self.certificate_number = f"CERT-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.enrollment.user.username} - {self.enrollment.course.title}"


# Import timezone for Enrollment model
from django.utils import timezone

