from rest_framework import viewsets, status, parsers, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Q
from datetime import date, timedelta
from .models import Warranty
from .serializers import (
    WarrantySerializer,
    WarrantyListSerializer,
    WarrantyCreateSerializer,
    PublicWarrantySerializer
)


class WarrantyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for warranty CRUD operations.
    
    list: Get all warranties for authenticated user
    create: Create a new warranty
    retrieve: Get warranty details
    update: Update warranty
    destroy: Delete warranty
    """
    
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):
        """Return warranties for the authenticated user only."""
        return Warranty.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return WarrantyListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return WarrantyCreateSerializer
        return WarrantySerializer
    
    def perform_create(self, serializer):
        """Set the user when creating a warranty."""
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Override create to return full warranty data with calculated fields."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the full warranty object with all calculated fields
        instance = serializer.instance
        output_serializer = WarrantySerializer(instance)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get dashboard statistics.
        
        Returns counts for:
        - Total warranties
        - Active warranties
        - Expiring soon (within 30 days)
        - Expired warranties
        """
        user_warranties = self.get_queryset()
        today = date.today()
        expiring_soon_date = today + timedelta(days=30)
        
        total = user_warranties.count()
        expired = user_warranties.filter(expiry_date__lt=today).count()
        expiring_soon = user_warranties.filter(
            expiry_date__gte=today,
            expiry_date__lte=expiring_soon_date
        ).count()
        active = total - expired - expiring_soon
        
        return Response({
            'total_warranties': total,
            'active_warranties': active,
            'expiring_soon': expiring_soon,
            'expired_warranties': expired
        })
    
    @action(detail=False, methods=['post'], parser_classes=[parsers.MultiPartParser, parsers.FormParser])
    def scan_receipt(self, request):
        """Scan uploaded receipt and extract warranty information using OCR."""
        from .ocr_service import ReceiptOCRService
        import os
        import tempfile
        
        if 'file' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = request.FILES['file']
        allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf', 'bmp', 'tiff']
        file_ext = uploaded_file.name.split('.')[-1].lower()
        
        if file_ext not in allowed_extensions:
            return Response(
                {'error': f'Unsupported file type. Allowed: {", ".join(allowed_extensions)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_ext}') as temp_file:
                for chunk in uploaded_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            ocr_service = ReceiptOCRService()
            result = ocr_service.parse_receipt(temp_file_path, file_ext)
            os.unlink(temp_file_path)
            
            if result['success']:
                return Response({
                    'success': True,
                    'message': 'Receipt scanned successfully',
                    'data': result['data'],
                    'confidence': result.get('confidence', 0),
                    'extracted_text_preview': result.get('extracted_text', '')[:200]
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Failed to process receipt'),
                    'data': {}
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            return Response(
                {'error': f'Failed to process receipt: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def check_expiry_cron(request):
    """
    Endpoint for external cron services to trigger warranty expiry checks.
    This allows scheduled tasks to run even on platforms without built-in cron support.
    
    For security, you can add API key authentication or IP whitelisting.
    """
    from django.core.management import call_command
    
    # Optional: Add API key authentication
    # api_key = request.headers.get('X-API-Key')
    # if api_key != settings.CRON_API_KEY:
    #     return Response({'error': 'Unauthorized'}, status=401)
    
    try:
        # Run the warranty expiry check command
        call_command('check_warranty_expiry')
        return Response({
            'status': 'success',
            'message': 'Warranty expiry check completed successfully'
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Failed to run expiry check: {str(e)}'
        }, status=500)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # No authentication required
def public_warranty_view(request, share_token):
    """Public view for shared warranty via QR code. No authentication required."""
    try:
        warranty = Warranty.objects.get(share_token=share_token)
        serializer = PublicWarrantySerializer(warranty, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Warranty.DoesNotExist:
        return Response(
            {'error': 'Warranty not found or link is invalid'},
            status=status.HTTP_404_NOT_FOUND
        )


class PublicWarrantyView(viewsets.ReadOnlyModelViewSet):
    """
    Public view for warranty details (for QR code scanning).
    No authentication required.
    """
    
    permission_classes = (AllowAny,)
    serializer_class = WarrantySerializer
    queryset = Warranty.objects.all()
    lookup_field = 'id'
