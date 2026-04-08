from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Q

from .models import Property, Apartment, Review, AvailableDate
from .serializers import (
    PropertySerializer, PropertyListSerializer,
    ApartmentSerializer, ReviewSerializer, AvailableDateSerializer,
)
from apps.users.permissions import IsOwnerRole, IsOwnerWorkerOrClient


class PropertyFilter:
    """Custom filtering for properties."""
    pass


class PropertyViewSet(viewsets.ModelViewSet):
    """
    Properties CRUD + public listing + availability check.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'is_public', 'owner']
    search_fields = ['name', 'location', 'description', 'amenities']
    ordering_fields = ['rating', 'views', 'created_at', 'name']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role in ('owner', 'admin'):
            # Owners see their own properties; admin sees all
            if user.role == 'admin':
                return Property.objects.prefetch_related('apartments', 'reviews').all()
            return Property.objects.prefetch_related('apartments', 'reviews').filter(owner=user)
        # Public listing — only public properties
        qs = Property.objects.prefetch_related('apartments', 'reviews').filter(is_public=True)
        # Optional location filter
        location = self.request.query_params.get('location')
        if location:
            qs = qs.filter(location__icontains=location)
        # Optional rating filter
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            qs = qs.filter(rating__gte=float(min_rating))
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        return PropertySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsOwnerRole()]
        return [permissions.IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view counter
        instance.views = (instance.views or 0) + 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def availability(self, request, pk=None):
        """Return all available date ranges for all apartments in a property."""
        prop = self.get_object()
        result = []
        for apt in prop.apartments.filter(is_public=True):
            result.append({
                'apartment_id': str(apt.apartment_id),
                'name': apt.name,
                'type': apt.type,
                'price': str(apt.price),
                'available_dates': AvailableDateSerializer(
                    apt.available_dates.all(), many=True
                ).data,
            })
        return Response(result)

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerWorkerOrClient])
    def review(self, request, pk=None):
        """Submit or update a review for this property."""
        prop = self.get_object()
        # Ensure user has a confirmed booking for this property
        from apps.bookings.models import Booking
        has_booking = Booking.objects.filter(
            user=request.user,
            property=prop,
            status='confirmed',
        ).exists()

        if not has_booking:
            return Response(
                {'error': 'You can only review properties you have stayed at.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Create or update review
        review, created = Review.objects.update_or_create(
            user=request.user,
            property=prop,
            defaults={
                'rating': request.data.get('rating'),
                'comment': request.data.get('comment', ''),
            },
        )
        serializer = ReviewSerializer(review, context={'request': request})
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'], permission_classes=[IsOwnerRole])
    def my_stats(self, request):
        """Quick stats for owner dashboard."""
        properties = Property.objects.filter(owner=request.user)
        from apps.bookings.models import Booking
        bookings = Booking.objects.filter(property__owner=request.user)

        return Response({
            'total_properties': properties.count(),
            'total_apartments': Apartment.objects.filter(property__owner=request.user).count(),
            'total_bookings': bookings.count(),
            'confirmed_bookings': bookings.filter(status='confirmed').count(),
            'pending_bookings': bookings.filter(status='pending').count(),
            'average_rating': properties.aggregate(avg=Avg('rating'))['avg'] or 0,
        })


class ApartmentViewSet(viewsets.ModelViewSet):
    """
    Apartment CRUD. Public read, owner-only write.
    """
    serializer_class = ApartmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['property', 'is_public']
    ordering_fields = ['price', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role in ('owner', 'admin'):
            if user.role == 'admin':
                return Apartment.objects.prefetch_related('available_dates').all()
            return Apartment.objects.prefetch_related('available_dates').filter(
                property__owner=user
            )
        return Apartment.objects.prefetch_related('available_dates').filter(is_public=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsOwnerRole()]

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerRole])
    def add_availability(self, request, pk=None):
        """Add an available date range to this apartment."""
        apartment = self.get_object()
        start = request.data.get('start')
        end = request.data.get('end')  # Optional

        if not start:
            return Response({'error': 'start date is required.'}, status=status.HTTP_400_BAD_REQUEST)

        apartment.add_available_dates(start, end)
        return Response({'message': 'Availability added successfully.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def check_availability(self, request, pk=None):
        """Check if this apartment is available for given dates."""
        apartment = self.get_object()
        date_in = request.data.get('date_in')
        num_nights = request.data.get('num_nights')

        if not date_in or not num_nights:
            return Response(
                {'error': 'date_in and num_nights are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            available = apartment.is_available(date_in, int(num_nights))
        except (ValueError, TypeError):
            return Response({'error': 'Invalid date or night count.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'available': available, 'date_in': date_in, 'num_nights': num_nights})
