from django.urls import path
from .analytics import (
    AnalyticsOverviewView,
    AnalyticsMonthlyView,
    AnalyticsByPropertyView,
    AnalyticsRecentBookingsView,
    AnalyticsOccupancyView,
)

urlpatterns = [
    path('overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
    path('monthly/', AnalyticsMonthlyView.as_view(), name='analytics-monthly'),
    path('by-property/', AnalyticsByPropertyView.as_view(), name='analytics-by-property'),
    path('recent-bookings/', AnalyticsRecentBookingsView.as_view(), name='analytics-recent'),
    path('occupancy/', AnalyticsOccupancyView.as_view(), name='analytics-occupancy'),
]
