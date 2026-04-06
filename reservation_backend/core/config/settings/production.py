"""
Production settings for reservation backend.
"""
from .base import *
import os

# Security
DEBUG = False
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# Database (PostgreSQL for production)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'charset': 'utf8',
        },
        'CONN_MAX_AGE': 60,
    }
}

# Security settings
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'

# Session and cookie security
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

# CORS (restrictive for production)
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

# Cache (Redis for production)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'reservation',
        'TIMEOUT': 300,
    }
}

# Logging (production-ready)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'json': {
            'format': '{"level": "{levelname}", "time": "{asctime}", "module": "{module}", "message": "{message}"}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/django.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'json',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/django_error.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'json',
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'include_html': True,
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['error_file', 'mail_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
        'apps': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'INFO',
    },
}

# Email (production SMTP)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)

# Admin email for errors
ADMINS = [
    (os.getenv('ADMIN_NAME', 'Admin'), os.getenv('ADMIN_EMAIL', 'admin@example.com')),
]

MANAGERS = ADMINS

# Static files (production)
STATIC_URL = '/static/'
STATIC_ROOT = '/var/www/static/'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'

# Media files (production)
MEDIA_URL = '/media/'
MEDIA_ROOT = '/var/www/media/'

# File upload settings (restrictive)
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB
UPLOAD_FILE_MAX_SIZE = 2 * 1024 * 1024  # 2MB

# JWT (production settings)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# REST Framework (production settings)
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'booking': '50/day',
        'property': '200/day',
        'payment': '20/hour',
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
}

# Celery (Redis broker for production)
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://127.0.0.1:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://127.0.0.1:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000

# Database connection pooling
DATABASE_POOL_ARGS = {
    'max_overflow': 10,
    'pool_pre_ping': True,
    'pool_recycle': 300,
}

# Feature flags (controlled by environment)
FEATURES = {
    'ENABLE_CHATBOT': os.getenv('ENABLE_CHATBOT', 'True').lower() == 'true',
    'ENABLE_SMART_SEARCH': os.getenv('ENABLE_SMART_SEARCH', 'True').lower() == 'true',
    'ENABLE_NOTIFICATIONS': os.getenv('ENABLE_NOTIFICATIONS', 'True').lower() == 'true',
    'ENABLE_REVIEWS': os.getenv('ENABLE_REVIEWS', 'True').lower() == 'true',
    'ENABLE_PAYMENTS': os.getenv('ENABLE_PAYMENTS', 'True').lower() == 'true',
}

# Rate limiting (Redis backend)
RATELIMIT_ENABLE = True
RATELIMIT_USE_CACHE = 'default'

# Monitoring and analytics
SENTRY_DSN = os.getenv('SENTRY_DSN', '')
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.celery import CeleryIntegration
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(
                transaction_style='url',
                middleware_spans=True,
                signals_spans=True,
            ),
            CeleryIntegration(
                monitor_beat_tasks=True,
                propagate_traces=True,
            ),
        ],
        traces_sample_rate=0.1,
        send_default_pii=False,
        environment='production',
    )

# Performance monitoring
PERFORMANCE_MONITORING = {
    'ENABLE_QUERY_PROFILING': os.getenv('ENABLE_QUERY_PROFILING', 'False').lower() == 'true',
    'SLOW_QUERY_THRESHOLD': float(os.getenv('SLOW_QUERY_THRESHOLD', 0.5)),
    'ENABLE_REQUEST_LOGGING': os.getenv('ENABLE_REQUEST_LOGGING', 'True').lower() == 'true',
}

# Health checks
HEALTH_CHECKS = {
    'database': 'core.healthchecks.DatabaseHealthCheck',
    'cache': 'core.healthchecks.CacheHealthCheck',
    'celery': 'core.healthchecks.CeleryHealthCheck',
}

# Backup settings
BACKUP_SETTINGS = {
    'ENABLE_AUTO_BACKUP': os.getenv('ENABLE_AUTO_BACKUP', 'True').lower() == 'true',
    'BACKUP_SCHEDULE': os.getenv('BACKUP_SCHEDULE', '0 2 * * *'),  # Daily at 2 AM
    'BACKUP_RETENTION_DAYS': int(os.getenv('BACKUP_RETENTION_DAYS', 30)),
    'BACKUP_STORAGE': os.getenv('BACKUP_STORAGE', 'local'),
}

# Security headers
SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': os.getenv(
        'CSP_POLICY',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;"
    ),
}

# Production-specific middleware
MIDDLEWARE += [
    'core.middleware.SecurityHeadersMiddleware',
    'core.middleware.RequestIDMiddleware',
]
