from django.contrib import admin
from .models import Warranty


@admin.register(Warranty)
class WarrantyAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'brand', 'category', 'user', 'purchase_date', 'expiry_date', 'status', 'created_at')
    list_filter = ('category', 'purchase_date', 'expiry_date')
    search_fields = ('product_name', 'brand', 'user__email')
    date_hierarchy = 'purchase_date'
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Product Information', {
            'fields': ('product_name', 'brand', 'category')
        }),
        ('Warranty Details', {
            'fields': ('purchase_date', 'expiry_date', 'document', 'notes')
        }),
        ('User', {
            'fields': ('user',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
