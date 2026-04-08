"""
Analytics views for the Owner dashboard.
Provides aggregated booking and revenue statistics.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncMonth, TruncDay
from django.utils import timezone
from datetime import timedelta

from apps.bookings.models import Booking
from apps.properties.models import Property, Apartment
from apps.users.permissions import IsOwnerRole


class AnalyticsOverviewView(APIView):
    """High-level stats for owner dashboard cards."""
    permission_classes = [IsOwnerRole]

    def get(self, request):
        owner = request.user
        bookings = Booking.objects.filter(property_obj__owner=owner)
        today = timezone.now().date()
        month_start = today.replace(day=1)

        # Today's activity
        arrivals_today = bookings.filter(date_in=today, status='confirmed').count()
        departures_today = bookings.filter(date_out=today, status='confirmed').count()

        # Active bookings (currently staying)
        active_now = bookings.filter(
            date_in__lte=today, date_out__gte=today, status='confirmed'
        ).count()

        return Response({
            'total_bookings': bookings.count(),
            'confirmed_bookings': bookings.filter(status='confirmed').count(),
            'pending_bookings': bookings.filter(status='pending').count(),
            'cancelled_bookings': bookings.filter(status__in=['refused', 'cancelled']).count(),
            'total_revenue': bookings.filter(status='confirmed').aggregate(
                total=Sum('payment')
            )['total'] or 0,
            'monthly_revenue': bookings.filter(
                status='confirmed', date_in__gte=month_start
            ).aggregate(total=Sum('payment'))['total'] or 0,
            'total_properties': Property.objects.filter(owner=owner).count(),
            'total_apartments': Apartment.objects.filter(property__owner=owner).count(),
            'arrivals_today': arrivals_today,
            'departures_today': departures_today,
            'active_guests': active_now,
        })


class AnalyticsMonthlyView(APIView):
    """Monthly booking counts + revenue for the last 12 months."""
    permission_classes = [IsOwnerRole]

    def get(self, request):
        owner = request.user
        months = int(request.query_params.get('months', 12))

        data = (
            Booking.objects
            .filter(property_obj__owner=owner, status='confirmed')
            .annotate(month=TruncMonth('date_in'))
            .values('month')
            .annotate(
                bookings=Count('id'),
                revenue=Sum('payment'),
            )
            .order_by('month')
        )

        return Response([
            {
                'month': item['month'].strftime('%Y-%m'),
                'bookings': item['bookings'],
                'revenue': float(item['revenue'] or 0),
            }
            for item in data
        ])


class AnalyticsByPropertyView(APIView):
    """Breakdown of bookings and revenue per property."""
    permission_classes = [IsOwnerRole]

    def get(self, request):
        owner = request.user
        data = (
            Property.objects
            .filter(owner=owner)
            .annotate(
                total_bookings=Count('bookings'),
                confirmed=Count('bookings', filter=Q(bookings__status='confirmed')),
                revenue=Sum('bookings__payment', filter=Q(bookings__status='confirmed')),
                avg_rating=Avg('rating'),
            )
            .values(
                'property_id', 'name', 'type', 'location',
                'total_bookings', 'confirmed', 'revenue', 'avg_rating'
            )
            .order_by('-confirmed')
        )

        return Response([
            {
                'property_id': str(item['property_id']),
                'name': item['name'],
                'type': item['type'],
                'location': item['location'],
                'total_bookings': item['total_bookings'],
                'confirmed_bookings': item['confirmed'],
                'revenue': float(item['revenue'] or 0),
                'avg_rating': round(item['avg_rating'] or 0, 2),
            }
            for item in data
        ])


class AnalyticsRecentBookingsView(APIView):
    """Last 10 bookings for the owner's properties."""
    permission_classes = [IsOwnerRole]

    def get(self, request):
        from apps.bookings.serializers import BookingSerializer
        bookings = Booking.objects.filter(
            property_obj__owner=request.user
        ).select_related('property_obj', 'apartment', 'user').order_by('-created_at')[:10]

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class AnalyticsOccupancyView(APIView):
    """Daily occupancy rate for the last 30 days."""
    permission_classes = [IsOwnerRole]

    def get(self, request):
        owner = request.user
        today = timezone.now().date()
        total_apartments = Apartment.objects.filter(property__owner=owner).count()

        if not total_apartments:
            return Response([])

        result = []
        for i in range(29, -1, -1):
            day = today - timedelta(days=i)
            occupied = Booking.objects.filter(
                property_obj__owner=owner,
                status='confirmed',
                date_in__lte=day,
                date_out__gt=day,
            ).count()
            result.append({
                'date': day.strftime('%Y-%m-%d'),
                'occupied': occupied,
                'total': total_apartments,
                'rate': round((occupied / total_apartments) * 100, 1),
            })

        return Response(result)
