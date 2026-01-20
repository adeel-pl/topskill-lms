from django.core.management.base import BaseCommand
from lms.models import Enrollment, Certificate


class Command(BaseCommand):
    help = 'Create certificates for completed enrollments that are missing certificates'

    def handle(self, *args, **options):
        self.stdout.write('🔍 Checking for completed enrollments without certificates...')
        
        # Find completed enrollments without certificates
        completed_enrollments = Enrollment.objects.filter(
            status='completed',
            progress_percent__gte=100
        )
        
        created_count = 0
        for enrollment in completed_enrollments:
            # Check if certificate already exists
            if not hasattr(enrollment, 'certificate'):
                certificate, created = Certificate.objects.get_or_create(enrollment=enrollment)
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✅ Created certificate for: {enrollment.user.username} - {enrollment.course.title}'
                        )
                    )
                else:
                    self.stdout.write(
                        f'ℹ️  Certificate already exists for: {enrollment.user.username} - {enrollment.course.title}'
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✨ Created {created_count} new certificate(s) for completed enrollments.'
            )
        )


