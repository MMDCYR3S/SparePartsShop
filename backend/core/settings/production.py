from .base import *
import os

# SECURITY WARNING: keep the secret key used in production secret!
# In production, this should be set as an environment variable
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-%u!=3r1-t0syn&y#_t*^swsj*q8a5a7fhvs72g8kribaxw$3lu')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True').lower() in ['true', 't', '1']

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '*').split(' ')

# Database
# Use the DATABASE_URL environment variable provided by Docker Compose
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'spareparts_db'),
        'USER': os.environ.get('POSTGRES_USER', 'spareparts_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'spareparts_password'),
        'HOST': os.environ.get('DB_HOST', 'db'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:3000", 
    #  پورت 80
    "http://frontend:80",
    "http://87.107.108.77:80",
    "http://armanyadakpart.ir",
    "http://www.armanyadakpart.ir",
    "https://armanyadakpart.ir",
    "https://www.armanyadakpart.ir",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:3000",
    "http://87.107.108.77:80",
    "http://armanyadakpart.ir",
    "http://www.armanyadakpart.ir",
    "https://armanyadakpart.ir",
    "https://www.armanyadakpart.ir",
]

# 2. تنظیمات مربوط به پروکسی (بسیار مهم برای Nginx و Cloudflare)
# این خط به جنگو می‌گوید اگر هدر X-Forwarded-Proto مقدار https داشت، درخواست را امن تلقی کن.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# Email settings
# In production, you would configure these with actual email service credentials
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
# EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
# EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() in ['true', 't', '1']
# EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
# EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
# DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)