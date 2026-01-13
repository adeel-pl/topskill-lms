from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta, datetime
from lms.models import (
    Course, CourseSection, Lecture, Category, Tag, 
    Batch, BatchSession, SessionRegistration, Attendance,
    Enrollment, Review, Quiz, Assignment, Question, QuestionOption,
    QuizAttempt, AssignmentSubmission, Wishlist, Notification, Certificate,
    Forum, Post, Reply, Resource, Note, Prerequisite, QandA, Announcement,
    Cart, CartItem, Payment, LectureProgress
)
from .video_ids import get_video_id_for_course
import random


def get_course_thumbnail(course_title):
    """Get relevant thumbnail image URL based on course title"""
    course_lower = course_title.lower()
    
    # Map course titles to relevant image keywords
    image_mapping = {
        'python': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop',
        'postgresql': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=600&fit=crop',
        'postgres': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=600&fit=crop',
        'git': 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=600&fit=crop',
        'github': 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=600&fit=crop',
        'shopify': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
        'e-commerce': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
        'django': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
        'react': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
        'node': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
        'nodejs': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
        'full stack': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
        'web development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
        'bootcamp': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
        'internship': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
        'software development': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
        'programming': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
    }
    
    # Check for matches in course title
    for keyword, image_url in image_mapping.items():
        if keyword in course_lower:
            return image_url
    
    # Default image for courses that don't match
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'


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
        # Add categories for frontend dropdowns
        cat_dev, _ = Category.objects.get_or_create(name='Development', slug='development')
        cat_business, _ = Category.objects.get_or_create(name='Business', slug='business')
        cat_design, _ = Category.objects.get_or_create(name='Design', slug='design')

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
        # Online courses
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
        
        # Physical courses
        physical_courses_to_create = [
            {
                'slug': 'python-programming-physical',
                'title': 'Python Programming - Physical Class',
                'description': 'Learn Python programming in a physical classroom setting. Hands-on practice with instructor guidance.',
                'short_description': 'Python programming in-person class',
                'price': 199.99,
                'level': 'beginner',
                'category': cat1,
                'tags': [tag1],
                'max_batch_size': 25,
            },
            {
                'slug': 'web-development-bootcamp',
                'title': 'Web Development Bootcamp',
                'description': 'Intensive web development bootcamp covering HTML, CSS, JavaScript, and modern frameworks.',
                'short_description': 'Intensive web development bootcamp',
                'price': 499.99,
                'level': 'beginner',
                'category': cat2,
                'tags': [tag2, tag4],
                'max_batch_size': 30,
            },
        ]
        
        # Hybrid courses
        hybrid_courses_to_create = [
            {
                'slug': 'full-stack-hybrid',
                'title': 'Full Stack Development - Hybrid',
                'description': 'Learn full-stack development with online lectures and physical hands-on sessions.',
                'short_description': 'Full-stack hybrid course',
                'price': 299.99,
                'level': 'intermediate',
                'category': cat2,
                'tags': [tag1, tag2, tag3, tag4],
                'max_batch_size': 20,
            },
        ]
        
        # Internship courses
        internship_courses_to_create = [
            {
                'slug': 'software-development-internship',
                'title': 'Software Development Internship',
                'description': '3-month internship program with structured learning, mentorship, and real-world projects.',
                'short_description': 'Software development internship program',
                'price': 799.99,
                'level': 'intermediate',
                'category': cat1,
                'tags': [tag1, tag3],
                'max_batch_size': 10,
            },
        ]

        all_courses = []
        for course_data in courses_to_create:
            # Get thumbnail image for this course
            thumbnail_url = get_course_thumbnail(course_data['title'])
            
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
                    'thumbnail': thumbnail_url,
                    'is_active': True,
                }
            )
            # Update thumbnail if course already exists but doesn't have one
            if not created and not course.thumbnail:
                course.thumbnail = thumbnail_url
                course.save()
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

        # Create physical courses
        for course_data in physical_courses_to_create:
            # Get thumbnail image for this course
            thumbnail_url = get_course_thumbnail(course_data['title'])
            
            course, created = Course.objects.get_or_create(
                slug=course_data['slug'],
                defaults={
                    'title': course_data['title'],
                    'description': course_data['description'],
                    'short_description': course_data['short_description'],
                    'modality': 'physical',
                    'price': course_data['price'],
                    'instructor': instructor,
                    'language': 'English',
                    'level': course_data['level'],
                    'max_batch_size': course_data['max_batch_size'],
                    'thumbnail': thumbnail_url,
                    'is_active': True,
                }
            )
            # Update thumbnail if course already exists but doesn't have one
            if not created and not course.thumbnail:
                course.thumbnail = thumbnail_url
                course.save()
            if created:
                course.categories.add(course_data['category'])
                for tag in course_data['tags']:
                    course.tags.add(tag)
            else:
                if not course.categories.filter(id=course_data['category'].id).exists():
                    course.categories.add(course_data['category'])
                for tag in course_data['tags']:
                    if not course.tags.filter(id=tag.id).exists():
                        course.tags.add(tag)
            
            # Create sections and lectures
            if course.sections.count() == 0:
                lecture_content = get_course_lecture_content(course.title)
                for section_idx, section_data in enumerate(lecture_content['sections'], 1):
                    section, _ = CourseSection.objects.get_or_create(
                        course=course,
                        title=section_data['title'],
                        defaults={
                            'order': section_idx,
                            'is_preview': section_idx == 1,
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
                                'is_preview': section_idx == 1 and lecture_idx == 1,
                            }
                        )
            
            # Update course stats
            total_lectures = Lecture.objects.filter(section__course=course).count()
            total_duration = sum(
                Lecture.objects.filter(section__course=course).values_list('duration_minutes', flat=True) or [0]
            )
            course.total_lectures = total_lectures
            course.total_duration_hours = round(total_duration / 60, 2) if total_duration > 0 else 0
            course.save()
            
            # Create batches for physical courses
            if course.batches.count() == 0:
                batch1, _ = Batch.objects.get_or_create(
                    course=course,
                    name=f'{course.title} - Batch 1',
                    defaults={
                        'batch_type': 'physical',
                        'capacity': course.max_batch_size,
                        'start_date': timezone.now().date() + timedelta(days=7),
                        'end_date': timezone.now().date() + timedelta(days=37),
                        'instructor': instructor,
                        'is_active': True,
                    }
                )
                
                # Create sessions for the batch (weekly sessions for 4 weeks)
                if batch1.sessions.count() == 0:
                    for week in range(4):
                        for day_offset in [0, 2]:  # Monday and Wednesday
                            session_date = batch1.start_date + timedelta(days=(week * 7) + day_offset)
                            start_datetime = timezone.make_aware(
                                datetime.combine(session_date, datetime.min.time().replace(hour=14, minute=0))
                            )
                            end_datetime = start_datetime + timedelta(hours=2)
                            
                            BatchSession.objects.get_or_create(
                                batch=batch1,
                                session_number=(week * 2) + (day_offset // 2) + 1,
                                start_datetime=start_datetime,
                                defaults={
                                    'title': f'Week {week + 1} - Session {(week * 2) + (day_offset // 2) + 1}',
                                    'end_datetime': end_datetime,
                                    'location': 'Main Campus - Room 101',
                                    'description': f'Physical class session covering course materials.',
                                    'is_active': True,
                                }
                            )
            
            all_courses.append(course)

        # Create hybrid courses
        for course_data in hybrid_courses_to_create:
            # Get thumbnail image for this course
            thumbnail_url = get_course_thumbnail(course_data['title'])
            
            course, created = Course.objects.get_or_create(
                slug=course_data['slug'],
                defaults={
                    'title': course_data['title'],
                    'description': course_data['description'],
                    'short_description': course_data['short_description'],
                    'modality': 'hybrid',
                    'price': course_data['price'],
                    'instructor': instructor,
                    'language': 'English',
                    'level': course_data['level'],
                    'max_batch_size': course_data['max_batch_size'],
                    'thumbnail': thumbnail_url,
                    'is_active': True,
                }
            )
            # Update thumbnail if course already exists but doesn't have one
            if not created and not course.thumbnail:
                course.thumbnail = thumbnail_url
                course.save()
            if created:
                course.categories.add(course_data['category'])
                for tag in course_data['tags']:
                    course.tags.add(tag)
            else:
                if not course.categories.filter(id=course_data['category'].id).exists():
                    course.categories.add(course_data['category'])
                for tag in course_data['tags']:
                    if not course.tags.filter(id=tag.id).exists():
                        course.tags.add(tag)
            
            # Create sections and lectures
            if course.sections.count() == 0:
                lecture_content = get_course_lecture_content(course.title)
                for section_idx, section_data in enumerate(lecture_content['sections'], 1):
                    section, _ = CourseSection.objects.get_or_create(
                        course=course,
                        title=section_data['title'],
                        defaults={
                            'order': section_idx,
                            'is_preview': section_idx == 1,
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
                                'is_preview': section_idx == 1 and lecture_idx == 1,
                            }
                        )
            
            # Update course stats
            total_lectures = Lecture.objects.filter(section__course=course).count()
            total_duration = sum(
                Lecture.objects.filter(section__course=course).values_list('duration_minutes', flat=True) or [0]
            )
            course.total_lectures = total_lectures
            course.total_duration_hours = round(total_duration / 60, 2) if total_duration > 0 else 0
            course.save()
            
            # Create batches for hybrid courses
            if course.batches.count() == 0:
                batch1, _ = Batch.objects.get_or_create(
                    course=course,
                    name=f'{course.title} - Hands-on Batch 1',
                    defaults={
                        'batch_type': 'physical',
                        'capacity': course.max_batch_size,
                        'start_date': timezone.now().date() + timedelta(days=14),
                        'end_date': timezone.now().date() + timedelta(days=44),
                        'instructor': instructor,
                        'is_active': True,
                    }
                )
                
                # Create sessions for hybrid course
                if batch1.sessions.count() == 0:
                    for week in range(4):
                        session_date = batch1.start_date + timedelta(days=week * 7)
                        start_datetime = timezone.make_aware(
                            datetime.combine(session_date, datetime.min.time().replace(hour=10, minute=0))
                        )
                        end_datetime = start_datetime + timedelta(hours=3)
                        
                        BatchSession.objects.get_or_create(
                            batch=batch1,
                            session_number=week + 1,
                            start_datetime=start_datetime,
                            defaults={
                                'title': f'Hands-on Session {week + 1}',
                                'end_datetime': end_datetime,
                                'location': 'Lab Room 205',
                                'description': f'Physical hands-on session for practical application.',
                                'is_active': True,
                            }
                        )
            
            all_courses.append(course)

        # Create internship courses
        for course_data in internship_courses_to_create:
            # Get thumbnail image for this course
            thumbnail_url = get_course_thumbnail(course_data['title'])
            
            course, created = Course.objects.get_or_create(
                slug=course_data['slug'],
                defaults={
                    'title': course_data['title'],
                    'description': course_data['description'],
                    'short_description': course_data['short_description'],
                    'modality': 'physical',
                    'price': course_data['price'],
                    'instructor': instructor,
                    'language': 'English',
                    'level': course_data['level'],
                    'max_batch_size': course_data['max_batch_size'],
                    'thumbnail': thumbnail_url,
                    'is_active': True,
                }
            )
            # Update thumbnail if course already exists but doesn't have one
            if not created and not course.thumbnail:
                course.thumbnail = thumbnail_url
                course.save()
            if created:
                course.categories.add(course_data['category'])
                for tag in course_data['tags']:
                    course.tags.add(tag)
            else:
                if not course.categories.filter(id=course_data['category'].id).exists():
                    course.categories.add(course_data['category'])
                for tag in course_data['tags']:
                    if not course.tags.filter(id=tag.id).exists():
                        course.tags.add(tag)
            
            # Create sections and lectures
            if course.sections.count() == 0:
                lecture_content = get_course_lecture_content(course.title)
                for section_idx, section_data in enumerate(lecture_content['sections'], 1):
                    section, _ = CourseSection.objects.get_or_create(
                        course=course,
                        title=section_data['title'],
                        defaults={
                            'order': section_idx,
                            'is_preview': section_idx == 1,
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
                                'is_preview': section_idx == 1 and lecture_idx == 1,
                            }
                        )
            
            # Update course stats
            total_lectures = Lecture.objects.filter(section__course=course).count()
            total_duration = sum(
                Lecture.objects.filter(section__course=course).values_list('duration_minutes', flat=True) or [0]
            )
            course.total_lectures = total_lectures
            course.total_duration_hours = round(total_duration / 60, 2) if total_duration > 0 else 0
            course.save()
            
            # Create internship batch
            if course.batches.count() == 0:
                batch1, _ = Batch.objects.get_or_create(
                    course=course,
                    name=f'{course.title} - Summer 2024',
                    defaults={
                        'batch_type': 'internship',
                        'capacity': course.max_batch_size,
                        'start_date': timezone.now().date() + timedelta(days=30),
                        'end_date': timezone.now().date() + timedelta(days=120),
                        'instructor': instructor,
                        'is_active': True,
                    }
                )
                
                # Create mentorship sessions (weekly for 12 weeks)
                if batch1.sessions.count() == 0:
                    for week in range(12):
                        session_date = batch1.start_date + timedelta(days=week * 7)
                        start_datetime = timezone.make_aware(
                            datetime.combine(session_date, datetime.min.time().replace(hour=15, minute=0))
                        )
                        end_datetime = start_datetime + timedelta(hours=2)
                        
                        BatchSession.objects.get_or_create(
                            batch=batch1,
                            session_number=week + 1,
                            start_datetime=start_datetime,
                            defaults={
                                'title': f'Week {week + 1} - Mentorship Session',
                                'end_datetime': end_datetime,
                                'location': 'Mentor Office - Room 301',
                                'description': f'Weekly mentorship session for project guidance and progress review.',
                                'is_active': True,
                            }
                        )
            
            all_courses.append(course)

        # Create bootcamp batch for web development bootcamp course
        bootcamp_course = Course.objects.filter(slug='web-development-bootcamp').first()
        if bootcamp_course and bootcamp_course.batches.filter(batch_type='bootcamp').count() == 0:
            bootcamp_batch, _ = Batch.objects.get_or_create(
                course=bootcamp_course,
                name=f'{bootcamp_course.title} - January 2024',
                defaults={
                    'batch_type': 'bootcamp',
                    'capacity': bootcamp_course.max_batch_size,
                    'start_date': timezone.now().date() + timedelta(days=14),
                    'end_date': timezone.now().date() + timedelta(days=28),
                    'instructor': instructor,
                    'is_active': True,
                }
            )
            
            # Create intensive daily sessions for bootcamp
            if bootcamp_batch.sessions.count() == 0:
                session_num = 1
                for week in range(2):
                    for day in range(5):
                        session_date = bootcamp_batch.start_date + timedelta(days=(week * 7) + day)
                        # Morning session
                        morning_start = timezone.make_aware(
                            datetime.combine(session_date, datetime.min.time().replace(hour=9, minute=0))
                        )
                        morning_end = morning_start + timedelta(hours=3)
                        
                        BatchSession.objects.get_or_create(
                            batch=bootcamp_batch,
                            session_number=session_num,
                            start_datetime=morning_start,
                            defaults={
                                'title': f'Day {session_num} - Morning Session',
                                'end_datetime': morning_end,
                                'location': 'Bootcamp Lab - Room 401',
                                'description': f'Intensive morning session covering core concepts.',
                                'is_active': True,
                            }
                        )
                        session_num += 1
                        
                        # Afternoon session
                        afternoon_start = timezone.make_aware(
                            datetime.combine(session_date, datetime.min.time().replace(hour=14, minute=0))
                        )
                        afternoon_end = afternoon_start + timedelta(hours=3)
                        
                        BatchSession.objects.get_or_create(
                            batch=bootcamp_batch,
                            session_number=session_num,
                            start_datetime=afternoon_start,
                            defaults={
                                'title': f'Day {session_num - 1} - Afternoon Session',
                                'end_datetime': afternoon_end,
                                'location': 'Bootcamp Lab - Room 401',
                                'description': f'Intensive afternoon session with hands-on practice.',
                                'is_active': True,
                            }
                        )
                        session_num += 1

        # Create enrollments for physical/hybrid courses
        physical_courses = Course.objects.filter(modality__in=['physical', 'hybrid'])
        for course in physical_courses[:2]:
            batch = course.batches.first()
            if batch:
                enrollment, _ = Enrollment.objects.get_or_create(
                    user=student,
                    course=course,
                    defaults={
                        'status': 'active',
                        'progress_percent': 20,
                    }
                )
                if enrollment.batch != batch:
                    enrollment.batch = batch
                    enrollment.save()
                
                # Create some past sessions for attendance tracking
                past_sessions = []
                for i in range(3):
                    session_date = timezone.now().date() - timedelta(days=i*7)
                    start_datetime = timezone.make_aware(
                        datetime.combine(session_date, datetime.min.time().replace(hour=14, minute=0))
                    )
                    end_datetime = start_datetime + timedelta(hours=2)
                    
                    past_session, _ = BatchSession.objects.get_or_create(
                        batch=batch,
                        session_number=i+1,
                        start_datetime=start_datetime,
                        defaults={
                            'title': f'Past Session {i+1}',
                            'end_datetime': end_datetime,
                            'location': 'Main Campus - Room 101',
                            'description': f'Past session for attendance tracking.',
                            'is_active': True,
                        }
                    )
                    past_sessions.append(past_session)
                
                # Register for sessions (past and future)
                all_sessions = list(past_sessions) + list(batch.sessions.filter(start_datetime__gte=timezone.now())[:2])
                for session in all_sessions:
                    SessionRegistration.objects.get_or_create(
                        enrollment=enrollment,
                        session=session,
                        defaults={
                            'status': 'registered',
                        }
                    )
                    
                    # Create attendance records for past sessions
                    if session.start_datetime < timezone.now():
                        Attendance.objects.get_or_create(
                            enrollment=enrollment,
                            session=session,
                            defaults={
                                'present': random.choice([True, True, True, False]),
                                'note': 'Attended session' if random.choice([True, True, True, False]) else 'Absent',
                                'checked_in_at': session.start_datetime + timedelta(minutes=random.randint(0, 10)),
                            }
                        )

        # Create quizzes for each course
        for course in all_courses:
            quiz1, created = Quiz.objects.get_or_create(
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
            
            # Add questions if quiz is new or has fewer than 3 questions
            if created or quiz1.questions.count() < 3:
                
                # Create questions for quiz - course-specific questions
                course_lower = course.title.lower()
                questions_data = []
                
                # Shopify-specific questions
                if 'shopify' in course_lower:
                    questions_data = [
                        {
                            'text': 'What is the main topic covered in Shopify E-commerce Mastery?',
                            'type': 'multiple_choice',
                            'points': 10,
                            'options': [
                                {'text': 'Building and managing online stores', 'is_correct': True},
                                {'text': 'Advanced programming', 'is_correct': False},
                                {'text': 'Database management', 'is_correct': False},
                                {'text': 'Mobile app development', 'is_correct': False},
                            ]
                        },
                        {
                            'text': 'Is Shopify E-commerce Mastery suitable for beginners?',
                            'type': 'true_false',
                            'points': 5,
                            'options': [
                                {'text': 'True', 'is_correct': True},
                                {'text': 'False', 'is_correct': False},
                            ]
                        },
                        {
                            'text': 'What payment methods can you configure in Shopify?',
                            'type': 'multiple_choice',
                            'points': 15,
                            'options': [
                                {'text': 'Credit cards, PayPal, and other gateways', 'is_correct': True},
                                {'text': 'Only credit cards', 'is_correct': False},
                                {'text': 'Only PayPal', 'is_correct': False},
                                {'text': 'Cash on delivery only', 'is_correct': False},
                            ]
                        },
                        {
                            'text': 'What is a product collection in Shopify?',
                            'type': 'multiple_choice',
                            'points': 15,
                            'options': [
                                {'text': 'A way to organize products into groups', 'is_correct': True},
                                {'text': 'A type of product variant', 'is_correct': False},
                                {'text': 'A payment method', 'is_correct': False},
                                {'text': 'A shipping option', 'is_correct': False},
                            ]
                        },
                        {
                            'text': 'Can you customize Shopify store themes?',
                            'type': 'true_false',
                            'points': 10,
                            'options': [
                                {'text': 'True', 'is_correct': True},
                                {'text': 'False', 'is_correct': False},
                            ]
                        },
                    ]
                else:
                    # Default questions for other courses
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
                        {
                            'text': f'What will you learn in {course.title}?',
                            'type': 'multiple_choice',
                            'points': 15,
                            'options': [
                                {'text': 'Core concepts and practical skills', 'is_correct': True},
                                {'text': 'Only theory', 'is_correct': False},
                                {'text': 'Only advanced topics', 'is_correct': False},
                                {'text': 'Nothing specific', 'is_correct': False},
                            ]
                        },
                        {
                            'text': f'Does {course.title} include hands-on practice?',
                            'type': 'true_false',
                            'points': 10,
                            'options': [
                                {'text': 'True', 'is_correct': True},
                                {'text': 'False', 'is_correct': False},
                            ]
                        },
                    ]
                
                # Get existing question count
                existing_count = quiz1.questions.count()
                start_order = existing_count + 1
                
                for q_idx, q_data in enumerate(questions_data, 1):
                    question, created = Question.objects.get_or_create(
                        quiz=quiz1,
                        question_text=q_data['text'],
                        defaults={
                            'question_type': q_data['type'],
                            'points': q_data['points'],
                            'order': start_order + q_idx - 1,
                            'correct_answer': '{}',
                        }
                    )
                    
                    # Only create options if question was just created
                    if created:
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

        # Create wishlist items for multiple students
        for stu in students:
            # Each student has 2-4 courses in wishlist
            wishlist_courses = random.sample(list(all_courses), random.randint(2, 4))
            for course in wishlist_courses:
                Wishlist.objects.get_or_create(
                    user=stu,
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

        # Create Q&A (FAQ) for each course
        qa_templates = {
            'python': [
                {'q': 'What programming experience do I need?', 'a': 'No prior programming experience is required. This course starts from the basics and gradually builds up to more advanced concepts.'},
                {'q': 'How long does it take to complete the course?', 'a': 'The course is self-paced. Most students complete it in 4-6 weeks by dedicating 5-10 hours per week.'},
                {'q': 'Will I get a certificate?', 'a': 'Yes! Upon completion, you will receive a certificate of completion that you can add to your resume or LinkedIn profile.'},
                {'q': 'What if I get stuck?', 'a': 'You can ask questions in the Q&A section, and our instructors will help you. We also have a community forum for peer support.'},
                {'q': 'Can I access the course materials after completion?', 'a': 'Yes! You have lifetime access to all course materials, including future updates.'},
            ],
            'django': [
                {'q': 'Do I need to know Python before taking this course?', 'a': 'Yes, basic Python knowledge is recommended. We cover Django-specific concepts, but Python fundamentals are assumed.'},
                {'q': 'What will I build in this course?', 'a': 'You will build a complete web application including user authentication, database models, API endpoints, and deployment.'},
                {'q': 'Is Django still relevant in 2024?', 'a': 'Absolutely! Django is one of the most popular Python web frameworks and is widely used in production applications.'},
            ],
            'shopify': [
                {'q': 'Do I need a Shopify account?', 'a': 'Yes, you will need a Shopify account. We provide instructions on setting up a free development store.'},
                {'q': 'Will I learn how to create custom themes?', 'a': 'Yes! The course covers theme development, customization, and best practices for creating professional Shopify stores.'},
                {'q': 'What about Shopify apps?', 'a': 'We cover both theme development and app development, giving you a complete understanding of the Shopify ecosystem.'},
            ],
        }
        
        announcement_templates = [
            {'title': 'Welcome to the Course!', 'content': 'Welcome! We are excited to have you here. Make sure to check out the course materials and start with the first lecture.'},
            {'title': 'New Content Added', 'content': 'We have added new lectures covering advanced topics. Check them out in the course content section.'},
            {'title': 'Assignment Deadline Reminder', 'content': 'Don\'t forget! The assignment is due next week. Make sure to submit it on time to get full credit.'},
        ]
        
        for course in all_courses:
            # Create Q&A based on course title
            course_key = course.title.lower()
            qa_list = []
            for key, qas in qa_templates.items():
                if key in course_key:
                    qa_list = qas
                    break
            
            # Default Q&A if no match
            if not qa_list:
                qa_list = [
                    {'q': 'What will I learn in this course?', 'a': f'This course covers all the essential concepts and practical applications of {course.title}.'},
                    {'q': 'How long is the course?', 'a': f'The course includes {course.total_lectures} lectures with a total duration of {course.total_duration_hours} hours.'},
                    {'q': 'Is there a certificate?', 'a': 'Yes, you will receive a certificate upon successful completion of the course.'},
                ]
            
            for idx, qa in enumerate(qa_list[:5], 1):  # Create up to 5 Q&As per course
                QandA.objects.get_or_create(
                    course=course,
                    question=qa['q'],
                    defaults={
                        'answer': qa['a'],
                        'order': idx,
                        'is_active': True,
                    }
                )
            
            # Create announcements for each course
            for idx, ann in enumerate(announcement_templates[:3], 1):  # Create 3 announcements per course
                Announcement.objects.get_or_create(
                    course=course,
                    title=ann['title'],
                    defaults={
                        'content': ann['content'],
                        'is_pinned': idx == 1,  # First announcement is pinned
                        'is_active': True,
                        'created_by': admin_user,
                    }
                )

        # Create cart and cart items for students
        for stu in students:
            cart, _ = Cart.objects.get_or_create(user=stu)
            # Add more courses to each cart (3-6 courses)
            courses_to_cart = random.sample(list(all_courses), random.randint(3, 6))
            for course in courses_to_cart:
                CartItem.objects.get_or_create(
                    cart=cart,
                    course=course,
                )
        
        # Also create carts for admin and instructor (they might want to purchase courses)
        for user in [admin_user, instructor]:
            cart, _ = Cart.objects.get_or_create(user=user)
            courses_to_cart = random.sample(list(all_courses), random.randint(2, 4))
            for course in courses_to_cart:
                CartItem.objects.get_or_create(
                    cart=cart,
                    course=course,
                )

        # Create payments for enrollments (multiple students, multiple courses)
        all_enrollments = Enrollment.objects.all()
        payment_statuses = ['completed', 'pending', 'failed', 'completed', 'completed']
        for enrollment in all_enrollments:
            # Create payment for each enrollment
            Payment.objects.get_or_create(
                user=enrollment.user,
                course=enrollment.course,
                defaults={
                    'amount': enrollment.course.price,
                    'status': random.choice(payment_statuses),
                    'payfast_payment_id': f'PF-{random.randint(100000, 999999)}',
                    'created_at': enrollment.created_at,
                }
            )
        
        # Create additional payments (some users might have multiple payment attempts)
        for stu in students[:4]:
            courses_to_pay = random.sample(list(all_courses), random.randint(2, 5))
            for course in courses_to_pay:
                # Check if payment already exists
                if not Payment.objects.filter(user=stu, course=course).exists():
                    Payment.objects.create(
                        user=stu,
                        course=course,
                        amount=course.price,
                        status=random.choice(['completed', 'pending', 'failed']),
                        payfast_payment_id=f'PF-{random.randint(100000, 999999)}',
                    )

        # Create quiz attempts for enrolled students
        all_enrollments_for_quizzes = Enrollment.objects.all()
        for enrollment in all_enrollments_for_quizzes:
            quiz = enrollment.course.quizzes.first()
            if quiz:
                # Create quiz attempts for ALL enrolled students
                course_enrollments = Enrollment.objects.filter(course=enrollment.course)
                for stu_enrollment in course_enrollments:
                    # Create 1-3 attempts per student
                    num_attempts = random.randint(1, 3)
                    for attempt_num in range(1, num_attempts + 1):
                        score = random.randint(60, 95) if attempt_num == 1 else random.randint(40, 85)
                        passed = score >= float(quiz.passing_score)
                        
                        attempt, created = QuizAttempt.objects.get_or_create(
                            enrollment=stu_enrollment,
                            quiz=quiz,
                            attempt_number=attempt_num,
                            defaults={
                                'score': score,
                                'passed': passed,
                                'started_at': timezone.now() - timedelta(days=attempt_num*2),
                                'completed_at': timezone.now() - timedelta(days=attempt_num*2) + timedelta(minutes=random.randint(15, 25)),
                                'answers': {
                                    str(i): random.randint(1, 4) if random.choice([True, False]) else random.choice(['True', 'False'])
                                    for i in range(1, min(quiz.questions.count() + 1, 6))
                                }
                            }
                        )
                        # Only create if new
                        if not created:
                            break

        # Create assignment submissions for multiple students
        for course in all_courses:
            assignment = course.assignments.first()
            if not assignment:
                continue
                
            # Get ALL enrollments for this course
            course_enrollments = Enrollment.objects.filter(course=course)
            for enrollment in course_enrollments:
                status = random.choice(['submitted', 'graded', 'returned', 'submitted', 'draft'])
                score = random.randint(70, 100) if status == 'graded' else None
                
                feedback_options = [
                    'Great work! You demonstrated a good understanding of the concepts.',
                    'Excellent submission. Well done!',
                    'Good effort. Consider adding more detail in section 2.',
                    'Well structured. Minor improvements needed in the conclusion.',
                    'Outstanding work! Your analysis was thorough and well-researched.',
                    'Good submission. Please revise section 3 based on the feedback.',
                ]
                
                submission, _ = AssignmentSubmission.objects.get_or_create(
                    enrollment=enrollment,
                    assignment=assignment,
                    defaults={
                        'submission_text': f'This is my submission for {assignment.title}. I have completed all the requirements and included detailed explanations. Here is my work:\n\n1. Introduction\n2. Main content\n3. Conclusion',
                        'status': status,
                        'score': score,
                        'feedback': random.choice(feedback_options) if status == 'graded' else '',
                        'submitted_at': timezone.now() - timedelta(days=random.randint(1, 15)),
                        'graded_at': timezone.now() - timedelta(days=random.randint(1, 7)) if status == 'graded' else None,
                        'is_late': random.choice([True, False, False, False]),  # 25% late
                    }
                )

        # Create lecture progress for enrolled students
        all_enrollments_for_progress = Enrollment.objects.all()
        for enrollment in all_enrollments_for_progress:
            lectures = Lecture.objects.filter(section__course=enrollment.course)[:10]
            for lecture in lectures:
                # Some lectures completed, some in progress
                is_completed = random.choice([True, True, False])  # 66% completed
                watch_time = lecture.duration_minutes * 60 if is_completed else random.randint(0, lecture.duration_minutes * 60)
                
                LectureProgress.objects.get_or_create(
                    enrollment=enrollment,
                    lecture=lecture,
                    defaults={
                        'completed': is_completed,
                        'watch_time_seconds': watch_time,
                        'last_position': watch_time,
                        'completed_at': timezone.now() - timedelta(days=random.randint(1, 20)) if is_completed else None,
                    }
                )

        # Create notes for enrolled students
        all_enrollments_for_notes = Enrollment.objects.all()
        for enrollment in all_enrollments_for_notes:
            # Get more lectures per enrollment
            lectures = Lecture.objects.filter(section__course=enrollment.course)[:8]
            for lecture in lectures:
                note_texts = [
                    'Important concept to remember',
                    'Need to review this section',
                    'Great explanation!',
                    'Key takeaway: Practice makes perfect',
                    'Question: How does this relate to previous topics?',
                    'This is a key point I should memorize',
                    'Excellent example provided here',
                    'I need to practice this more',
                    'This connects to what we learned earlier',
                    'Important formula to remember',
                ]
                # Create multiple notes per lecture (some students take multiple notes)
                num_notes = random.randint(1, 2)
                for _ in range(num_notes):
                    Note.objects.get_or_create(
                        enrollment=enrollment,
                        lecture=lecture,
                        content=random.choice(note_texts),
                        defaults={
                            'timestamp': random.randint(0, lecture.duration_minutes * 60),
                            'is_public': random.choice([True, False]),
                        }
                    )

        # Create more session registrations for physical courses (all students)
        physical_enrollments = Enrollment.objects.filter(course__modality__in=['physical', 'hybrid'])
        # Also enroll more students in physical courses
        for course in Course.objects.filter(modality__in=['physical', 'hybrid']):
            batch = course.batches.first()
            if batch:
                for stu in students[:4]:  # Enroll 4 students
                    enrollment, _ = Enrollment.objects.get_or_create(
                        user=stu,
                        course=course,
                        defaults={
                            'status': 'active',
                            'progress_percent': random.randint(10, 50),
                        }
                    )
                    if enrollment.batch != batch:
                        enrollment.batch = batch
                        enrollment.save()
                    
                    # Register for multiple sessions
                    sessions = batch.sessions.all()[:10]
                    for session in sessions:
                        SessionRegistration.objects.get_or_create(
                            enrollment=enrollment,
                            session=session,
                            defaults={
                                'status': random.choice(['registered', 'registered', 'registered', 'cancelled', 'waitlisted']),
                            }
                        )

        # Create more attendance records for all past sessions
        all_physical_enrollments = Enrollment.objects.filter(course__modality__in=['physical', 'hybrid'])
        for enrollment in all_physical_enrollments:
            batch = enrollment.batch
            if batch:
                # Get all past sessions (create some if needed)
                past_sessions = batch.sessions.filter(start_datetime__lt=timezone.now())
                
                # If no past sessions, create some
                if past_sessions.count() == 0:
                    for i in range(5):
                        session_date = timezone.now().date() - timedelta(days=(i+1)*7)
                        start_datetime = timezone.make_aware(
                            datetime.combine(session_date, datetime.min.time().replace(hour=14, minute=0))
                        )
                        end_datetime = start_datetime + timedelta(hours=2)
                        
                        past_session, _ = BatchSession.objects.get_or_create(
                            batch=batch,
                            session_number=100+i,  # High number to avoid conflicts
                            start_datetime=start_datetime,
                            defaults={
                                'title': f'Past Session {i+1}',
                                'end_datetime': end_datetime,
                                'location': 'Main Campus - Room 101',
                                'description': f'Past session for attendance tracking.',
                                'is_active': True,
                            }
                        )
                        past_sessions = BatchSession.objects.filter(batch=batch, start_datetime__lt=timezone.now())
                
                # Create attendance for all past sessions
                for session in past_sessions:
                    # Ensure registration exists
                    SessionRegistration.objects.get_or_create(
                        enrollment=enrollment,
                        session=session,
                        defaults={'status': 'registered'}
                    )
                    
                    # Create attendance record
                    Attendance.objects.get_or_create(
                        enrollment=enrollment,
                        session=session,
                        defaults={
                            'present': random.choice([True, True, True, False]),  # 75% attendance
                            'note': 'Attended session' if random.choice([True, True, True, False]) else 'Absent - notified instructor',
                            'checked_in_at': session.start_datetime + timedelta(minutes=random.randint(0, 15)),
                        }
                    )

        # Mark some enrollments as completed and create certificates
        # Complete more enrollments (about 30-40% of all enrollments)
        enrollments_to_complete = Enrollment.objects.all()[:10]
        for enrollment in enrollments_to_complete:
            enrollment.status = 'completed'
            enrollment.progress_percent = 100
            enrollment.save()
            
            Certificate.objects.get_or_create(
                enrollment=enrollment,
                defaults={
                    'issued_at': timezone.now() - timedelta(days=random.randint(1, 60)),
                }
            )

        # Create more forum posts and replies for all courses
        for course in all_courses:
            forum, _ = Forum.objects.get_or_create(course=course)
            
            # Create multiple posts per course
            post_titles = [
                f'Welcome to {course.title} Discussion',
                f'Question about {course.title}',
                f'Help needed with {course.title}',
                f'Sharing my experience with {course.title}',
            ]
            
            for i, title in enumerate(post_titles[:3]):
                stu = students[i % len(students)] if students else student
                post, _ = Post.objects.get_or_create(
                    forum=forum,
                    user=stu,
                    title=title,
                    defaults={
                        'content': f'This is a discussion post about {course.title}. Feel free to share your thoughts and ask questions!',
                        'post_type': random.choice(['discussion', 'question', 'announcement']),
                        'is_pinned': i == 0,
                        'is_locked': False,
                    }
                )
                
                # Create multiple replies for each post
                for reply_idx, reply_stu in enumerate(students[:3], 1):
                    Reply.objects.get_or_create(
                        post=post,
                        user=reply_stu,
                        content=f'Reply {reply_idx}: Great post! Here is my response based on my experience.',
                        defaults={
                            'is_answer': reply_idx == 1 and post.post_type == 'question',
                        }
                    )

        # Create more resources for courses
        resource_types = ['pdf', 'link', 'video', 'document', 'code']
        resource_titles = [
            'Course Materials',
            'Additional Resources',
            'Reference Guide',
            'Practice Exercises',
            'Code Examples',
            'Supplementary Reading',
        ]
        for course in all_courses:
            # Create 2-3 resources per course
            num_resources = random.randint(2, 3)
            for i in range(num_resources):
                Resource.objects.get_or_create(
                    course=course,
                    title=f'{course.title} - {random.choice(resource_titles)} {i+1}',
                    defaults={
                        'resource_type': random.choice(resource_types),
                        'external_url': f'https://example.com/resources/{course.slug}/{i+1}',
                        'description': f'Additional learning resources and materials for {course.title}.',
                        'is_active': True,
                        'order': i + 1,
                    }
                )

        # Create more notifications for different users
        notification_templates = [
            {'title': 'Course Update Available', 'message': 'New content has been added to one of your enrolled courses!', 'type': 'info'},
            {'title': 'Assignment Graded', 'message': 'Your assignment has been graded. Check your course for feedback.', 'type': 'success'},
            {'title': 'New Quiz Available', 'message': 'A new quiz is now available in one of your courses.', 'type': 'info'},
            {'title': 'Certificate Ready', 'message': 'Congratulations! Your certificate is ready for download.', 'type': 'success'},
            {'title': 'Session Reminder', 'message': 'You have an upcoming session scheduled. Don\'t forget to attend!', 'type': 'warning'},
            {'title': 'Payment Successful', 'message': 'Your payment has been processed successfully.', 'type': 'success'},
            {'title': 'Course Recommendation', 'message': 'Based on your interests, we recommend checking out this new course.', 'type': 'info'},
        ]
        
        for stu in students:
            # Create 3-5 notifications per student
            num_notifications = random.randint(3, 5)
            for i in range(num_notifications):
                template = random.choice(notification_templates)
                Notification.objects.get_or_create(
                    user=stu,
                    title=template['title'],
                    message=template['message'],
                    defaults={
                        'notification_type': template['type'],
                        'is_read': random.choice([True, False, False]),  # 33% read
                    }
                )

        # Create prerequisites (courses that require other courses)
        # Example: Advanced courses require beginner courses
        prerequisite_mappings = [
            # Django requires Python
            ('django-web-development', 'python-for-beginners'),
            # Full Stack requires both Django and React
            ('full-stack-django-react', 'django-web-development'),
            ('full-stack-django-react', 'react-complete-guide'),
            # Node.js requires some JavaScript knowledge (could be React)
            ('nodejs-backend-development', 'react-complete-guide'),
        ]
        
        for course_slug, required_slug in prerequisite_mappings:
            try:
                course = Course.objects.get(slug=course_slug)
                required_course = Course.objects.get(slug=required_slug)
                Prerequisite.objects.get_or_create(
                    course=course,
                    required_course=required_course,
                )
            except Course.DoesNotExist:
                pass  # Skip if course doesn't exist

        self.stdout.write(self.style.SUCCESS('\n✅ Successfully seeded database!'))
        self.stdout.write('\n📊 Created:')
        self.stdout.write(f'  - {Course.objects.count()} courses')
        self.stdout.write(f'    • Online: {Course.objects.filter(modality="online").count()}')
        self.stdout.write(f'    • Physical: {Course.objects.filter(modality="physical").count()}')
        self.stdout.write(f'    • Hybrid: {Course.objects.filter(modality="hybrid").count()}')
        self.stdout.write(f'  - {Batch.objects.count()} batches')
        self.stdout.write(f'    • Physical Classes: {Batch.objects.filter(batch_type="physical").count()}')
        self.stdout.write(f'    • Internships: {Batch.objects.filter(batch_type="internship").count()}')
        self.stdout.write(f'    • Bootcamps: {Batch.objects.filter(batch_type="bootcamp").count()}')
        self.stdout.write(f'  - {BatchSession.objects.count()} batch sessions')
        self.stdout.write(f'  - {SessionRegistration.objects.count()} session registrations')
        self.stdout.write(f'  - {Attendance.objects.count()} attendance records')
        self.stdout.write(f'  - {CourseSection.objects.count()} sections')
        self.stdout.write(f'  - {Lecture.objects.count()} lectures')
        self.stdout.write(f'  - {Quiz.objects.count()} quizzes')
        self.stdout.write(f'  - {Question.objects.count()} questions')
        self.stdout.write(f'  - {Assignment.objects.count()} assignments')
        self.stdout.write(f'  - {Review.objects.count()} reviews')
        self.stdout.write(f'  - {QandA.objects.count()} Q&As')
        self.stdout.write(f'  - {Announcement.objects.count()} announcements')
        self.stdout.write(f'  - {Enrollment.objects.count()} enrollments')
        self.stdout.write(f'  - {Cart.objects.count()} carts')
        self.stdout.write(f'  - {CartItem.objects.count()} cart items')
        self.stdout.write(f'  - {Payment.objects.count()} payments')
        self.stdout.write(f'  - {QuizAttempt.objects.count()} quiz attempts')
        self.stdout.write(f'  - {AssignmentSubmission.objects.count()} assignment submissions')
        self.stdout.write(f'  - {LectureProgress.objects.count()} lecture progress records')
        self.stdout.write(f'  - {Note.objects.count()} notes')
        self.stdout.write(f'  - {Post.objects.count()} forum posts')
        self.stdout.write(f'  - {Reply.objects.count()} forum replies')
        self.stdout.write(f'  - {Certificate.objects.count()} certificates')
        self.stdout.write(f'  - {Prerequisite.objects.count()} prerequisites')
        self.stdout.write(f'  - {QuestionOption.objects.count()} question options')
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
