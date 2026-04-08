"""
Development settings for AIMO.
"""
from .base import *

DEBUG = True

# ─── Database ─────────────────────────────────────────────────────────────────
# Database (SQLite for development - switch to PostgreSQL in production)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
    # Uncomment below for PostgreSQL when Docker is running
    # 'default': {
    #     'ENGINE': 'django.db.backends.postgresql',
    #     'NAME': os.environ.get('DB_NAME', 'aimo_db'),
    #     'USER': os.environ.get('DB_USER', 'postgres'),
    #     'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
    #     'HOST': os.environ.get('DB_HOST', 'localhost'),
    #     'PORT': os.environ.get('DB_PORT', '5432'),
    #     'CONN_MAX_AGE': 60,
    #     'OPTIONS': {
    #         'connect_timeout': 10,
    #     },
    # }
}

# ─── Email (console in dev) ───────────────────────────────────────────────────
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ─── CORS (allow all in dev) ─────────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True

# ─── Django Debug Toolbar (optional) ─────────────────────────────────────────
# Uncomment if you install django-debug-toolbar
# INSTALLED_APPS += ['debug_toolbar']
# MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
# INTERNAL_IPS = ['127.0.0.1']
