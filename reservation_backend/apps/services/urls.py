from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ServiceViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('', ServiceViewSet, basename='service')

urlpatterns = [
    path('', include(router.urls)),
]
