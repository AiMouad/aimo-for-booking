"""
Development settings.
"""

from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

# Database – SQLite for quick local dev (override in .env for Postgres)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# CORS – allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Email backend – console for local development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Django Debug Toolbar (optional, install separately)
INSTALLED_APPS += ['django_extensions']

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
