from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from lms.models import (
    Course, CourseSection, Lecture, Category, Tag, 
    Batch, Enrollment, Review, Quiz, Assignment
)


class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create categories
        cat1, _ = Category.objects.get_or_create(name='Programming', slug='programming')
        cat2, _ = Category.objects.get_or_create(name='Web Development', slug='web-development')
        cat3, _ = Category.objects.get_or_create(name='Data Science', slug='data-science')

        # Create tags
        tag1, _ = Tag.objects.get_or_create(name='Python', slug='python')
        tag2, _ = Tag.objects.get_or_create(name='JavaScript', slug='javascript')
        tag3, _ = Tag.objects.get_or_create(name='Django', slug='django')

        # Create instructor
        instructor, _ = User.objects.get_or_create(
            username='instructor',
            defaults={
                'email': 'instructor@topskill.com',
                'first_name': 'John',
                'last_name': 'Instructor',
            }
        )
        instructor.set_password('instructor123')
        instructor.save()

        # Create courses
        course1, created = Course.objects.get_or_create(
            slug='python-for-beginners',
            defaults={
                'title': 'Python for Beginners',
                'description': 'Learn Python programming from scratch. Perfect for beginners who want to start their programming journey.',
                'short_description': 'Learn Python from scratch',
                'modality': 'online',
                'price': 49.99,
                'instructor': instructor,
                'language': 'English',
                'level': 'beginner',
                'is_active': True,
            }
        )
        if created:
            course1.categories.add(cat1)
            course1.tags.add(tag1)

        course2, created = Course.objects.get_or_create(
            slug='django-web-development',
            defaults={
                'title': 'Django Web Development',
                'description': 'Build web applications with Django. Learn to create full-stack web applications.',
                'short_description': 'Build web apps with Django',
                'modality': 'online',
                'price': 79.99,
                'instructor': instructor,
                'language': 'English',
                'level': 'intermediate',
                'is_active': True,
            }
        )
        if created:
            course2.categories.add(cat2)
            course2.tags.add(tag2, tag3)

        course3, created = Course.objects.get_or_create(
            slug='data-science-fundamentals',
            defaults={
                'title': 'Data Science Fundamentals',
                'description': 'Introduction to data science with Python. Learn pandas, numpy, and matplotlib.',
                'short_description': 'Learn data science basics',
                'modality': 'physical',
                'price': 99.99,
                'instructor': instructor,
                'max_batch_size': 25,
                'language': 'English',
                'level': 'intermediate',
                'is_active': True,
            }
        )
        if created:
            course3.categories.add(cat3)
            course3.tags.add(tag1)

        # Create sections and lectures for course1
        if course1:
            section1, _ = CourseSection.objects.get_or_create(
                course=course1,
                title='Introduction to Python',
                defaults={'order': 1}
            )
            Lecture.objects.get_or_create(
                section=section1,
                title='Welcome to Python',
                defaults={
                    'order': 1,
                    'description': 'Introduction to Python programming',
                    'youtube_video_id': 'rfscVS0vtbw',
                    'duration_minutes': 10,
                    'is_preview': True,
                }
            )
            Lecture.objects.get_or_create(
                section=section1,
                title='Installing Python',
                defaults={
                    'order': 2,
                    'description': 'How to install Python on your computer',
                    'youtube_video_id': 'YYXdXT2l-Gg',
                    'duration_minutes': 5,
                }
            )

            section2, _ = CourseSection.objects.get_or_create(
                course=course1,
                title='Python Basics',
                defaults={'order': 2}
            )
            Lecture.objects.get_or_create(
                section=section2,
                title='Variables and Data Types',
                defaults={
                    'order': 1,
                    'description': 'Learn about Python variables',
                    'youtube_video_id': 'k9T-UpCJM9w',
                    'duration_minutes': 15,
                }
            )

        # Create batch for physical course
        if course3:
            batch, _ = Batch.objects.get_or_create(
                course=course3,
                name='Batch 1',
                defaults={
                    'capacity': 25,
                    'instructor': instructor,
                }
            )

        # Create test student
        student, _ = User.objects.get_or_create(
            username='student',
            defaults={
                'email': 'student@topskill.com',
                'first_name': 'Jane',
                'last_name': 'Student',
            }
        )
        student.set_password('student123')
        student.save()

        # Create enrollment
        if course1:
            Enrollment.objects.get_or_create(
                user=student,
                course=course1,
                defaults={
                    'status': 'active',
                    'progress_percent': 25,
                }
            )

        # Create reviews
        if course1:
            Review.objects.get_or_create(
                user=student,
                course=course1,
                defaults={
                    'rating': 5,
                    'comment': 'Great course for beginners!',
                    'is_verified_purchase': True,
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
        self.stdout.write('\nCreated:')
        self.stdout.write(f'  - {Course.objects.count()} courses')
        self.stdout.write(f'  - {CourseSection.objects.count()} sections')
        self.stdout.write(f'  - {Lecture.objects.count()} lectures')
        self.stdout.write(f'  - {Category.objects.count()} categories')
        self.stdout.write(f'  - {User.objects.count()} users')
        self.stdout.write('\nTest Accounts:')
        self.stdout.write('  - Admin: admin/admin123')
        self.stdout.write('  - Instructor: instructor/instructor123')
        self.stdout.write('  - Student: student/student123')



