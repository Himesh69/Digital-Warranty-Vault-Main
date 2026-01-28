from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import WarrantyViewSet, PublicWarrantyView

router = DefaultRouter()
router.register(r'warranties', WarrantyViewSet, basename='warranty')
router.register(r'warranty', PublicWarrantyView, basename='public-warranty')

urlpatterns = [
    path('', include(router.urls)),
    path('share/<uuid:share_token>/', views.public_warranty_view, name='public-warranty-share'),
    path('cron/check-expiry/', views.check_expiry_cron, name='check-expiry-cron'),
]
