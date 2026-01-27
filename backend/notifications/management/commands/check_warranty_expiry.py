from django.core.management.base import BaseCommand
from notifications.services import check_warranties_and_notify


class Command(BaseCommand):
    help = 'Check warranties and send notifications for expiring warranties'

    def handle(self, *args, **options):
        self.stdout.write('Checking warranties for expiry notifications...')
        
        result = check_warranties_and_notify()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'[SUCCESS] Notifications created: {result["notifications_created"]}'
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f'[SUCCESS] Emails sent: {result["emails_sent"]}'
            )
        )
        
        if result["notifications_created"] == 0:
            self.stdout.write(
                self.style.WARNING('No warranties require notifications at this time.')
            )
