"""
AIMO API – Root URL Configuration
All API endpoints at: /api/...
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import (
    SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView,
    TokenVerifyView, TokenBlacklistView,
)

# ─── App ViewSets ─────────────────────────────────────────────────────────────
from apps.users.views import UserViewSet
from apps.properties.views import PropertyViewSet, ApartmentViewSet
from apps.bookings.views import BookingViewSet, MyBookingViewSet
from apps.workers.views import WorkerViewSet, WorkerScheduleViewSet
from apps.chatbot.views import ChatSessionViewSet
from apps.notifications.views import NotificationViewSet

# ─── Router ───────────────────────────────────────────────────────────────────
router = DefaultRouter()
router.register(r'users',             UserViewSet,          basename='user')
router.register(r'properties',        PropertyViewSet,      basename='property')
router.register(r'apartments',        ApartmentViewSet,     basename='apartment')
router.register(r'bookings',          BookingViewSet,       basename='booking')
router.register(r'my-bookings',       MyBookingViewSet,     basename='my-booking')
router.register(r'workers',           WorkerViewSet,        basename='worker')
router.register(r'worker-schedules',  WorkerScheduleViewSet,basename='worker-schedule')
router.register(r'chatbot/conversations', ChatSessionViewSet, basename='chatbot-conversation')
router.register(r'notifications',     NotificationViewSet,  basename='notification')

urlpatterns = [
    # ── Django Admin ──────────────────────────────────────────────────────────
    path('admin/', admin.site.urls),

    # ── Router endpoints (/api/users/, /api/properties/, etc.) ───────────────
    path('api/', include(router.urls)),

    # ── JWT Auth ──────────────────────────────────────────────────────────────
    path('api/auth/token/',           TokenObtainPairView.as_view(),  name='token_obtain_pair'),
    path('api/auth/token/refresh/',   TokenRefreshView.as_view(),     name='token_refresh'),
    path('api/auth/token/verify/',    TokenVerifyView.as_view(),      name='token_verify'),
    path('api/auth/token/blacklist/', TokenBlacklistView.as_view(),   name='token_blacklist'),

    # ── Chatbot chat/suggest/tips endpoints ───────────────────────────────────
    path('api/chatbot/', include('apps.chatbot.urls')),

    # ── Analytics ─────────────────────────────────────────────────────────────
    path('api/analytics/', include('apps.bookings.analytics_urls')),

    # ── API Schema & Docs ─────────────────────────────────────────────────────
    path('api/schema/', SpectacularAPIView.as_view(),            name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/',  SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),
]

# Serve media/static in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,  document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
