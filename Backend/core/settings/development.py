from .base import *

# ========= Database Settings ========= #
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ========= Email Settings ========= #
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'amingholami06@gmail.com'
EMAIL_HOST_PASSWORD = 'oojt ugkq exew ofbs'
DEFAULT_FROM_EMAIL = 'amingholami06@gmail.com'

# ========= Cache Settings ========= #
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}
