from django.contrib import admin
from .models import (
    Course, Batch, Enrollment, Payment, Attendance, BatchSession,
    Lecture, CourseSection, Quiz, QuizAttempt, Assignment, AssignmentSubmission,
    Review, Wishlist, Category, Tag, Notification, Certificate, LectureProgress,
    Forum, Post, Reply, Resource, Note, Prerequisite, Question, QuestionOption,
    Cart, CartItem
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'modality', 'price', 'max_batch_size', 'instructor', 'is_active', 'created_at']
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ['title', 'description']
    list_filter = ['modality', 'is_active', 'created_at']
    filter_horizontal = ['categories', 'tags']


@admin.register(CourseSection)
class CourseSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    ordering = ['course', 'order']


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ['title', 'section', 'order', 'duration_minutes', 'is_preview']
    list_filter = ['is_preview', 'section__course']
    ordering = ['section', 'order']


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['name', 'course', 'instructor', 'capacity', 'start_date', 'end_date']
    list_filter = ['course', 'instructor', 'start_date']
    search_fields = ['name', 'course__title']


@admin.register(BatchSession)
class BatchSessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'batch', 'start_datetime', 'end_datetime', 'location']
    list_filter = ['batch', 'start_datetime']
    date_hierarchy = 'start_datetime'


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'batch', 'status', 'progress_percent', 'created_at']
    list_filter = ['status', 'course', 'created_at']
    search_fields = ['user__username', 'course__title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'amount', 'status', 'payfast_payment_id', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'course__title', 'payfast_payment_id']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'session', 'present', 'created_at']
    list_filter = ['present', 'session__batch', 'created_at']
    search_fields = ['enrollment__user__username', 'session__title']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['user__username', 'course__title']


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'course__title']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'passing_score', 'is_active', 'order']
    list_filter = ['is_active', 'course']
    ordering = ['course', 'order']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'quiz', 'score', 'passed', 'started_at']
    list_filter = ['passed', 'started_at']
    readonly_fields = ['started_at', 'completed_at']


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'due_date', 'max_score', 'is_active', 'order']
    list_filter = ['is_active', 'course', 'due_date']
    ordering = ['course', 'order']


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'assignment', 'status', 'score', 'submitted_at']
    list_filter = ['status', 'submitted_at']
    readonly_fields = ['submitted_at', 'graded_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title']


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'certificate_number', 'issued_at']
    search_fields = ['certificate_number', 'enrollment__user__username']
    readonly_fields = ['certificate_number', 'issued_at']


@admin.register(LectureProgress)
class LectureProgressAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'lecture', 'completed', 'watch_time_seconds']
    list_filter = ['completed']


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'resource_type', 'is_active', 'order']
    list_filter = ['resource_type', 'is_active', 'course']
    ordering = ['course', 'order']


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'lecture', 'is_public', 'timestamp', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['enrollment__user__username', 'lecture__title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Forum)
class ForumAdmin(admin.ModelAdmin):
    list_display = ['course', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['course__title']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'forum', 'user', 'post_type', 'is_pinned', 'is_locked', 'created_at']
    list_filter = ['post_type', 'is_pinned', 'is_locked', 'created_at']
    search_fields = ['title', 'content', 'user__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ['post', 'user', 'is_answer', 'created_at']
    list_filter = ['is_answer', 'created_at']
    search_fields = ['content', 'user__username', 'post__title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Prerequisite)
class PrerequisiteAdmin(admin.ModelAdmin):
    list_display = ['course', 'required_course', 'created_at']
    list_filter = ['created_at']
    search_fields = ['course__title', 'required_course__title']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'question_text', 'question_type', 'points', 'order']
    list_filter = ['question_type', 'quiz']
    ordering = ['quiz', 'order']
    search_fields = ['question_text']


@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    list_display = ['question', 'option_text', 'is_correct', 'order']
    list_filter = ['is_correct', 'question__quiz']
    ordering = ['question', 'order']
    search_fields = ['option_text']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'updated_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'course', 'created_at']
    list_filter = ['created_at']
    search_fields = ['cart__user__username', 'course__title']

