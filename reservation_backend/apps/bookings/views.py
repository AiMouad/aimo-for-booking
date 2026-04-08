from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.core.exceptions import ValidationError

from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer, BookingStatusSerializer
from apps.users.permissions import IsOwnerWorkerOrClient, IsWorkerOrOwner


class BookingViewSet(viewsets.ModelViewSet):
    """
    Full booking management.
    - Owner/Worker: full access (all bookings)
    - Client: own bookings only (create, read, cancel)
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'apartment', 'property_obj', 'is_paid']
    search_fields = ['first_name', 'last_name', 'phone', 'user__username']
    ordering_fields = ['date_in', 'created_at', 'payment', 'status']

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related('property_obj', 'apartment', 'user')

        if user.role in ('owner', 'admin'):
            return qs.all()
        if user.role == 'worker':
            return qs.all()
        if user.role == 'client':
            return qs.filter(user=user)
        return qs.none()

    def get_serializer_class(self):
        if self.action == 'create':
            user = self.request.user
            if user.role == 'client':
                return BookingCreateSerializer
        if self.action in ['confirm', 'refuse', 'cancel']:
            return BookingStatusSerializer
        return BookingSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsOwnerWorkerOrClient()]
        if self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated(), IsWorkerOrOwner()]
        if self.action == 'destroy':
            return [permissions.IsAuthenticated(), IsWorkerOrOwner()]
        if self.action in ['confirm', 'refuse']:
            return [permissions.IsAuthenticated(), IsWorkerOrOwner()]
        return [permissions.IsAuthenticated(), IsOwnerWorkerOrClient()]

    def perform_create(self, serializer):
        user = self.request.user
        booking_user = user if user.role == 'client' else None
        try:
            serializer.save(user=booking_user, created_by=user)
        except ValidationError as e:
            from rest_framework.exceptions import ValidationError as DRFValidationError
            raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))

    def perform_update(self, serializer):
        try:
            serializer.save()
        except ValidationError as e:
            from rest_framework.exceptions import ValidationError as DRFValidationError
            raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))

    @action(detail=True, methods=['post'], permission_classes=[IsWorkerOrOwner])
    def confirm(self, request, pk=None):
        """Confirm a pending booking."""
        booking = self.get_object()
        if booking.status != Booking.Status.PENDING:
            return Response(
                {'error': f'Cannot confirm a booking with status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.Status.CONFIRMED
        try:
            booking.save()
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'], permission_classes=[IsWorkerOrOwner])
    def refuse(self, request, pk=None):
        """Refuse a pending booking."""
        booking = self.get_object()
        if booking.status not in (Booking.Status.PENDING, Booking.Status.CONFIRMED):
            return Response(
                {'error': f'Cannot refuse a booking with status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.Status.REFUSED
        notes = request.data.get('notes', '')
        if notes:
            booking.notes = notes
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        """Client cancels own pending booking."""
        booking = self.get_object()
        user = request.user

        # Clients can only cancel their own bookings
        if user.role == 'client' and booking.user != user:
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        if booking.status not in (Booking.Status.PENDING,):
            return Response(
                {'error': 'Only pending bookings can be cancelled by clients.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = Booking.Status.CANCELLED
        booking.save()
        return Response({'message': 'Booking cancelled successfully.'})


class MyBookingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Client's personal booking history (read-only).
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerWorkerOrClient]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'is_paid']
    ordering_fields = ['date_in', 'created_at']

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        ).select_related('property_obj', 'apartment').order_by('-created_at')
