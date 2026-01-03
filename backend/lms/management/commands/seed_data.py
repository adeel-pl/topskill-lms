from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from lms.models import (
    Course, CourseSection, Lecture, Category, Tag, 
    Batch, Enrollment, Review, Quiz, Assignment
)
from .video_ids import get_video_id_for_course


class Command(BaseCommand):
    help = 'Seed database with sample data'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-existing',
            action='store_true',
            help='Skip courses that already exist',
        )

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        skip_existing = options.get('skip_existing', False)

        # Create categories
        cat1, _ = Category.objects.get_or_create(name='Programming', slug='programming')
        cat2, _ = Category.objects.get_or_create(name='Web Development', slug='web-development')
        cat3, _ = Category.objects.get_or_create(name='Data Science', slug='data-science')
        cat4, _ = Category.objects.get_or_create(name='Mobile Development', slug='mobile-development')
        cat5, _ = Category.objects.get_or_create(name='Machine Learning', slug='machine-learning')
        cat6, _ = Category.objects.get_or_create(name='DevOps', slug='devops')

        # Create tags
        tag1, _ = Tag.objects.get_or_create(name='Python', slug='python')
        tag2, _ = Tag.objects.get_or_create(name='JavaScript', slug='javascript')
        tag3, _ = Tag.objects.get_or_create(name='Django', slug='django')
        tag4, _ = Tag.objects.get_or_create(name='React', slug='react')
        tag5, _ = Tag.objects.get_or_create(name='Node.js', slug='nodejs')
        tag6, _ = Tag.objects.get_or_create(name='Docker', slug='docker')
        tag7, _ = Tag.objects.get_or_create(name='Kubernetes', slug='kubernetes')
        tag8, _ = Tag.objects.get_or_create(name='TensorFlow', slug='tensorflow')

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

        # Create sections and lectures for all initial courses
        for course in [course1, course2, course3]:
            if course:
                section_titles = [
                    'Introduction and Setup',
                    'Core Concepts',
                    'Advanced Topics'
                ]
                for section_num in range(1, 4):
                    section, _ = CourseSection.objects.get_or_create(
                        course=course,
                        title=section_titles[section_num - 1],
                        defaults={'order': section_num}
                    )
                    lecture_titles = [
                        ['Getting Started', 'Basic Concepts', 'First Steps'],
                        ['Intermediate Topics', 'Working with Data', 'Best Practices'],
                        ['Advanced Features', 'Real-world Examples', 'Project Building']
                    ]
                    for lecture_num in range(1, 4):
                        video_id = get_video_id_for_course(course.title, lecture_num, section_num)
                        Lecture.objects.get_or_create(
                            section=section,
                            title=lecture_titles[section_num - 1][lecture_num - 1],
                            defaults={
                                'order': lecture_num,
                                'description': f'Learn {lecture_titles[section_num - 1][lecture_num - 1].lower()} in {course.title}. This lecture covers essential concepts and practical examples.',
                                'youtube_video_id': video_id,
                                'duration_minutes': 10 + (lecture_num * 5) + (section_num * 2),
                                'is_preview': True if section_num == 1 and lecture_num == 1 else False,
                            }
                        )

        # Create sections and lectures for course1 (old code - keeping for reference)
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

        # Create more courses (20 total courses)
        courses_data = [
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
                'slug': 'machine-learning-python',
                'title': 'Machine Learning with Python',
                'description': 'Learn machine learning algorithms, neural networks, and deep learning with TensorFlow.',
                'short_description': 'Learn ML and deep learning',
                'price': 119.99,
                'level': 'advanced',
                'category': cat5,
                'tags': [tag1, tag8],
            },
            {
                'slug': 'docker-kubernetes-mastery',
                'title': 'Docker & Kubernetes Mastery',
                'description': 'Master containerization and orchestration with Docker and Kubernetes.',
                'short_description': 'Master containers and orchestration',
                'price': 109.99,
                'level': 'intermediate',
                'category': cat6,
                'tags': [tag6, tag7],
            },
            {
                'slug': 'javascript-advanced',
                'title': 'Advanced JavaScript',
                'description': 'Deep dive into advanced JavaScript concepts, ES6+, async programming, and design patterns.',
                'short_description': 'Advanced JavaScript concepts',
                'price': 69.99,
                'level': 'advanced',
                'category': cat1,
                'tags': [tag2],
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
            {
                'slug': 'data-visualization-python',
                'title': 'Data Visualization with Python',
                'description': 'Create stunning visualizations with Matplotlib, Seaborn, and Plotly.',
                'short_description': 'Create data visualizations',
                'price': 79.99,
                'level': 'beginner',
                'category': cat3,
                'tags': [tag1],
            },
            {
                'slug': 'api-development-rest-graphql',
                'title': 'API Development: REST & GraphQL',
                'description': 'Learn to build RESTful APIs and GraphQL APIs with best practices.',
                'short_description': 'Build REST and GraphQL APIs',
                'price': 99.99,
                'level': 'intermediate',
                'category': cat2,
                'tags': [tag2, tag5],
            },
            {
                'slug': 'python-automation-scripting',
                'title': 'Python Automation & Scripting',
                'description': 'Automate tasks and build scripts with Python. Web scraping, file handling, and more.',
                'short_description': 'Automate tasks with Python',
                'price': 59.99,
                'level': 'beginner',
                'category': cat1,
                'tags': [tag1],
            },
            {
                'slug': 'vue-js-complete-guide',
                'title': 'Vue.js - The Complete Guide',
                'description': 'Master Vue.js framework from basics to advanced. Build modern web applications.',
                'short_description': 'Master Vue.js framework',
                'price': 84.99,
                'level': 'intermediate',
                'category': cat2,
                'tags': [tag2, tag4],
            },
            {
                'slug': 'angular-fundamentals',
                'title': 'Angular Fundamentals',
                'description': 'Learn Angular framework, components, services, routing, and state management.',
                'short_description': 'Learn Angular framework',
                'price': 89.99,
                'level': 'intermediate',
                'category': cat2,
                'tags': [tag2],
            },
            {
                'slug': 'mongodb-database-design',
                'title': 'MongoDB Database Design',
                'description': 'Master NoSQL database design with MongoDB. Learn indexing, aggregation, and optimization.',
                'short_description': 'Master MongoDB database',
                'price': 74.99,
                'level': 'intermediate',
                'category': cat2,
                'tags': [tag5],
            },
            {
                'slug': 'postgresql-advanced',
                'title': 'PostgreSQL Advanced',
                'description': 'Advanced PostgreSQL concepts including performance tuning, replication, and optimization.',
                'short_description': 'Advanced PostgreSQL',
                'price': 79.99,
                'level': 'advanced',
                'category': cat2,
                'tags': [tag5],
            },
            {
                'slug': 'aws-cloud-architecture',
                'title': 'AWS Cloud Architecture',
                'description': 'Design and deploy scalable cloud architectures on AWS. EC2, S3, Lambda, and more.',
                'short_description': 'AWS cloud architecture',
                'price': 124.99,
                'level': 'intermediate',
                'category': cat6,
                'tags': [tag6],
            },
            {
                'slug': 'cybersecurity-basics',
                'title': 'Cybersecurity Basics',
                'description': 'Learn cybersecurity fundamentals, ethical hacking, and security best practices.',
                'short_description': 'Cybersecurity fundamentals',
                'price': 94.99,
                'level': 'beginner',
                'category': cat1,
                'tags': [tag1],
            },
            {
                'slug': 'git-github-mastery',
                'title': 'Git & GitHub Mastery',
                'description': 'Master version control with Git and GitHub. Learn branching, merging, and collaboration.',
                'short_description': 'Master Git and GitHub',
                'price': 49.99,
                'level': 'beginner',
                'category': cat1,
                'tags': [tag2],
            },
            {
                'slug': 'typescript-complete-guide',
                'title': 'TypeScript - Complete Guide',
                'description': 'Master TypeScript from basics to advanced. Learn type safety, generics, and modern TypeScript patterns.',
                'short_description': 'Master TypeScript development',
                'price': 89.99,
                'level': 'intermediate',
                'category': cat1,
                'tags': [tag2],
            },
        ]

        all_courses = [course1, course2, course3]
        progress_percentages = [25, 45, 60, 75, 30, 50, 80, 15, 90, 35, 65, 100, 40, 55, 70, 20, 85, 10, 95, 50]

        for idx, course_data in enumerate(courses_data):
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
                # Ensure categories and tags are set even if course exists
                if not course.categories.filter(id=course_data['category'].id).exists():
                    course.categories.add(course_data['category'])
                for tag in course_data['tags']:
                    if not course.tags.filter(id=tag.id).exists():
                        course.tags.add(tag)
            
            # Create sections and lectures (always, if course has no sections)
            if course.sections.count() == 0:
                section_titles = [
                    'Introduction and Setup',
                    'Core Concepts',
                    'Advanced Topics'
                ]
                for section_num in range(1, 4):
                    section, _ = CourseSection.objects.get_or_create(
                        course=course,
                        title=section_titles[section_num - 1],
                        defaults={'order': section_num}
                    )
                    lecture_titles = [
                        ['Getting Started', 'Basic Concepts', 'First Steps'],
                        ['Intermediate Topics', 'Working with Data', 'Best Practices'],
                        ['Advanced Features', 'Real-world Examples', 'Project Building']
                    ]
                    for lecture_num in range(1, 4):
                        video_id = get_video_id_for_course(course.title, lecture_num, section_num)
                        Lecture.objects.get_or_create(
                            section=section,
                            title=lecture_titles[section_num - 1][lecture_num - 1],
                            defaults={
                                'order': lecture_num,
                                'description': f'Learn {lecture_titles[section_num - 1][lecture_num - 1].lower()} in {course.title}. This lecture covers essential concepts and practical examples.',
                                'youtube_video_id': video_id,
                                'duration_minutes': 10 + (lecture_num * 5) + (section_num * 2),
                                'is_preview': True if section_num == 1 and lecture_num == 1 else False,
                            }
                        )
            
            # Add course to all_courses list (whether created or existing)
            if course not in all_courses:
                all_courses.append(course)

        # Create enrollments with different progress percentages (for first 12 courses)
        for idx, course in enumerate(all_courses[:12]):
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
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('USER CREDENTIALS:'))
        self.stdout.write('='*50)
        self.stdout.write('\n🔐 ADMIN USER (Full Access):')
        self.stdout.write('   Username: admin')
        self.stdout.write('   Password: admin123')
        self.stdout.write('   Email: admin@topskill.com')
        self.stdout.write('   Access: Django Admin + Frontend Admin Panel')
        self.stdout.write('\n👨‍🏫 INSTRUCTOR USER:')
        self.stdout.write('   Username: instructor')
        self.stdout.write('   Password: instructor123')
        self.stdout.write('   Email: instructor@topskill.com')
        self.stdout.write('   Access: Can create and manage courses')
        self.stdout.write('\n👨‍🎓 STUDENT USER:')
        self.stdout.write('   Username: student')
        self.stdout.write('   Password: student123')
        self.stdout.write('   Email: student@topskill.com')
        self.stdout.write('   Access: Can enroll in courses and track progress')
        self.stdout.write('\n' + '='*50)
        self.stdout.write('\n💡 TIP: Use these credentials to login at:')
        self.stdout.write('   Frontend: http://localhost:3000/login')
        self.stdout.write('   Django Admin: http://localhost:8000/admin')
        self.stdout.write('='*50)




