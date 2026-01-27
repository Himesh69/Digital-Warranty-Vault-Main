"""
ASGI config for warranty_vault project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'warranty_vault.settings')

application = get_asgi_application()
