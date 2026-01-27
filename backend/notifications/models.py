from django.db import models
from django.conf import settings
from warranties.models import Warranty


class Notification(models.Model):
    """Notification model for warranty expiry alerts."""
    
    NOTIFICATION_TYPES = [
        ('30_days', '30 Days Before Expiry'),
        ('20_days', '20 Days Before Expiry'),
        ('10_days', '10 Days Before Expiry'),
        ('3_days', '3 Days Before Expiry'),
        ('2_days', '2 Days Before Expiry'),
        ('1_day', '1 Day Before Expiry'),
        ('expired', 'Warranty Expired'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    warranty = models.ForeignKey(
        Warranty,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    email_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['warranty', 'notification_type']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
