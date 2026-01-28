"""
Management command to ensure portal has sufficient data
Assigns instructors to courses that don't have one
Creates additional data if needed for portal display
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from lms.models import (
    Course, Enrollment, Assignment, AssignmentSubmission, Quiz, QuizAttempt,
    Batch, BatchSession, Attendance
)
import random


class Command(BaseCommand):
    help = 'Ensure portal has sufficient data - assigns instructors to courses and creates sample data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n🔧 Ensuring Portal Data...\n'))
        
        # Get or create instructor
        instructor, created = User.objects.get_or_create(
            username='instructor',
            defaults={
                'email': 'instructor@topskill.com',
                'first_name': 'John',
                'last_name': 'Instructor',
            }
        )
        if created:
            instructor.set_password('instructor123')
            instructor.save()
            self.stdout.write(self.style.SUCCESS('✅ Created instructor user'))
        else:
            self.stdout.write(self.style.SUCCESS('✅ Instructor user already exists'))
        
        # Assign instructor to courses that don't have one
        courses_without_instructor = Course.objects.filter(instructor__isnull=True)
        count = courses_without_instructor.count()
        if count > 0:
            courses_without_instructor.update(instructor=instructor)
            self.stdout.write(self.style.SUCCESS(f'✅ Assigned instructor to {count} courses'))
        else:
            self.stdout.write(self.style.SUCCESS('✅ All courses already have instructors'))
        
        # Get instructor's courses
        instructor_courses = Course.objects.filter(instructor=instructor)
        self.stdout.write(self.style.SUCCESS(f'✅ Instructor has {instructor_courses.count()} courses'))
        
        # Ensure each course has at least some enrollments
        for course in instructor_courses:
            enrollments_count = Enrollment.objects.filter(course=course).count()
            if enrollments_count == 0:
                # Create a few sample enrollments
                students = User.objects.filter(is_staff=False).exclude(username='instructor')[:3]
                for student in students:
                    Enrollment.objects.get_or_create(
                        user=student,
                        course=course,
                        defaults={
                            'status': 'active',
                            'progress_percent': random.randint(0, 100),
                        }
                    )
                self.stdout.write(self.style.SUCCESS(f'   ✅ Created enrollments for {course.title}'))
        
        # Ensure courses have assignments
        for course in instructor_courses:
            assignments_count = Assignment.objects.filter(course=course).count()
            if assignments_count == 0:
                # Create a sample assignment
                Assignment.objects.get_or_create(
                    course=course,
                    title=f'{course.title} - Final Project',
                    defaults={
                        'description': 'Complete the final project for this course.',
                        'due_date': timezone.now() + timedelta(days=30),
                        'max_score': 100,
                        'is_active': True,
                        'order': 1,
                    }
                )
                self.stdout.write(self.style.SUCCESS(f'   ✅ Created assignment for {course.title}'))
        
        # Ensure courses have quizzes
        for course in instructor_courses:
            quizzes_count = Quiz.objects.filter(course=course).count()
            if quizzes_count == 0:
                # Create a sample quiz
                Quiz.objects.get_or_create(
                    course=course,
                    title=f'{course.title} - Assessment Quiz',
                    defaults={
                        'description': 'Test your knowledge with this quiz.',
                        'passing_score': 70,
                        'is_active': True,
                        'order': 1,
                    }
                )
                self.stdout.write(self.style.SUCCESS(f'   ✅ Created quiz for {course.title}'))
        
        # Create some pending assignment submissions for grading
        assignments = Assignment.objects.filter(course__instructor=instructor)
        for assignment in assignments:
            pending_count = AssignmentSubmission.objects.filter(
                assignment=assignment,
                status='submitted'
            ).count()
            
            if pending_count == 0:
                # Create some pending submissions
                enrollments = Enrollment.objects.filter(
                    course=assignment.course,
                    status='active'
                )[:3]
                
                for enrollment in enrollments:
                    AssignmentSubmission.objects.get_or_create(
                        enrollment=enrollment,
                        assignment=assignment,
                        defaults={
                            'status': 'submitted',
                            'submitted_at': timezone.now() - timedelta(days=random.randint(1, 7)),
                        }
                    )
                self.stdout.write(self.style.SUCCESS(f'   ✅ Created pending submissions for {assignment.title}'))
        
        # Ensure physical/hybrid courses have batches and sessions
        physical_hybrid_courses = instructor_courses.filter(modality__in=['physical', 'hybrid'])
        for course in physical_hybrid_courses:
            batches_count = Batch.objects.filter(course=course).count()
            if batches_count == 0:
                # Create a batch
                batch = Batch.objects.create(
                    course=course,
                    name=f'{course.title} - Batch 1',
                    batch_type=course.modality,
                    instructor=instructor,
                    capacity=25,
                    start_date=timezone.now().date(),
                    end_date=(timezone.now() + timedelta(days=90)).date(),
                    is_active=True,
                )
                self.stdout.write(self.style.SUCCESS(f'   ✅ Created batch for {course.title}'))
                
                # Create some sessions
                for i in range(1, 6):
                    BatchSession.objects.get_or_create(
                        batch=batch,
                        session_number=i,
                        defaults={
                            'title': f'Session {i}',
                            'start_datetime': timezone.now() + timedelta(days=i*7),
                            'end_datetime': timezone.now() + timedelta(days=i*7) + timedelta(hours=2),
                            'is_active': True,
                        }
                    )
                self.stdout.write(self.style.SUCCESS(f'   ✅ Created sessions for {course.title}'))
        
        # Summary
        self.stdout.write(self.style.SUCCESS('\n📊 Portal Data Summary:'))
        self.stdout.write(f'   • Instructor: {instructor.get_full_name() or instructor.username}')
        self.stdout.write(f'   • Courses: {instructor_courses.count()}')
        
        total_enrollments = Enrollment.objects.filter(course__instructor=instructor).count()
        self.stdout.write(f'   • Total Enrollments: {total_enrollments}')
        
        total_assignments = Assignment.objects.filter(course__instructor=instructor).count()
        self.stdout.write(f'   • Total Assignments: {total_assignments}')
        
        pending_submissions = AssignmentSubmission.objects.filter(
            assignment__course__instructor=instructor,
            status='submitted'
        ).count()
        self.stdout.write(f'   • Pending Submissions: {pending_submissions}')
        
        total_quizzes = Quiz.objects.filter(course__instructor=instructor).count()
        self.stdout.write(f'   • Total Quizzes: {total_quizzes}')
        
        self.stdout.write(self.style.SUCCESS('\n✅ Portal data ready!'))
        self.stdout.write(self.style.SUCCESS('\n🔗 Access portals:'))
        self.stdout.write(self.style.SUCCESS('   • Instructor: http://localhost:8000/portal/instructor/'))
        self.stdout.write(self.style.SUCCESS('   • Admin: http://localhost:8000/portal/admin-portal/'))
        self.stdout.write(self.style.SUCCESS('   • Login: http://localhost:8000/portal/login/'))

