from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    Course, Batch, Enrollment, Payment, Attendance, BatchSession, SessionRegistration,
    Lecture, CourseSection, Quiz, QuizAttempt, Assignment, AssignmentSubmission,
    Review, Wishlist, Category, Tag, Notification, Certificate, LectureProgress,
    Forum, Post, Reply, Resource, Note, Prerequisite, Question, QuestionOption,
    Cart, CartItem, QandA, Announcement
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


class LectureInline(admin.TabularInline):
    """Inline editor for lectures within sections"""
    model = Lecture
    extra = 2
    fields = ('title', 'order', 'youtube_video_id', 'duration_minutes', 'is_preview')
    verbose_name = 'Lecture'
    verbose_name_plural = 'Lectures'
    classes = ('collapse',)


class CourseSectionInline(admin.StackedInline):
    """Inline editor for sections within courses"""
    model = CourseSection
    extra = 1
    fields = ('title', 'order', 'is_preview')
    verbose_name = 'Section'
    verbose_name_plural = 'Course Sections'
    show_change_link = True


class QandAInline(admin.TabularInline):
    """Inline editor for Q&A within courses"""
    model = QandA
    extra = 2
    fields = ('question', 'answer', 'order', 'is_active')
    verbose_name = 'Q&A'
    verbose_name_plural = 'Q&As'


class AnnouncementInline(admin.TabularInline):
    """Inline editor for announcements within courses"""
    model = Announcement
    extra = 1
    fields = ('title', 'content', 'is_pinned', 'is_active')
    verbose_name = 'Announcement'
    verbose_name_plural = 'Announcements'


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'modality', 'price', 'instructor', 'total_duration_display', 'total_lectures_display', 'is_active', 'created_at']
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ['title', 'description']
    list_filter = ['modality', 'is_active', 'level', 'created_at']
    filter_horizontal = ['categories', 'tags']
    readonly_fields = ['total_duration_hours', 'total_lectures', 'total_students', 'rating', 'num_reviews', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'short_description', 'thumbnail'),
            'description': 'Enter course title and description. The slug will be auto-generated from the title.'
        }),
        ('Course Details', {
            'fields': ('instructor', 'modality', 'price', 'max_batch_size', 'language', 'level', 'is_active'),
            'description': 'Set course instructor, price, and other details. Select modality (online/physical/hybrid).'
        }),
        ('Course Content', {
            'description': '''
            <strong>How to add course content (Udemy-style):</strong><br>
            1. Scroll down to "Course Sections" section below<br>
            2. Click "Add another Course Section" to add a new section<br>
            3. Enter section title and order<br>
            4. Click "Save and continue editing" to add lectures to the section<br>
            5. Go to "Course Sections" in the admin menu to add lectures to each section<br>
            <strong>Tip:</strong> You can also add sections and lectures directly from the Course Sections admin page.
            ''',
            'fields': (),
        }),
        ('Statistics (Auto-calculated)', {
            'fields': ('total_duration_hours', 'total_lectures', 'total_students', 'rating', 'num_reviews'),
            'classes': ('collapse',),
            'description': 'These statistics are automatically calculated from your course content. Total duration is calculated from all lecture durations.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [CourseSectionInline, QandAInline, AnnouncementInline]
    
    def total_duration_display(self, obj):
        """Display total duration in hours"""
        total_minutes = sum(
            Lecture.objects.filter(section__course=obj).values_list('duration_minutes', flat=True) or [0]
        )
        hours = total_minutes // 60
        minutes = total_minutes % 60
        if hours > 0:
            return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
        return f"{minutes}m"
    total_duration_display.short_description = 'Total Duration'
    
    def total_lectures_display(self, obj):
        """Display total number of lectures"""
        count = Lecture.objects.filter(section__course=obj).count()
        return count
    total_lectures_display.short_description = 'Lectures'
    
    def save_model(self, request, obj, form, change):
        """Update course stats when saving"""
        super().save_model(request, obj, form, change)
        # Recalculate stats
        from .models import Lecture
        total_lectures = Lecture.objects.filter(section__course=obj).count()
        total_duration = sum(
            Lecture.objects.filter(section__course=obj).values_list('duration_minutes', flat=True) or [0]
        )
        obj.total_lectures = total_lectures
        obj.total_duration_hours = round(total_duration / 60, 2) if total_duration > 0 else 0
        obj.save()


@admin.register(CourseSection)
class CourseSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'course_link', 'order', 'lecture_count', 'total_duration', 'is_preview']
    list_filter = ['course', 'is_preview']
    ordering = ['course', 'order']
    search_fields = ['title', 'course__title']
    inlines = [LectureInline]
    
    fieldsets = (
        ('Section Information', {
            'fields': ('course', 'title', 'order', 'is_preview'),
            'description': 'Create a section for your course. Then add lectures below.'
        }),
    )
    
    def course_link(self, obj):
        """Link to course admin"""
        url = reverse('admin:lms_course_change', args=[obj.course.id])
        return format_html('<a href="{}">{}</a>', url, obj.course.title)
    course_link.short_description = 'Course'
    
    def lecture_count(self, obj):
        """Display number of lectures in section"""
        count = obj.lectures.count()
        return format_html('<strong>{}</strong>', count)
    lecture_count.short_description = 'Lectures'
    
    def total_duration(self, obj):
        """Display total duration of section"""
        total_minutes = sum(obj.lectures.values_list('duration_minutes', flat=True) or [0])
        hours = total_minutes // 60
        minutes = total_minutes % 60
        if hours > 0:
            duration_str = f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
        else:
            duration_str = f"{minutes}m"
        return format_html('<strong>{}</strong>', duration_str)
    total_duration.short_description = 'Duration'
    
    def save_model(self, request, obj, form, change):
        """Update course stats when section is saved"""
        super().save_model(request, obj, form, change)
        # Update parent course stats
        self._update_course_stats(obj.course)
    
    def save_formset(self, request, form, formset, change):
        """Update course stats when lectures are saved"""
        instances = formset.save(commit=False)
        for instance in instances:
            instance.save()
        for obj in formset.deleted_objects:
            obj.delete()
        formset.save_m2m()
        if instances:
            self._update_course_stats(instances[0].section.course)
    
    def _update_course_stats(self, course):
        """Helper method to update course statistics"""
        from .models import Lecture
        total_lectures = Lecture.objects.filter(section__course=course).count()
        total_duration = sum(
            Lecture.objects.filter(section__course=course).values_list('duration_minutes', flat=True) or [0]
        )
        course.total_lectures = total_lectures
        course.total_duration_hours = round(total_duration / 60, 2) if total_duration > 0 else 0
        course.save()


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ['title', 'section_link', 'order', 'video_display', 'duration_display', 'is_preview']
    list_filter = ['is_preview', 'section__course', 'video_type']
    ordering = ['section__course', 'section__order', 'order']
    search_fields = ['title', 'description', 'section__title', 'section__course__title']
    
    fieldsets = (
        ('Lecture Information', {
            'fields': ('section', 'title', 'description', 'order', 'is_preview'),
            'description': 'Enter the lecture title and description. Set "Is preview" to allow non-enrolled users to view this lecture.'
        }),
        ('Video Content', {
            'fields': ('video_type', 'youtube_video_id', 'content_url', 'duration_minutes'),
            'description': '''
            <strong>How to add a video:</strong><br>
            1. <strong>YouTube Video:</strong> Set video_type to "YouTube" and enter the YouTube Video ID (e.g., "dQw4w9WgXcQ")<br>
            2. <strong>Direct URL:</strong> Set video_type to "Direct URL" and enter the full video URL<br>
            3. <strong>Duration:</strong> Enter duration in minutes (e.g., 25 for 25 minutes, 90 for 1 hour 30 minutes)<br>
            <strong>Note:</strong> Total course duration is automatically calculated from all lecture durations.
            '''
        }),
    )
    
    def section_link(self, obj):
        """Link to section admin"""
        url = reverse('admin:lms_coursesection_change', args=[obj.section.id])
        return format_html('<a href="{}">{}</a>', url, obj.section.title)
    section_link.short_description = 'Section'
    
    def video_display(self, obj):
        """Display video information"""
        if obj.youtube_video_id:
            url = f"https://www.youtube.com/watch?v={obj.youtube_video_id}"
            return format_html('<a href="{}" target="_blank">YouTube: {}</a>', url, obj.youtube_video_id[:20])
        elif obj.content_url:
            return format_html('<a href="{}" target="_blank">Direct URL</a>', obj.content_url)
        return "No video"
    video_display.short_description = 'Video'
    
    def duration_display(self, obj):
        """Display duration in readable format"""
        if obj.duration_minutes:
            hours = obj.duration_minutes // 60
            minutes = obj.duration_minutes % 60
            if hours > 0:
                return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
            return f"{minutes}m"
        return "-"
    duration_display.short_description = 'Duration'
    
    def save_model(self, request, obj, form, change):
        """Update course stats when lecture is saved"""
        super().save_model(request, obj, form, change)
        # Update parent course stats
        self._update_course_stats(obj.section.course)
    
    def _update_course_stats(self, course):
        """Helper method to update course statistics"""
        from .models import Lecture
        total_lectures = Lecture.objects.filter(section__course=course).count()
        total_duration = sum(
            Lecture.objects.filter(section__course=course).values_list('duration_minutes', flat=True) or [0]
        )
        course.total_lectures = total_lectures
        course.total_duration_hours = round(total_duration / 60, 2) if total_duration > 0 else 0
        course.save()


class SessionRegistrationInline(admin.TabularInline):
    """Inline editor for session registrations"""
    model = SessionRegistration
    extra = 0
    fields = ('enrollment', 'status', 'registered_at')
    readonly_fields = ('registered_at',)
    verbose_name = 'Registration'
    verbose_name_plural = 'Registrations'


class BatchSessionInline(admin.TabularInline):
    """Inline editor for sessions within batches"""
    model = BatchSession
    extra = 1
    fields = ('title', 'session_number', 'start_datetime', 'end_datetime', 'location', 'is_active')
    verbose_name = 'Session'
    verbose_name_plural = 'Sessions'
    classes = ('collapse',)


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['name', 'course', 'instructor', 'capacity', 'enrolled_count', 'available_slots', 'start_date', 'end_date', 'is_active']
    list_filter = ['course', 'instructor', 'start_date', 'is_active']
    search_fields = ['name', 'course__title']
    readonly_fields = ['enrolled_count', 'available_slots', 'created_at', 'updated_at']
    inlines = [BatchSessionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('course', 'name', 'instructor', 'capacity', 'is_active'),
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date'),
            'description': 'Set the overall batch start and end dates. Individual sessions can be scheduled separately.'
        }),
        ('Statistics', {
            'fields': ('enrolled_count', 'available_slots'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def enrolled_count(self, obj):
        """Display enrolled student count"""
        return obj.get_enrolled_count()
    enrolled_count.short_description = 'Enrolled Students'
    
    def available_slots(self, obj):
        """Display available slots"""
        return obj.get_available_slots()
    available_slots.short_description = 'Available Slots'
    
    actions = ['auto_schedule_sessions_today', 'auto_schedule_sessions_tomorrow']
    
    def auto_schedule_sessions_today(self, request, queryset):
        """Action to auto-schedule sessions for today"""
        from django.utils import timezone
        from datetime import date
        
        for batch in queryset:
            sessions = batch.auto_schedule_sessions(session_date=date.today())
            self.message_user(request, f"Created {len(sessions)} sessions for {batch.name} today.")
    auto_schedule_sessions_today.short_description = "Auto-schedule sessions for today"
    
    def auto_schedule_sessions_tomorrow(self, request, queryset):
        """Action to auto-schedule sessions for tomorrow"""
        from django.utils import timezone
        from datetime import date, timedelta
        
        for batch in queryset:
            sessions = batch.auto_schedule_sessions(session_date=date.today() + timedelta(days=1))
            self.message_user(request, f"Created {len(sessions)} sessions for {batch.name} tomorrow.")
    auto_schedule_sessions_tomorrow.short_description = "Auto-schedule sessions for tomorrow"


@admin.register(BatchSession)
class BatchSessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'batch', 'session_number', 'start_datetime', 'end_datetime', 'registered_count', 'location', 'is_active']
    list_filter = ['batch', 'start_datetime', 'is_active']
    date_hierarchy = 'start_datetime'
    search_fields = ['title', 'batch__name', 'batch__course__title']
    readonly_fields = ['registered_count', 'created_at', 'updated_at']
    inlines = [SessionRegistrationInline]
    
    fieldsets = (
        ('Session Information', {
            'fields': ('batch', 'title', 'session_number', 'is_active'),
        }),
        ('Schedule', {
            'fields': ('start_datetime', 'end_datetime', 'location'),
        }),
        ('Description', {
            'fields': ('description',),
            'classes': ('collapse',),
        }),
        ('Statistics', {
            'fields': ('registered_count',),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def registered_count(self, obj):
        """Display registered student count"""
        return obj.get_registered_count()
    registered_count.short_description = 'Registered Students'


@admin.register(SessionRegistration)
class SessionRegistrationAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'session', 'status', 'registered_at']
    list_filter = ['status', 'session__batch', 'registered_at']
    search_fields = ['enrollment__user__username', 'session__title', 'session__batch__name']
    readonly_fields = ['registered_at', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Registration Information', {
            'fields': ('enrollment', 'session', 'status'),
        }),
        ('Timestamps', {
            'fields': ('registered_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


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
    list_display = ['enrollment', 'session', 'present', 'checked_in_at', 'created_at']
    list_filter = ['present', 'session__batch', 'created_at']
    search_fields = ['enrollment__user__username', 'session__title']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Attendance Information', {
            'fields': ('enrollment', 'session', 'present', 'checked_in_at', 'note'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_present', 'mark_absent']
    
    def mark_present(self, request, queryset):
        """Action to mark selected attendance as present"""
        from django.utils import timezone
        updated = queryset.update(present=True, checked_in_at=timezone.now())
        self.message_user(request, f"Marked {updated} attendance records as present.")
    mark_present.short_description = "Mark as present"
    
    def mark_absent(self, request, queryset):
        """Action to mark selected attendance as absent"""
        updated = queryset.update(present=False)
        self.message_user(request, f"Marked {updated} attendance records as absent.")
    mark_absent.short_description = "Mark as absent"


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


@admin.register(QandA)
class QandAAdmin(admin.ModelAdmin):
    list_display = ['course', 'question_preview', 'order', 'is_active', 'views_count', 'created_at']
    list_filter = ['course', 'is_active', 'created_at']
    search_fields = ['question', 'answer', 'course__title']
    list_editable = ['order', 'is_active']
    fieldsets = (
        ('Course Information', {
            'fields': ('course',)
        }),
        ('Q&A Content', {
            'fields': ('question', 'answer', 'order', 'is_active')
        }),
        ('Statistics', {
            'fields': ('views_count',),
            'classes': ('collapse',)
        }),
    )
    
    def question_preview(self, obj):
        return obj.question[:80] + '...' if len(obj.question) > 80 else obj.question
    question_preview.short_description = 'Question'


class QandAInline(admin.TabularInline):
    """Inline editor for Q&A within courses"""
    model = QandA
    extra = 2
    fields = ('question', 'answer', 'order', 'is_active')
    verbose_name = 'Q&A'
    verbose_name_plural = 'Q&As'


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['course', 'title', 'is_pinned', 'is_active', 'created_by', 'created_at']
    list_filter = ['course', 'is_pinned', 'is_active', 'created_at']
    search_fields = ['title', 'content', 'course__title']
    list_editable = ['is_pinned', 'is_active']
    fieldsets = (
        ('Course Information', {
            'fields': ('course', 'created_by')
        }),
        ('Announcement Content', {
            'fields': ('title', 'content', 'is_pinned', 'is_active')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class AnnouncementInline(admin.TabularInline):
    """Inline editor for announcements within courses"""
    model = Announcement
    extra = 1
    fields = ('title', 'content', 'is_pinned', 'is_active')
    verbose_name = 'Announcement'
    verbose_name_plural = 'Announcements'

