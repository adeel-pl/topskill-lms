from django.core.management.base import BaseCommand
from lms.models import Course


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


class Command(BaseCommand):
    help = 'Update course thumbnails with relevant images based on course titles'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Update thumbnails even if they already exist',
        )

    def handle(self, *args, **options):
        self.stdout.write('🖼️  Updating course thumbnails...')
        force = options.get('force', False)
        
        courses = Course.objects.all()
        updated_count = 0
        skipped_count = 0
        
        for course in courses:
            # Skip if course already has a thumbnail and force is not set
            if course.thumbnail and not force:
                skipped_count += 1
                continue
            
            # Get thumbnail based on course title
            thumbnail_url = get_course_thumbnail(course.title)
            course.thumbnail = thumbnail_url
            course.save()
            updated_count += 1
            self.stdout.write(f'  ✓ Updated: {course.title}')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully updated {updated_count} courses'))
        if skipped_count > 0:
            self.stdout.write(f'⏭️  Skipped {skipped_count} courses (already have thumbnails)')
            self.stdout.write('💡 Use --force to update all courses')




