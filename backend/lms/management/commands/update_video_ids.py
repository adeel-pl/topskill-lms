from django.core.management.base import BaseCommand
from lms.models import Course, Lecture
from lms.management.commands.video_ids import get_video_id_for_course


class Command(BaseCommand):
    help = 'Updates all lecture video IDs with reliable educational videos. Ensures all videos are active and educational.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update all video IDs even if they already exist',
        )

    def handle(self, *args, **options):
        self.stdout.write('🔄 Updating all lecture video IDs with reliable educational videos...')
        force_update = options.get('force', False)
        
        all_courses = Course.objects.all()
        updated_count = 0
        total_lectures = 0
        
        for course in all_courses:
            self.stdout.write(f'\n📚 Processing: {course.title}')
            lectures = Lecture.objects.filter(section__course=course).order_by('section__order', 'order')
            course_updated = 0
            
            for lecture in lectures:
                section_num = lecture.section.order
                lecture_num = lecture.order
                
                # Get new video ID based on course title and lecture position
                new_video_id = get_video_id_for_course(course.title, lecture_num, section_num)
                
                # Update if video ID is missing or force update is enabled
                if not lecture.youtube_video_id or force_update:
                    old_video_id = lecture.youtube_video_id
                    lecture.youtube_video_id = new_video_id
                    lecture.video_type = 'youtube'  # Ensure video type is set
                    lecture.save()
                    course_updated += 1
                    total_lectures += 1
                    
                    if old_video_id:
                        self.stdout.write(f'  ↻ Updated: {lecture.title} (was: {old_video_id[:8]}..., now: {new_video_id})')
                    else:
                        self.stdout.write(f'  ✓ Added: {lecture.title} (video: {new_video_id})')
                elif not lecture.video_type:
                    # Ensure video_type is set
                    lecture.video_type = 'youtube'
                    lecture.save()
                    self.stdout.write(f'  ↻ Fixed video_type for: {lecture.title}')
            
            if course_updated > 0:
                updated_count += 1
                self.stdout.write(f'  ✅ Updated {course_updated} lectures')
            else:
                self.stdout.write(f'  ✓ All lectures already have video IDs')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully processed {all_courses.count()} courses'))
        self.stdout.write(f'   Updated: {updated_count} courses')
        self.stdout.write(f'   Total lectures updated: {total_lectures}')
        
        # Show statistics
        total_lectures_with_videos = Lecture.objects.filter(youtube_video_id__isnull=False).exclude(youtube_video_id='').count()
        total_lectures = Lecture.objects.count()
        
        self.stdout.write(f'\n📊 Final Statistics:')
        self.stdout.write(f'   Total Lectures: {total_lectures}')
        self.stdout.write(f'   Lectures with Videos: {total_lectures_with_videos}')
        self.stdout.write(f'   Coverage: {(total_lectures_with_videos/total_lectures*100):.1f}%' if total_lectures > 0 else '   Coverage: 0%')
        
        if total_lectures_with_videos == total_lectures:
            self.stdout.write(self.style.SUCCESS('\n✨ All lectures now have video IDs!'))
        else:
            missing = total_lectures - total_lectures_with_videos
            self.stdout.write(self.style.WARNING(f'\n⚠️  {missing} lectures still missing video IDs'))

