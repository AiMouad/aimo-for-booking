"""
URL configuration for reservation_backend project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Schema & Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # App routes
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/services/', include('apps.services.urls')),
    path('api/v1/reservations/', include('apps.reservations.urls')),
    path('api/v1/workers/', include('apps.workers.urls')),
    path('api/v1/chatbot/', include('apps.chatbot.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
