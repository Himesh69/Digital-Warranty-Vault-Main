from rest_framework import serializers
from .models import Warranty


class WarrantySerializer(serializers.ModelSerializer):
    """Full warranty serializer with all details."""
    
    status = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    receipt_file_url = serializers.SerializerMethodField()
    
    def get_receipt_file_url(self, obj):
        """Return the full URL for the receipt file if it exists."""
        if obj.receipt_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt_file.url)
            return obj.receipt_file.url
        return None
    
    class Meta:
        model = Warranty
        fields = (
            'id', 'product_name', 'brand', 'category',
            'purchase_date', 'warranty_period', 'warranty_period_unit', 'expiry_date', 'status', 'days_remaining',
            'receipt_file', 'receipt_file_url', 'share_token', 'notes', 'user_email', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'expiry_date', 'share_token', 'created_at', 'updated_at', 'receipt_file_url')


class WarrantyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    
    status = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    
    class Meta:
        model = Warranty
        fields = (
            'id', 'product_name', 'brand', 'category',
            'purchase_date', 'warranty_period', 'warranty_period_unit', 'expiry_date', 'status', 'days_remaining', 'share_token'
        )


class WarrantyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating warranties."""
    
    warranty_period = serializers.IntegerField(min_value=1, default=12)
    warranty_period_unit = serializers.ChoiceField(choices=['days', 'months'], default='months')
    expiry_date = serializers.DateField(required=False, allow_null=True)
    
    class Meta:
        model = Warranty
        fields = (
            'product_name', 'brand', 'category',
            'purchase_date', 'warranty_period', 'warranty_period_unit', 'expiry_date', 'receipt_file', 'notes'
        )
    
    def validate(self, data):
        """No longer need to validate expiry vs purchase since expiry is calculated."""
        return data


class PublicWarrantySerializer(serializers.ModelSerializer):
    """Read-only serializer for publicly shared warranties via QR code."""
    
    receipt_file_url = serializers.SerializerMethodField()
    status = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    
    def get_receipt_file_url(self, obj):
        """Return the full URL for the receipt file if it exists."""
        if obj.receipt_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt_file.url)
            return obj.receipt_file.url
        return None
    
    class Meta:
        model = Warranty
        fields = (
            'product_name', 'brand', 'category',
            'purchase_date', 'warranty_period', 'warranty_period_unit', 'expiry_date',
            'status', 'days_remaining', 'receipt_file_url'
        )
        read_only_fields = (
            'product_name', 'brand', 'category',
            'purchase_date', 'warranty_period', 'warranty_period_unit', 'expiry_date',
            'status', 'days_remaining', 'receipt_file_url'
        )

