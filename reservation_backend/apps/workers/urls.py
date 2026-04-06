from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AvailabilityViewSet, WorkerProfileViewSet

router = DefaultRouter()
router.register('availabilities', AvailabilityViewSet, basename='availability')
router.register('profiles', WorkerProfileViewSet, basename='worker-profile')

urlpatterns = [
    path('', include(router.urls)),
]
