"""
URL configuration for reservation backend.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# Health check endpoint
def health_check(request):
    """Simple health check endpoint."""
    return JsonResponse({
        'status': 'healthy',
        'version': '1.0.0',
        'service': 'reservation-backend',
    })

# API documentation
urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Health check
    path('health/', health_check, name='health-check'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API v1 endpoints
    path('api/v1/', include([
        # Authentication endpoints
        path('auth/', include('apps.users.urls')),
        
        # Property endpoints
        path('properties/', include('apps.properties.urls')),
        
        # Booking endpoints
        path('bookings/', include('apps.bookings.urls')),
        
        # Payment endpoints
        path('payments/', include('apps.payments.urls')),
        
        # Review endpoints
        path('reviews/', include('apps.reviews.urls')),
        
        # Notification endpoints
        path('notifications/', include('apps.notifications.urls')),
        
        # Chatbot endpoints
        path('chatbot/', include('apps.chatbot.urls')),
    ])),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Custom error handlers
handler404 = 'core.exceptions.handler404'
handler500 = 'core.exceptions.handler500'

# Admin site configuration
admin.site.site_header = 'Reservation Administration'
admin.site.site_title = 'Reservation Admin'
admin.site.index_title = 'Welcome to Reservation Administration'
