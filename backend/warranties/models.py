from django.db import models
from django.conf import settings
from datetime import date
import uuid


class Warranty(models.Model):
    """Warranty model for storing product warranty information."""
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Expiring Soon', 'Expiring Soon'),
        ('Expired', 'Expired'),
    ]
    
    CATEGORY_CHOICES = [
        ('Electronics', 'Electronics'),
        ('Home Appliances', 'Home Appliances'),
        ('Furniture', 'Furniture'),
        ('Automotive', 'Automotive'),
        ('Accessories', 'Accessories'),
        ('Other', 'Other'),
    ]
    
    PERIOD_UNIT_CHOICES = [
        ('days', 'Days'),
        ('months', 'Months'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='warranties'
    )
    product_name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    warranty_period = models.IntegerField(default=12, help_text="Warranty duration in months or days")
    warranty_period_unit = models.CharField(max_length=10, choices=PERIOD_UNIT_CHOICES, default='months', help_text="Unit for warranty period (days or months)")
    purchase_date = models.DateField()
    expiry_date = models.DateField(blank=True, null=True)
    receipt_file = models.FileField(upload_to='receipts/%Y/%m/', null=True, blank=True, help_text="Uploaded receipt/warranty document")
    share_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, help_text="Unique token for public sharing")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Check if this is an update (has pk) or a new instance
        is_update = self.pk is not None
        
        if is_update:
            # Get the old instance to compare
            try:
                old_instance = Warranty.objects.get(pk=self.pk)
                # Check if warranty_period or purchase_date changed
                period_changed = old_instance.warranty_period != self.warranty_period
                date_changed = old_instance.purchase_date != self.purchase_date
                
                # If either changed and expiry_date wasn't manually set, recalculate
                if (period_changed or date_changed) and self.purchase_date and self.warranty_period:
                    # Only recalculate if the expiry_date wasn't explicitly changed by the user
                    # We can tell if user set it by checking if it's different from the old calculated value
                    old_calculated = old_instance.calculate_expiry_date() if old_instance.purchase_date and old_instance.warranty_period else None
                    if self.expiry_date == old_instance.expiry_date or self.expiry_date == old_calculated:
                        self.expiry_date = self.calculate_expiry_date()
            except Warranty.DoesNotExist:
                pass
        else:
            # New instance - calculate expiry_date if not provided
            if not self.expiry_date and self.purchase_date and self.warranty_period:
                self.expiry_date = self.calculate_expiry_date()
        
        super().save(*args, **kwargs)

    def calculate_expiry_date(self):
        """Calculate expiry date based on purchase date and warranty period (days or months)."""
        from datetime import timedelta
        import calendar
        
        if self.warranty_period_unit == 'days':
            # For days, simply add the number of days
            return self.purchase_date + timedelta(days=self.warranty_period)
        else:
            # For months, use the existing logic
            month = self.purchase_date.month - 1 + self.warranty_period
            year = self.purchase_date.year + month // 12
            month = month % 12 + 1
            day = min(self.purchase_date.day, calendar.monthrange(year, month)[1])
            return date(year, month, day)
    
    class Meta:
        db_table = 'warranties'
        verbose_name = 'Warranty'
        verbose_name_plural = 'Warranties'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.product_name} - {self.brand}"
    
    @property
    def status(self):
        """Calculate warranty status based on expiry date."""
        today = date.today()
        
        if self.expiry_date < today:
            return 'Expired'
        
        days_until_expiry = (self.expiry_date - today).days
        
        if days_until_expiry <= 30:
            return 'Expiring Soon'
        
        return 'Active'
    
    @property
    def days_remaining(self):
        """Calculate days remaining until expiry."""
        today = date.today()
        if self.expiry_date < today:
            return 0
        return (self.expiry_date - today).days
