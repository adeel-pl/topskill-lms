from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import (
    Course, Enrollment, Lecture, CourseSection, LectureProgress,
    Quiz, QuizAttempt, Assignment, AssignmentSubmission, Note, Forum, Post, Reply, Question, QuestionOption,
    QandA, Announcement
)
from .serializers import (
    CourseSectionPlayerSerializer, LectureWithProgressSerializer,
    QuizSerializer, QuizAttemptSerializer, AssignmentSerializer,
    AssignmentSubmissionSerializer, QandASerializer, AnnouncementSerializer
)


class CoursePlayerViewSet(viewsets.ViewSet):
    """Udemy-like course player API"""
    permission_classes = [permissions.AllowAny]  # Allow preview access for non-authenticated users
    
    @action(detail=True, methods=['get'], url_path='content')
    def get_course_content(self, request, pk=None):
        """
        Get course content for player (Udemy-style)
        Returns sections with lectures, quizzes, assignments
        Allows preview access for non-enrolled users
        """
        try:
            course = Course.objects.get(id=pk, is_active=True)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check enrollment (only if user is authenticated)
        enrollment = None
        if request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(
                user=request.user,
                course=course,
                status__in=['active', 'completed']
            ).first()
        
        # Allow access if enrolled, is staff, or has preview content
        if not enrollment and not request.user.is_staff:
            # Check if course has preview content (sections or lectures with is_preview=True)
            has_preview_sections = course.sections.filter(is_preview=True).exists()
            has_preview_lectures = Lecture.objects.filter(section__course=course, is_preview=True).exists()
            if not has_preview_sections and not has_preview_lectures:
                return Response(
                    {'error': 'Not enrolled in this course'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Get sections with lectures
        sections = course.sections.all().order_by('order')
        
        # Serialize with progress context
        context = {
            'request': request,
            'enrollment': enrollment
        }
        
        sections_data = []
        for section in sections:
            # Only show preview sections if not enrolled
            if not enrollment and not section.is_preview:
                continue
            
            serializer = CourseSectionPlayerSerializer(section, context=context)
            section_data = serializer.data
            
            # For non-enrolled users, only show preview lectures
            if not enrollment:
                # Filter to only show preview lectures
                section_data['lectures'] = [
                    lecture for lecture in section_data['lectures']
                    if lecture.get('is_preview', False)
                ]
                # Only include section if it has preview lectures
                if not section_data['lectures']:
                    continue
                # Update counts
                section_data['total_lectures'] = len(section_data['lectures'])
                section_data['completed_lectures'] = 0
            
            sections_data.append(section_data)
        
        # Get quizzes with attempt information
        quizzes = Quiz.objects.filter(course=course, is_active=True).order_by('order')
        quizzes_data = []
        for quiz in quizzes:
            quiz_dict = QuizSerializer(quiz).data
            # Add attempt info if enrolled
            if enrollment:
                attempts = QuizAttempt.objects.filter(
                    enrollment=enrollment,
                    quiz=quiz
                ).order_by('-started_at')
                quiz_dict['attempts'] = [
                    {
                        'id': attempt.id,
                        'score': float(attempt.score) if attempt.score else None,
                        'passed': attempt.passed,
                        'started_at': attempt.started_at,
                        'completed_at': attempt.completed_at,
                        'attempt_number': attempt.attempt_number,
                    }
                    for attempt in attempts
                ]
                # Get best attempt
                best_attempt = attempts.filter(completed_at__isnull=False).order_by('-score').first()
                quiz_dict['best_score'] = float(best_attempt.score) if best_attempt and best_attempt.score else None
                quiz_dict['best_passed'] = best_attempt.passed if best_attempt else False
                quiz_dict['can_retake'] = quiz.max_attempts is None or attempts.count() < quiz.max_attempts
            else:
                quiz_dict['attempts'] = []
                quiz_dict['best_score'] = None
                quiz_dict['best_passed'] = False
                quiz_dict['can_retake'] = True
            quizzes_data.append(quiz_dict)
        
        # Get assignments with submission status
        assignments = Assignment.objects.filter(course=course, is_active=True).order_by('order')
        assignments_data = []
        for assignment in assignments:
            assignment_dict = AssignmentSerializer(assignment).data
            # Add submission info if enrolled
            if enrollment:
                submission = AssignmentSubmission.objects.filter(
                    enrollment=enrollment,
                    assignment=assignment
                ).first()
                if submission:
                    assignment_dict['submission'] = {
                        'id': submission.id,
                        'status': submission.status,
                        'score': float(submission.score) if submission.score else None,
                        'feedback': submission.feedback,
                        'submitted_at': submission.submitted_at,
                        'graded_at': submission.graded_at,
                        'submission_text': submission.submission_text,
                        'submission_file': submission.submission_file.url if submission.submission_file else None,
                    }
                else:
                    assignment_dict['submission'] = None
            else:
                assignment_dict['submission'] = None
            assignments_data.append(assignment_dict)
        
        # Get Q&A (FAQ)
        qandas = QandA.objects.filter(course=course, is_active=True).order_by('order', 'created_at')
        qandas_data = QandASerializer(qandas, many=True).data
        
        # Get announcements
        announcements = Announcement.objects.filter(course=course, is_active=True).order_by('-is_pinned', '-created_at')
        announcements_data = AnnouncementSerializer(announcements, many=True).data
        
        return Response({
            'course': {
                'id': course.id,
                'title': course.title,
                'description': course.description,
            },
            'sections': sections_data,
            'quizzes': quizzes_data,
            'assignments': assignments_data,
            'qandas': qandas_data,
            'announcements': announcements_data,
            'enrollment': {
                'id': enrollment.id if enrollment else None,
                'progress_percent': enrollment.progress_percent if enrollment else 0,
                'status': enrollment.status if enrollment else None,
            }
        })
    
    @action(detail=True, methods=['get'], url_path='lecture/(?P<lecture_id>[^/.]+)', permission_classes=[permissions.AllowAny])
    def get_lecture(self, request, pk=None, lecture_id=None):
        """Get specific lecture with progress - allows preview access"""
        try:
            course = Course.objects.get(id=pk, is_active=True)
            lecture = Lecture.objects.get(id=lecture_id, section__course=course)
        except (Course.DoesNotExist, Lecture.DoesNotExist):
            return Response(
                {'error': 'Lecture not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check enrollment (only if user is authenticated)
        enrollment = None
        if request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(
                user=request.user,
                course=course,
                status__in=['active', 'completed']
            ).first()
        
        # Allow access if enrolled, is preview, or is staff
        if not enrollment and not lecture.is_preview and not (request.user.is_authenticated and request.user.is_staff):
            return Response(
                {'error': 'Not enrolled in this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get progress
        progress = None
        if enrollment:
            progress = LectureProgress.objects.filter(
                enrollment=enrollment,
                lecture=lecture
            ).first()
        
        # Get notes for this lecture
        notes = []
        if enrollment:
            notes = Note.objects.filter(
                enrollment=enrollment,
                lecture=lecture
            ).order_by('timestamp')
        
        context = {
            'request': request,
            'enrollment': enrollment
        }
        
        lecture_data = LectureWithProgressSerializer(lecture, context=context).data
        lecture_data['notes'] = [
            {
                'id': note.id,
                'content': note.content,
                'timestamp': note.timestamp,
                'is_public': note.is_public,
                'lecture_title': lecture.title,
                'created_at': note.created_at,
                'updated_at': note.updated_at,
            }
            for note in notes
        ]
        
        # Get next and previous lectures
        all_lectures = list(Lecture.objects.filter(
            section__course=course
        ).order_by('section__order', 'order'))
        
        current_index = next((i for i, l in enumerate(all_lectures) if l.id == lecture.id), None)
        
        next_lecture = all_lectures[current_index + 1] if current_index is not None and current_index + 1 < len(all_lectures) else None
        prev_lecture = all_lectures[current_index - 1] if current_index is not None and current_index > 0 else None
        
        lecture_data['navigation'] = {
            'next_lecture_id': next_lecture.id if next_lecture else None,
            'prev_lecture_id': prev_lecture.id if prev_lecture else None,
        }
        
        return Response(lecture_data)
    
    @action(detail=True, methods=['post'], url_path='lecture/(?P<lecture_id>[^/.]+)/progress')
    def update_lecture_progress(self, request, pk=None, lecture_id=None):
        """Update lecture progress (watch time, position, completion)"""
        try:
            course = Course.objects.get(id=pk, is_active=True)
            lecture = Lecture.objects.get(id=lecture_id, section__course=course)
        except (Course.DoesNotExist, Lecture.DoesNotExist):
            return Response(
                {'error': 'Lecture not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        enrollment = Enrollment.objects.filter(
            user=request.user,
            course=course,
            status__in=['active', 'completed']
        ).first()
        
        if not enrollment:
            return Response(
                {'error': 'Not enrolled in this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        watch_time = request.data.get('watch_time_seconds', 0)
        position = request.data.get('last_position', 0)
        completed = request.data.get('completed', False)
        
        progress, created = LectureProgress.objects.get_or_create(
            enrollment=enrollment,
            lecture=lecture
        )
        
        progress.watch_time_seconds = max(progress.watch_time_seconds, watch_time)
        progress.last_position = position
        
        if completed and not progress.completed:
            progress.completed = True
            progress.completed_at = timezone.now()
        
        progress.save()
        
        # Update enrollment progress
        enrollment.update_progress()
        
        return Response({
            'message': 'Progress updated',
            'progress': {
                'completed': progress.completed,
                'watch_time_seconds': progress.watch_time_seconds,
                'last_position': progress.last_position,
            }
        })
    
    @action(detail=True, methods=['post'], url_path='lecture/(?P<lecture_id>[^/.]+)/complete')
    def mark_lecture_complete(self, request, pk=None, lecture_id=None):
        """Mark lecture as complete (manual completion)"""
        try:
            course = Course.objects.get(id=pk, is_active=True)
            lecture = Lecture.objects.get(id=lecture_id, section__course=course)
        except (Course.DoesNotExist, Lecture.DoesNotExist):
            return Response(
                {'error': 'Lecture not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        enrollment = Enrollment.objects.filter(
            user=request.user,
            course=course,
            status__in=['active', 'completed']
        ).first()
        
        if not enrollment:
            return Response(
                {'error': 'Not enrolled in this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        progress, created = LectureProgress.objects.get_or_create(
            enrollment=enrollment,
            lecture=lecture
        )
        
        if not progress.completed:
            progress.completed = True
            progress.completed_at = timezone.now()
            progress.save()
            
            # Update enrollment progress
            enrollment.update_progress()
        
        return Response({
            'message': 'Lecture marked as complete',
            'progress': {
                'completed': progress.completed,
                'progress_percent': enrollment.progress_percent,
            }
        })
    
    @action(detail=True, methods=['post'], url_path='lecture/(?P<lecture_id>[^/.]+)/note')
    def add_note(self, request, pk=None, lecture_id=None):
        """Add note to lecture"""
        try:
            course = Course.objects.get(id=pk, is_active=True)
            lecture = Lecture.objects.get(id=lecture_id, section__course=course)
        except (Course.DoesNotExist, Lecture.DoesNotExist):
            return Response(
                {'error': 'Lecture not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        enrollment = Enrollment.objects.filter(
            user=request.user,
            course=course,
            status__in=['active', 'completed']
        ).first()
        
        if not enrollment:
            return Response(
                {'error': 'Not enrolled in this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        content = request.data.get('content')
        timestamp = request.data.get('timestamp', 0)
        is_public = request.data.get('is_public', False)
        
        if not content:
            return Response(
                {'error': 'Note content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Allow multiple notes at same timestamp - unique constraint removed
        try:
            note = Note.objects.create(
                enrollment=enrollment,
                lecture=lecture,
                content=content,
                timestamp=timestamp,
                is_public=is_public
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to create note: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'id': note.id,
            'content': note.content,
            'timestamp': note.timestamp,
            'is_public': note.is_public,
            'created_at': note.created_at,
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='forum')
    def get_forum(self, request, pk=None):
        """Get course forum with posts"""
        try:
            course = Course.objects.get(id=pk, is_active=True)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        forum, created = Forum.objects.get_or_create(course=course)
        
        # Get posts
        posts = Post.objects.filter(forum=forum).order_by('-is_pinned', '-created_at')[:50]
        
        posts_data = []
        for post in posts:
            replies_count = post.replies.count()
            posts_data.append({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'user': {
                    'id': post.user.id,
                    'username': post.user.username,
                    'name': post.user.get_full_name() or post.user.username,
                },
                'is_pinned': post.is_pinned,
                'is_locked': post.is_locked,
                'post_type': post.post_type,
                'replies_count': replies_count,
                'created_at': post.created_at,
            })
        
        return Response({
            'forum_id': forum.id,
            'posts': posts_data
        })
    
    @action(detail=True, methods=['get'], url_path='overview', permission_classes=[permissions.AllowAny])
    def get_overview(self, request, pk=None):
        """Get course overview (like Udemy course page) - Public access"""
        try:
            course = Course.objects.get(id=pk, is_active=True)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        enrollment = None
        if request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(
                user=request.user,
                course=course
            ).first()
        
        # Get course stats - DYNAMIC from actual content
        total_lectures = Lecture.objects.filter(section__course=course).count()
        total_duration = sum(
            Lecture.objects.filter(section__course=course).values_list('duration_minutes', flat=True) or [0]
        )
        total_sections = course.sections.count()
        # Get quizzes and assignments (they have course FK)
        total_quizzes = course.quizzes.filter(is_active=True).count()
        total_assignments = course.assignments.filter(is_active=True).count()
        
        # Get course content preview (sections with lectures) - visible to all
        sections_preview = []
        sections = course.sections.all().order_by('order')
        for section in sections:
            lectures = section.lectures.all().order_by('order')
            # Show all sections and lectures in preview, but mark which are preview
            section_lectures = []
            for lecture in lectures:
                section_lectures.append({
                    'id': lecture.id,
                    'title': lecture.title,
                    'duration_minutes': lecture.duration_minutes,
                    'is_preview': lecture.is_preview,
                    'order': lecture.order,
                })
            
            sections_preview.append({
                'id': section.id,
                'title': section.title,
                'order': section.order,
                'is_preview': section.is_preview,
                'lectures': section_lectures,
                'total_lectures': len(section_lectures),
            })
        
        # Generate learning objectives based on course features
        learning_objectives = []
        if total_sections > 0:
            learning_objectives.append('Complete course content')
        if total_quizzes > 0 or total_assignments > 0:
            learning_objectives.append('Quizzes and assignments')
        learning_objectives.append('Certificate of completion')
        learning_objectives.append('Lifetime access')
        
        return Response({
            'course': {
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'short_description': course.short_description,
                'instructor': {
                    'id': course.instructor.id if course.instructor else None,
                    'name': course.instructor.get_full_name() if course.instructor else None,
                },
                'rating': float(course.rating),
                'num_reviews': course.num_reviews,
                'total_students': course.total_students,
                'language': course.language,
                'level': course.level,
                'price': float(course.price),
                'thumbnail': course.thumbnail,
            },
            'stats': {
                'total_lectures': total_lectures,
                'total_duration_hours': round(total_duration / 60, 2) if total_duration > 0 else 0,
                'total_sections': total_sections,
                'total_quizzes': total_quizzes,
                'total_assignments': total_assignments,
            },
            'content_preview': sections_preview,  # Course content visible to all
            'learning_objectives': learning_objectives,
            'enrollment': {
                'enrolled': enrollment is not None,
                'status': enrollment.status if enrollment else None,
                'progress_percent': enrollment.progress_percent if enrollment else 0,
            }
        })

