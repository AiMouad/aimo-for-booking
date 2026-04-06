from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BookingViewSet, BookingPaymentViewSet, BookingSearchViewSet,
    BookingStatisticsViewSet, BookingCalendarViewSet
)

router = DefaultRouter()
router.register('bookings', BookingViewSet, basename='bookings')
router.register('payments', BookingPaymentViewSet, basename='booking-payments')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional booking endpoints
    path('bookings/search/', BookingSearchViewSet.as_view({'post': 'create'}), name='booking-search'),
    path('bookings/statistics/', BookingStatisticsViewSet.as_view({'get': 'list'}), name='booking-statistics'),
    path('bookings/upcoming/', BookingViewSet.as_view({'get': 'upcoming'}), name='upcoming-bookings'),
    path('bookings/history/', BookingViewSet.as_view({'get': 'history'}), name='booking-history'),
    path('properties/<uuid:property_id>/booking-calendar/', BookingCalendarViewSet.as_view({'get': 'retrieve'}), name='property-booking-calendar'),
]
