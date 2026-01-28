"""
Django settings for warranty_vault project.
"""

from pathlib import Path
from datetime import timedelta
import os
from decouple import config, Csv
import dj_database_url
# import pytesseract  # Removed - OCR feature disabled

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-your-secret-key-here-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# Railway-specific configuration
if 'RAILWAY_ENVIRONMENT' in os.environ:
    # Railway provides a dynamic domain
    RAILWAY_STATIC_URL = os.environ.get('RAILWAY_STATIC_URL', '')
    if RAILWAY_STATIC_URL:
        railway_domain = RAILWAY_STATIC_URL.replace('https://', '').replace('http://', '')
        if railway_domain not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(railway_domain)
    
    # Also allow .railway.app domains
    if '.railway.app' not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append('.railway.app')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'users',
    'warranties',
    'notifications',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add WhiteNoise for static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'warranty_vault.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'warranty_vault.wsgi.application'

# Database - PostgreSQL
# Use DATABASE_URL in production (Render), fallback to local config
DATABASE_URL = config('DATABASE_URL', default=None)

if DATABASE_URL:
    # Production: Use DATABASE_URL from environment
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL)
    }
else:
    # Local development: Use individual settings
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='warranty_vault'),
            'USER': config('DB_USER', default='warranty_user'),
            'PASSWORD': config('DB_PASSWORD', default='1234'),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise configuration for production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'users.User'

# Custom Authentication Backend for email-based auth
AUTHENTICATION_BACKENDS = [
    'users.authentication.EmailBackend',
]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
}

# CORS Settings
# In development, allow all origins; in production, specify allowed origins
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)
    CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='', cast=Csv())

CORS_ALLOW_CREDENTIALS = True

# Tesseract OCR Configuration (local development only)
# Note: Tesseract is NOT available on Render free tier
TESSERACT_CMD = config('TESSERACT_CMD', default='')
# OCR feature disabled - pytesseract removed
# if TESSERACT_CMD and os.path.exists(TESSERACT_CMD):
#     pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

# Set Poppler path for PDF processing (local development only)
POPPLER_PATH = config('POPPLER_PATH', default='')

# Cloud OCR Configuration (for production deployment)
USE_CLOUD_OCR = config('USE_CLOUD_OCR', default=False, cast=bool)
OCR_API_KEY = config('OCR_API_KEY', default='')

# Email Configuration

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = f'Warranty Vault <{EMAIL_HOST_USER}>'

# For development/testing: Console backend (prints emails to console)
# Uncomment this to test without sending real emails
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
