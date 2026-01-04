from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from lms.models import (
    Course, CourseSection, Lecture, Category, Tag, 
    Batch, Enrollment, Review, Quiz, Assignment, Question, QuestionOption,
    QuizAttempt, AssignmentSubmission, Wishlist, Notification, Certificate,
    Forum, Post, Reply, Resource, Note, Prerequisite
)
from .video_ids import get_video_id_for_course
import random


# Course-specific lecture content
COURSE_LECTURE_CONTENT = {
    'python': {
        'sections': [
            {
                'title': 'Introduction to Python',
                'lectures': [
                    {'title': 'What is Python?', 'duration': 12, 'description': 'Introduction to Python programming language and its applications.'},
                    {'title': 'Installing Python and Setting Up Environment', 'duration': 15, 'description': 'Step-by-step guide to install Python and set up your development environment.'},
                    {'title': 'Your First Python Program', 'duration': 18, 'description': 'Write and run your first Python program. Learn about Python syntax basics.'},
                ]
            },
            {
                'title': 'Python Fundamentals',
                'lectures': [
                    {'title': 'Variables and Data Types', 'duration': 20, 'description': 'Learn about Python variables, strings, numbers, and basic data types.'},
                    {'title': 'Working with Strings', 'duration': 25, 'description': 'String manipulation, formatting, and common string operations.'},
                    {'title': 'Numbers and Math Operations', 'duration': 18, 'description': 'Working with integers, floats, and mathematical operations in Python.'},
                    {'title': 'Lists and Tuples', 'duration': 22, 'description': 'Understanding Python lists and tuples, indexing, and common operations.'},
                ]
            },
            {
                'title': 'Control Flow and Functions',
                'lectures': [
                    {'title': 'Conditional Statements (if/else)', 'duration': 20, 'description': 'Learn to make decisions in your code with if, elif, and else statements.'},
                    {'title': 'Loops: for and while', 'duration': 25, 'description': 'Master loops to repeat code blocks efficiently.'},
                    {'title': 'Functions and Parameters', 'duration': 28, 'description': 'Create reusable code with functions, parameters, and return values.'},
                ]
            },
        ]
    },
    'postgresql': {
        'sections': [
            {
                'title': 'PostgreSQL Basics',
                'lectures': [
                    {'title': 'Introduction to PostgreSQL', 'duration': 15, 'description': 'Overview of PostgreSQL database system and its features.'},
                    {'title': 'Installing PostgreSQL', 'duration': 18, 'description': 'Install PostgreSQL on Windows, Mac, and Linux systems.'},
                    {'title': 'Creating Your First Database', 'duration': 20, 'description': 'Learn to create databases and connect to them using psql.'},
                ]
            },
            {
                'title': 'SQL Fundamentals',
                'lectures': [
                    {'title': 'Creating Tables and Data Types', 'duration': 25, 'description': 'Learn to create tables with proper data types and constraints.'},
                    {'title': 'INSERT, UPDATE, and DELETE Operations', 'duration': 22, 'description': 'Master data manipulation with INSERT, UPDATE, and DELETE statements.'},
                    {'title': 'SELECT Queries and Filtering', 'duration': 28, 'description': 'Query data with SELECT statements, WHERE clauses, and filtering.'},
                    {'title': 'Joins: INNER, LEFT, RIGHT, FULL', 'duration': 30, 'description': 'Combine data from multiple tables using different join types.'},
                ]
            },
            {
                'title': 'Advanced PostgreSQL',
                'lectures': [
                    {'title': 'Indexes and Performance Optimization', 'duration': 25, 'description': 'Create indexes to improve query performance.'},
                    {'title': 'Stored Procedures and Functions', 'duration': 28, 'description': 'Write stored procedures and functions in PostgreSQL.'},
                    {'title': 'Transactions and ACID Properties', 'duration': 22, 'description': 'Understand database transactions and maintain data integrity.'},
                ]
            },
        ]
    },
    'git': {
        'sections': [
            {
                'title': 'Git Fundamentals',
                'lectures': [
                    {'title': 'What is Version Control?', 'duration': 12, 'description': 'Introduction to version control systems and why Git is essential.'},
                    {'title': 'Installing Git', 'duration': 10, 'description': 'Install Git on different operating systems and verify installation.'},
                    {'title': 'Your First Git Repository', 'duration': 18, 'description': 'Initialize a repository and make your first commit.'},
                ]
            },
            {
                'title': 'Git Commands and Workflow',
                'lectures': [
                    {'title': 'Basic Git Commands: add, commit, status', 'duration': 20, 'description': 'Learn essential Git commands for daily workflow.'},
                    {'title': 'Understanding Git Branches', 'duration': 22, 'description': 'Create, switch, and merge branches in Git.'},
                    {'title': 'Working with Remote Repositories', 'duration': 25, 'description': 'Connect local repositories to GitHub and push/pull changes.'},
                    {'title': 'Merge Conflicts and Resolution', 'duration': 20, 'description': 'Handle merge conflicts and resolve them effectively.'},
                ]
            },
            {
                'title': 'GitHub and Collaboration',
                'lectures': [
                    {'title': 'GitHub Basics: Repositories and Cloning', 'duration': 18, 'description': 'Create GitHub repositories and clone existing ones.'},
                    {'title': 'Pull Requests and Code Review', 'duration': 22, 'description': 'Create pull requests and collaborate with team members.'},
                    {'title': 'Git Workflows: Feature Branches and Git Flow', 'duration': 25, 'description': 'Learn professional Git workflows for team collaboration.'},
                ]
            },
        ]
    },
    'shopify': {
        'sections': [
            {
                'title': 'Shopify Store Setup',
                'lectures': [
                    {'title': 'Introduction to Shopify E-commerce', 'duration': 15, 'description': 'Overview of Shopify platform and e-commerce fundamentals.'},
                    {'title': 'Creating Your Shopify Store', 'duration': 20, 'description': 'Step-by-step guide to create and configure your Shopify store.'},
                    {'title': 'Setting Up Payment Methods', 'duration': 18, 'description': 'Configure payment gateways and payment methods for your store.'},
                ]
            },
            {
                'title': 'Products and Inventory',
                'lectures': [
                    {'title': 'Adding Products to Your Store', 'duration': 22, 'description': 'Add products with images, descriptions, variants, and pricing.'},
                    {'title': 'Managing Inventory and Stock', 'duration': 20, 'description': 'Track inventory levels and set up stock management.'},
                    {'title': 'Product Collections and Organization', 'duration': 18, 'description': 'Organize products into collections for better navigation.'},
                    {'title': 'Product Variants and Options', 'duration': 20, 'description': 'Create product variants with different sizes, colors, and options.'},
                ]
            },
            {
                'title': 'Store Customization and Marketing',
                'lectures': [
                    {'title': 'Customizing Your Store Theme', 'duration': 25, 'description': 'Customize store appearance with themes and design settings.'},
                    {'title': 'Setting Up Discounts and Promotions', 'duration': 20, 'description': 'Create discount codes and promotional campaigns.'},
                    {'title': 'Shopify Apps and Integrations', 'duration': 22, 'description': 'Install and configure useful Shopify apps for enhanced functionality.'},
                    {'title': 'SEO and Marketing Strategies', 'duration': 25, 'description': 'Optimize your store for search engines and implement marketing strategies.'},
                ]
            },
        ]
    },
}


def get_course_lecture_content(course_title):
    """Get course-specific lecture content or return default"""
    course_lower = course_title.lower()
    
    if 'python' in course_lower:
        return COURSE_LECTURE_CONTENT.get('python')
    elif 'postgresql' in course_lower or 'postgres' in course_lower:
        return COURSE_LECTURE_CONTENT.get('postgresql')
    elif 'git' in course_lower or 'github' in course_lower:
        return COURSE_LECTURE_CONTENT.get('git')
    elif 'shopify' in course_lower:
        return COURSE_LECTURE_CONTENT.get('shopify')
    else:
        # Default content for other courses
        return {
            'sections': [
                {
                    'title': 'Introduction',
                    'lectures': [
                        {'title': 'Course Overview', 'duration': 15, 'description': 'Introduction to the course and what you will learn.'},
                        {'title': 'Getting Started', 'duration': 18, 'description': 'Set up your development environment and tools.'},
                        {'title': 'First Steps', 'duration': 20, 'description': 'Take your first steps in this course.'},
                    ]
                },
                {
                    'title': 'Core Concepts',
                    'lectures': [
                        {'title': 'Fundamental Concepts', 'duration': 22, 'description': 'Learn the fundamental concepts of this topic.'},
                        {'title': 'Working with Data', 'duration': 25, 'description': 'Understand how to work with data effectively.'},
                        {'title': 'Best Practices', 'duration': 20, 'description': 'Follow industry best practices.'},
                    ]
                },
                {
                    'title': 'Advanced Topics',
                    'lectures': [
                        {'title': 'Advanced Features', 'duration': 28, 'description': 'Explore advanced features and techniques.'},
                        {'title': 'Real-world Examples', 'duration': 25, 'description': 'See real-world examples and use cases.'},
                        {'title': 'Project Building', 'duration': 30, 'description': 'Build a complete project from scratch.'},
                    ]
                },
            ]
        }


class Command(BaseCommand):
    help = 'Seed database with comprehensive sample data'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-existing',
            action='store_true',
            help='Skip courses that already exist',
        )

    def handle(self, *args, **options):
        self.stdout.write('🌱 Seeding database with comprehensive data...')
        skip_existing = options.get('skip_existing', False)

        # Create categories
        cat1, _ = Category.objects.get_or_create(name='Programming', slug='programming')
        cat2, _ = Category.objects.get_or_create(name='Web Development', slug='web-development')
        cat3, _ = Category.objects.get_or_create(name='Data Science', slug='data-science')
        cat4, _ = Category.objects.get_or_create(name='Mobile Development', slug='mobile-development')
        cat5, _ = Category.objects.get_or_create(name='Machine Learning', slug='machine-learning')
        cat6, _ = Category.objects.get_or_create(name='DevOps', slug='devops')
        cat7, _ = Category.objects.get_or_create(name='E-commerce', slug='e-commerce')

        # Create tags
        tag1, _ = Tag.objects.get_or_create(name='Python', slug='python')
        tag2, _ = Tag.objects.get_or_create(name='JavaScript', slug='javascript')
        tag3, _ = Tag.objects.get_or_create(name='Django', slug='django')
        tag4, _ = Tag.objects.get_or_create(name='React', slug='react')
        tag5, _ = Tag.objects.get_or_create(name='Node.js', slug='nodejs')
        tag6, _ = Tag.objects.get_or_create(name='Docker', slug='docker')
        tag7, _ = Tag.objects.get_or_create(name='Kubernetes', slug='kubernetes')
        tag8, _ = Tag.objects.get_or_create(name='TensorFlow', slug='tensorflow')
        tag9, _ = Tag.objects.get_or_create(name='PostgreSQL', slug='postgresql')
        tag10, _ = Tag.objects.get_or_create(name='Git', slug='git')
        tag11, _ = Tag.objects.get_or_create(name='Shopify', slug='shopify')

        # Create admin user
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@topskill.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('admin123')
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()

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

        # Create additional students for reviews
        students = [student]
        for i in range(1, 6):
            stu, _ = User.objects.get_or_create(
                username=f'student{i}',
                defaults={
                    'email': f'student{i}@topskill.com',
                    'first_name': f'Student{i}',
                    'last_name': 'User',
                }
            )
            stu.set_password('student123')
            stu.save()
            students.append(stu)

        # Courses to create with specific content
        courses_to_create = [
            {
                'slug': 'python-for-beginners',
                'title': 'Python for Beginners',
                'description': 'Learn Python programming from scratch. Perfect for beginners who want to start their programming journey.',
                'short_description': 'Learn Python from scratch',
                'price': 49.99,
                'level': 'beginner',
                'category': cat1,
                'tags': [tag1],
            },
            {
                'slug': 'postgresql-advanced',
                'title': 'PostgreSQL Advanced',
                'description': 'Advanced PostgreSQL concepts including performance tuning, replication, and optimization.',
                'short_description': 'Advanced PostgreSQL',
                'price': 79.99,
                'level': 'advanced',
                'category': cat2,
                'tags': [tag9],
            },
            {
                'slug': 'git-github-mastery',
                'title': 'Git & GitHub Mastery',
                'description': 'Master version control with Git and GitHub. Learn branching, merging, and collaboration.',
                'short_description': 'Master Git and GitHub',
                'price': 49.99,
                'level': 'beginner',
                'category': cat1,
                'tags': [tag10],
            },
            {
                'slug': 'shopify-ecommerce-mastery',
                'title': 'Shopify E-commerce Mastery',
                'description': 'Build and manage successful online stores with Shopify. Learn product management, theme customization, marketing, and more.',
                'short_description': 'Master Shopify e-commerce',
                'price': 99.99,
                'level': 'beginner',
                'category': cat7,
                'tags': [tag11],
            },
            {
                'slug': 'django-web-development',
                'title': 'Django Web Development',
                'description': 'Build web applications with Django. Learn to create full-stack web applications.',
                'short_description': 'Build web apps with Django',
                'price': 79.99,
                'level': 'intermediate',
                'category': cat2,
                'tags': [tag1, tag3],
            },
            {
                'slug': 'react-complete-guide',
                'title': 'React - The Complete Guide',
                'description': 'Master React with hooks, context, and modern patterns. Build real-world applications.',
                'short_description': 'Master React development',
                'price': 89.99,
                'level': 'intermediate',
                'category': cat2,
                'tags': [tag2, tag4],
            },
            {
                'slug': 'nodejs-backend-development',
                'title': 'Node.js Backend Development',
                'description': 'Build scalable backend APIs with Node.js, Express, and MongoDB.',
                'short_description': 'Build backend APIs with Node.js',
                'price': 94.99,
                'level': 'intermediate',
                'category': cat2,
                'tags': [tag2, tag5],
            },
            {
                'slug': 'full-stack-django-react',
                'title': 'Full Stack Django & React',
                'description': 'Build complete full-stack applications with Django REST API and React frontend.',
                'short_description': 'Full-stack Django and React',
                'price': 129.99,
                'level': 'intermediate',
                'category': cat2,
                'tags': [tag1, tag3, tag4],
            },
        ]

        all_courses = []
        for course_data in courses_to_create:
            course, created = Course.objects.get_or_create(
                slug=course_data['slug'],
                defaults={
                    'title': course_data['title'],
                    'description': course_data['description'],
                    'short_description': course_data['short_description'],
                    'modality': 'online',
                    'price': course_data['price'],
                    'instructor': instructor,
                    'language': 'English',
                    'level': course_data['level'],
                    'is_active': True,
                }
            )
            if created:
                course.categories.add(course_data['category'])
                for tag in course_data['tags']:
                    course.tags.add(tag)
            else:
                # Ensure categories and tags are set
                if not course.categories.filter(id=course_data['category'].id).exists():
                    course.categories.add(course_data['category'])
                for tag in course_data['tags']:
                    if not course.tags.filter(id=tag.id).exists():
                        course.tags.add(tag)
            
            # Create sections and lectures with course-specific content
            if course.sections.count() == 0:
                lecture_content = get_course_lecture_content(course.title)
                for section_idx, section_data in enumerate(lecture_content['sections'], 1):
                    section, _ = CourseSection.objects.get_or_create(
                        course=course,
                        title=section_data['title'],
                        defaults={
                            'order': section_idx,
                            'is_preview': section_idx == 1,  # First section is preview
                        }
                    )
                    
                    for lecture_idx, lecture_data in enumerate(section_data['lectures'], 1):
                        video_id = get_video_id_for_course(course.title, lecture_idx, section_idx)
                        Lecture.objects.get_or_create(
                            section=section,
                            title=lecture_data['title'],
                            defaults={
                                'order': lecture_idx,
                                'description': lecture_data['description'],
                                'youtube_video_id': video_id,
                                'duration_minutes': lecture_data['duration'],
                                'is_preview': section_idx == 1 and lecture_idx == 1,  # First lecture is preview
                            }
                        )
            
            # Update course stats dynamically
            total_lectures = Lecture.objects.filter(section__course=course).count()
            total_duration = sum(
                Lecture.objects.filter(section__course=course).values_list('duration_minutes', flat=True) or [0]
            )
            course.total_lectures = total_lectures
            course.total_duration_hours = round(total_duration / 60, 2) if total_duration > 0 else 0
            course.save()
            
            all_courses.append(course)

        # Create quizzes for each course
        for course in all_courses:
            if course.quizzes.count() == 0:
                quiz1, _ = Quiz.objects.get_or_create(
                    course=course,
                    title=f'{course.title} - Quiz 1',
                    defaults={
                        'description': f'Test your knowledge of {course.title} fundamentals.',
                        'passing_score': 70.0,
                        'time_limit_minutes': 30,
                        'max_attempts': 3,
                        'order': 1,
                        'is_active': True,
                    }
                )
                
                # Create questions for quiz
                questions_data = [
                    {
                        'text': f'What is the main topic covered in {course.title}?',
                        'type': 'multiple_choice',
                        'points': 10,
                        'options': [
                            {'text': 'Basic concepts', 'is_correct': True},
                            {'text': 'Advanced topics', 'is_correct': False},
                            {'text': 'Both', 'is_correct': False},
                            {'text': 'None', 'is_correct': False},
                        ]
                    },
                    {
                        'text': f'Is {course.title} suitable for beginners?',
                        'type': 'true_false',
                        'points': 5,
                        'options': [
                            {'text': 'True', 'is_correct': course.level == 'beginner'},
                            {'text': 'False', 'is_correct': course.level != 'beginner'},
                        ]
                    },
                ]
                
                for q_idx, q_data in enumerate(questions_data, 1):
                    question, _ = Question.objects.get_or_create(
                        quiz=quiz1,
                        question_text=q_data['text'],
                        defaults={
                            'question_type': q_data['type'],
                            'points': q_data['points'],
                            'order': q_idx,
                            'correct_answer': '{}',
                        }
                    )
                    
                    for opt_idx, opt_data in enumerate(q_data['options'], 1):
                        QuestionOption.objects.get_or_create(
                            question=question,
                            option_text=opt_data['text'],
                            defaults={
                                'is_correct': opt_data['is_correct'],
                                'order': opt_idx,
                            }
                        )

        # Create assignments for each course
        for course in all_courses:
            if course.assignments.count() == 0:
                Assignment.objects.get_or_create(
                    course=course,
                    title=f'{course.title} - Final Project',
                    defaults={
                        'description': f'Complete a final project demonstrating your understanding of {course.title}.',
                        'due_date': timezone.now() + timedelta(days=30),
                        'max_score': 100.0,
                        'order': 1,
                        'is_active': True,
                        'allow_late_submission': True,
                    }
                )

        # Create enrollments
        progress_percentages = [25, 45, 60, 75, 30, 50, 80, 15]
        for idx, course in enumerate(all_courses[:8]):
            if course:
                progress = progress_percentages[idx % len(progress_percentages)]
                Enrollment.objects.get_or_create(
                    user=student,
                    course=course,
                    defaults={
                        'status': 'active',
                        'progress_percent': progress,
                    }
                )

        # Create reviews
        for course in all_courses[:5]:
            for i, stu in enumerate(students[:3]):
                Review.objects.get_or_create(
                    user=stu,
                    course=course,
                    defaults={
                        'rating': random.randint(4, 5),
                        'comment': f'Great course! Learned a lot about {course.title}. Highly recommended!',
                        'is_verified_purchase': True,
                    }
                )

        # Create resources for courses
        for course in all_courses[:3]:
            Resource.objects.get_or_create(
                course=course,
                title=f'{course.title} - Course Materials',
                defaults={
                    'resource_type': 'pdf',
                    'external_url': 'https://example.com/resources',
                    'description': 'Download course materials and resources.',
                    'is_active': True,
                }
            )

        # Create wishlist items
        for course in all_courses[3:6]:
            Wishlist.objects.get_or_create(
                user=student,
                course=course,
            )

        # Create notifications
        for i in range(5):
            Notification.objects.get_or_create(
                user=student,
                title=f'New Course Available',
                defaults={
                    'message': f'Check out our new courses!',
                    'notification_type': 'info',
                    'is_read': False,
                }
            )

        # Create forums and posts
        for course in all_courses[:3]:
            forum, _ = Forum.objects.get_or_create(course=course)
            
            Post.objects.get_or_create(
                forum=forum,
                user=student,
                title=f'Welcome to {course.title} Discussion',
                defaults={
                    'content': f'Welcome everyone! Feel free to ask questions and share your progress.',
                    'post_type': 'discussion',
                    'is_pinned': True,
                }
            )

        self.stdout.write(self.style.SUCCESS('\n✅ Successfully seeded database!'))
        self.stdout.write('\n📊 Created:')
        self.stdout.write(f'  - {Course.objects.count()} courses')
        self.stdout.write(f'  - {CourseSection.objects.count()} sections')
        self.stdout.write(f'  - {Lecture.objects.count()} lectures')
        self.stdout.write(f'  - {Quiz.objects.count()} quizzes')
        self.stdout.write(f'  - {Question.objects.count()} questions')
        self.stdout.write(f'  - {Assignment.objects.count()} assignments')
        self.stdout.write(f'  - {Review.objects.count()} reviews')
        self.stdout.write(f'  - {Enrollment.objects.count()} enrollments')
        self.stdout.write(f'  - {User.objects.count()} users')
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('USER CREDENTIALS:'))
        self.stdout.write('='*50)
        self.stdout.write('\n🔐 ADMIN USER (Full Access):')
        self.stdout.write('   Username: admin')
        self.stdout.write('   Password: admin123')
        self.stdout.write('   Email: admin@topskill.com')
        self.stdout.write('\n👨‍🏫 INSTRUCTOR USER:')
        self.stdout.write('   Username: instructor')
        self.stdout.write('   Password: instructor123')
        self.stdout.write('\n👨‍🎓 STUDENT USER:')
        self.stdout.write('   Username: student')
        self.stdout.write('   Password: student123')
        self.stdout.write('\n' + '='*50)
        self.stdout.write('\n💡 TIP: Use these credentials to login at:')
        self.stdout.write('   Frontend: http://localhost:3000/login')
        self.stdout.write('   Django Admin: http://localhost:8000/admin')
        self.stdout.write('='*50)
