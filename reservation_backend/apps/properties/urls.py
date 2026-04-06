from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PropertyViewSet, ApartmentViewSet, PropertyImageViewSet,
    ApartmentImageViewSet, PropertySearchViewSet, PropertyStatisticsViewSet,
    PropertyCalendarViewSet
)

router = DefaultRouter()
router.register('properties', PropertyViewSet, basename='properties')
router.register('apartments', ApartmentViewSet, basename='apartments')
router.register('property-images', PropertyImageViewSet, basename='property-images')
router.register('apartment-images', ApartmentImageViewSet, basename='apartment-images')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional endpoints
    path('properties/search/', PropertySearchViewSet.as_view({'post': 'create'}), name='property-search'),
    path('properties/featured/', PropertyViewSet.as_view({'get': 'featured'}), name='featured-properties'),
    path('properties/types/', PropertyViewSet.as_view({'get': 'property_types'}), name='property-types'),
    path('properties/amenities/', PropertyViewSet.as_view({'get': 'amenities'}), name='amenities'),
    path('properties/<uuid:pk>/statistics/', PropertyStatisticsViewSet.as_view({'get': 'retrieve'}), name='property-statistics'),
    path('properties/<uuid:pk>/calendar/', PropertyCalendarViewSet.as_view({'get': 'retrieve'}), name='property-calendar'),
    path('apartments/<uuid:pk>/availability/', ApartmentViewSet.as_view({'post': 'check_availability'}), name='apartment-availability'),
]
