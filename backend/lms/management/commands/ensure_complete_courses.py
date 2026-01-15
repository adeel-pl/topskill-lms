from django.core.management.base import BaseCommand
from lms.models import Course, CourseSection, Lecture
from lms.management.commands.seed_data import get_course_lecture_content
from lms.management.commands.video_ids import get_video_id_for_course


class Command(BaseCommand):
    help = 'Ensures all courses have complete sections, lectures, and videos. Fills any missing data.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update all courses even if they already have content',
        )

    def handle(self, *args, **options):
        self.stdout.write('🔄 Ensuring all courses have complete data...')
        force_update = options.get('force', False)
        
        all_courses = Course.objects.all()
        updated_count = 0
        
        for course in all_courses:
            self.stdout.write(f'\n📚 Processing: {course.title}')
            
            # Get course-specific lecture content
            lecture_content = get_course_lecture_content(course.title)
            
            # Ensure course has sections
            sections_created = 0
            lectures_created = 0
            
            for section_idx, section_data in enumerate(lecture_content['sections'], 1):
                section, created = CourseSection.objects.get_or_create(
                    course=course,
                    title=section_data['title'],
                    defaults={
                        'order': section_idx,
                        'is_preview': section_idx == 1,  # First section is preview
                    }
                )
                
                if created:
                    sections_created += 1
                    self.stdout.write(f'  ✓ Created section: {section.title}')
                elif force_update:
                    # Update section order if needed
                    if section.order != section_idx:
                        section.order = section_idx
                        section.is_preview = (section_idx == 1)
                        section.save()
                        self.stdout.write(f'  ↻ Updated section: {section.title}')
                
                # Ensure section has all lectures
                for lecture_idx, lecture_data in enumerate(section_data['lectures'], 1):
                    video_id = get_video_id_for_course(course.title, lecture_idx, section_idx)
                    
                    lecture, created = Lecture.objects.get_or_create(
                        section=section,
                        title=lecture_data['title'],
                        defaults={
                            'order': lecture_idx,
                            'description': lecture_data['description'],
                            'youtube_video_id': video_id,
                            'duration_minutes': lecture_data['duration'],
                            'is_preview': section_idx == 1 and lecture_idx == 1,  # First lecture is preview
                            'video_type': 'youtube',
                        }
                    )
                    
                    if created:
                        lectures_created += 1
                        self.stdout.write(f'    ✓ Created lecture: {lecture.title}')
                    elif force_update:
                        # Update lecture if needed
                        updated = False
                        if not lecture.youtube_video_id:
                            lecture.youtube_video_id = video_id
                            updated = True
                        if not lecture.description:
                            lecture.description = lecture_data['description']
                            updated = True
                        if lecture.duration_minutes == 0:
                            lecture.duration_minutes = lecture_data['duration']
                            updated = True
                        if lecture.order != lecture_idx:
                            lecture.order = lecture_idx
                            updated = True
                        if updated:
                            lecture.save()
                            self.stdout.write(f'    ↻ Updated lecture: {lecture.title}')
            
            # If course has no sections, create default sections
            if course.sections.count() == 0:
                self.stdout.write(f'  ⚠️  Course has no sections, creating default sections...')
                default_content = {
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
                
                for section_idx, section_data in enumerate(default_content['sections'], 1):
                    section = CourseSection.objects.create(
                        course=course,
                        title=section_data['title'],
                        order=section_idx,
                        is_preview=section_idx == 1,
                    )
                    sections_created += 1
                    self.stdout.write(f'  ✓ Created section: {section.title}')
                    
                    for lecture_idx, lecture_data in enumerate(section_data['lectures'], 1):
                        video_id = get_video_id_for_course(course.title, lecture_idx, section_idx)
                        Lecture.objects.create(
                            section=section,
                            title=lecture_data['title'],
                            order=lecture_idx,
                            description=lecture_data['description'],
                            youtube_video_id=video_id,
                            duration_minutes=lecture_data['duration'],
                            is_preview=section_idx == 1 and lecture_idx == 1,
                            video_type='youtube',
                        )
                        lectures_created += 1
                        self.stdout.write(f'    ✓ Created lecture: {lecture_data["title"]}')
            
            # Update course stats
            total_lectures = Lecture.objects.filter(section__course=course).count()
            total_duration = sum(
                Lecture.objects.filter(section__course=course).values_list('duration_minutes', flat=True) or [0]
            )
            course.total_lectures = total_lectures
            course.total_duration_hours = round(total_duration / 60, 2) if total_duration > 0 else 0
            course.save()
            
            if sections_created > 0 or lectures_created > 0:
                updated_count += 1
                self.stdout.write(f'  ✅ Updated: {sections_created} sections, {lectures_created} lectures')
            else:
                self.stdout.write(f'  ✓ Already complete: {course.sections.count()} sections, {total_lectures} lectures')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully processed {all_courses.count()} courses'))
        self.stdout.write(f'   Updated: {updated_count} courses')
        self.stdout.write(f'\n📊 Final Statistics:')
        self.stdout.write(f'   Total Courses: {Course.objects.count()}')
        self.stdout.write(f'   Total Sections: {CourseSection.objects.count()}')
        self.stdout.write(f'   Total Lectures: {Lecture.objects.count()}')
        
        # Show courses with missing data
        courses_with_issues = []
        for course in Course.objects.all():
            if course.sections.count() == 0:
                courses_with_issues.append(f'{course.title} (no sections)')
            elif Lecture.objects.filter(section__course=course).count() == 0:
                courses_with_issues.append(f'{course.title} (no lectures)')
        
        if courses_with_issues:
            self.stdout.write(self.style.WARNING(f'\n⚠️  Courses with issues:'))
            for issue in courses_with_issues:
                self.stdout.write(f'   - {issue}')
        else:
            self.stdout.write(self.style.SUCCESS('\n✨ All courses have complete data!'))

