from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg, F
from django.utils import timezone
from django.db import transaction
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Booking, BookingPayment, BookingCancellation
from .serializers import (
    BookingSerializer, BookingListSerializer, BookingCreateSerializer,
    BookingUpdateSerializer, BookingStatusUpdateSerializer,
    BookingPaymentSerializer, BookingCancellationSerializer,
    BookingSearchSerializer, BookingStatisticsSerializer
)
from core.permissions import IsOwnerOrWorker, IsGuestOrOwner, IsBookingOwnerOrWorker
from core.services.booking_service import BookingService


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing bookings.
    """
    
    queryset = Booking.objects.select_related(
        'guest', 'property', 'apartment'
    ).prefetch_related('payments').all()
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'payment_status', 'property', 'apartment']
    search_fields = [
        'guest__first_name', 'guest__last_name', 'guest__email',
        'property__name', 'apartment__name', 'guest_first_name', 'guest_last_name'
    ]
    ordering_fields = ['created_at', 'check_in', 'check_out', 'total_amount']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return BookingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BookingUpdateSerializer
        elif self.action == 'list':
            return BookingListSerializer
        else:
            return BookingSerializer
    
    def get_permissions(self):
        """Return appropriate permissions based on action."""
        if self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsBookingOwnerOrWorker]
        elif self.action in ['my_bookings']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [IsOwnerOrWorker]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        if user.role == 'client':
            # Clients can only see their own bookings
            return self.queryset.filter(guest=user)
        elif user.role in ['owner', 'worker']:
            # Owners and workers can see bookings for their properties
            return self.queryset.filter(property__owner=user)
        else:
            # Other roles get empty queryset
            return self.queryset.none()
    
    def perform_create(self, serializer):
        """Create booking with business logic."""
        with transaction.atomic():
            booking = serializer.save()
            
            # Create initial payment record if deposit is required
            if booking.deposit_amount > 0:
                BookingPayment.objects.create(
                    booking=booking,
                    amount=booking.deposit_amount,
                    payment_type='deposit',
                    status='pending',
                    description='Initial deposit required'
                )
            
            # Send notification to property owner
            from core.services.notification_service import NotificationService
            NotificationService.send_booking_notification(booking, 'created')
            
            return booking
    
    def perform_destroy(self, instance):
        """Handle booking deletion with availability restoration."""
        with transaction.atomic():
            # Restore apartment availability if booking was confirmed
            if instance.status == 'confirmed':
                instance.apartment.add_available_dates(instance.check_in, instance.check_out)
            
            # Send cancellation notification
            from core.services.notification_service import NotificationService
            NotificationService.send_booking_notification(instance, 'cancelled')
            
            instance.delete()
    
    @extend_schema(
        parameters=[
            OpenApiParameter(name='status', description='Filter by booking status', required=False),
            OpenApiParameter(name='check_in_from', description='Filter by check-in date from', required=False),
            OpenApiParameter(name='check_in_to', description='Filter by check-in date to', required=False),
        ]
    )
    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Get current user's bookings."""
        user = request.user
        bookings = self.queryset.filter(guest=user)
        
        # Apply additional filters
        status_filter = request.query_params.get('status')
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a booking."""
        booking = self.get_object()
        
        if booking.status != 'pending':
            return Response(
                {'error': 'Only pending bookings can be confirmed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                booking.confirm_booking()
                
                # Update apartment availability
                booking.apartment.book_dates(booking.check_in, booking.num_nights)
                
                # Send confirmation notifications
                from core.services.notification_service import NotificationService
                NotificationService.send_booking_notification(booking, 'confirmed')
                
                serializer = self.get_serializer(booking)
                return Response(serializer.data)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking."""
        booking = self.get_object()
        
        if not booking.can_be_cancelled:
            return Response(
                {'error': 'This booking cannot be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', 'User requested cancellation')
        
        try:
            with transaction.atomic():
                # Create cancellation record
                cancellation = BookingCancellation.objects.create(
                    booking=booking,
                    reason='guest_request',
                    description=reason,
                    cancelled_by=request.user
                )
                
                # Cancel booking
                booking.cancel_booking(reason)
                
                # Process refund if applicable
                if booking.amount_paid > 0:
                    BookingService.process_refund(booking, cancellation)
                
                # Send cancellation notifications
                from core.services.notification_service import NotificationService
                NotificationService.send_booking_notification(booking, 'cancelled')
                
                serializer = self.get_serializer(booking)
                return Response(serializer.data)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark booking as completed."""
        booking = self.get_object()
        
        if booking.status != 'confirmed':
            return Response(
                {'error': 'Only confirmed bookings can be completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if booking.check_out > timezone.now().date():
            return Response(
                {'error': 'Booking cannot be completed before check-out date.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking.complete_booking()
            
            # Send completion notifications
            from core.services.notification_service import NotificationService
            NotificationService.send_booking_notification(booking, 'completed')
            
            # Request review from guest
            NotificationService.request_review(booking)
            
            serializer = self.get_serializer(booking)
            return Response(serializer.data)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def mark_no_show(self, request, pk=None):
        """Mark booking as no-show."""
        booking = self.get_object()
        
        if booking.status != 'confirmed':
            return Response(
                {'error': 'Only confirmed bookings can be marked as no-show.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if booking.check_in >= timezone.now().date():
            return Response(
                {'error': 'Cannot mark as no-show before check-in date.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking.mark_as_no_show()
            
            # Send no-show notifications
            from core.services.notification_service import NotificationService
            NotificationService.send_booking_notification(booking, 'no_show')
            
            serializer = self.get_serializer(booking)
            return Response(serializer.data)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Check availability for booking dates."""
        booking = self.get_object()
        
        is_available = booking.apartment.is_available(
            booking.check_in, 
            booking.check_out,
            exclude_booking_id=booking.id
        )
        
        return Response({
            'is_available': is_available,
            'check_in': booking.check_in,
            'check_out': booking.check_out,
            'num_nights': booking.num_nights
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get booking statistics for the current user."""
        user = request.user
        
        if user.role not in ['owner', 'worker']:
            return Response(
                {'error': 'Statistics only available for owners and workers.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get user's bookings
        bookings = self.queryset.filter(property__owner=user)
        
        # Calculate statistics
        stats = {
            'total_bookings': bookings.count(),
            'pending_bookings': bookings.filter(status='pending').count(),
            'confirmed_bookings': bookings.filter(status='confirmed').count(),
            'cancelled_bookings': bookings.filter(status='cancelled').count(),
            'completed_bookings': bookings.filter(status='completed').count(),
            'total_revenue': bookings.filter(
                payment_status='paid'
            ).aggregate(total=Sum('total_amount'))['total'] or 0,
            'average_booking_value': bookings.aggregate(
                avg=Avg('total_amount')
            )['avg'] or 0,
        }
        
        # Calculate occupancy rate
        total_apartments = user.owned_properties.aggregate(
            total=Count('apartments')
        )['total'] or 1
        
        occupied_days = bookings.filter(
            status='confirmed'
        ).aggregate(
            total=Sum('num_nights')
        )['total'] or 0
        
        stats['occupancy_rate'] = (occupied_days / (total_apartments * 365)) * 100
        
        # Monthly data
        current_year = timezone.now().year
        monthly_bookings = []
        monthly_revenue = []
        
        for month in range(1, 13):
            month_bookings = bookings.filter(
                created_at__year=current_year,
                created_at__month=month
            )
            
            monthly_bookings.append(month_bookings.count())
            monthly_revenue.append(
                month_bookings.filter(payment_status='paid').aggregate(
                    total=Sum('total_amount')
                )['total'] or 0
            )
        
        stats['monthly_bookings'] = monthly_bookings
        stats['monthly_revenue'] = monthly_revenue
        
        serializer = BookingStatisticsSerializer(data=stats)
        serializer.is_valid()
        
        return Response(serializer.data)


class BookingPaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing booking payments.
    """
    
    queryset = BookingPayment.objects.select_related('booking', 'user').all()
    serializer_class = BookingPaymentSerializer
    
    def get_permissions(self):
        """Return appropriate permissions based on action."""
        if self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsOwnerOrWorker]
        else:
            permission_classes = [IsOwnerOrWorker]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        if user.role == 'client':
            # Clients can only see their own payment records
            return self.queryset.filter(booking__guest=user)
        elif user.role in ['owner', 'worker']:
            # Owners and workers can see payments for their properties
            return self.queryset.filter(booking__property__owner=user)
        else:
            return self.queryset.none()
    
    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        """Process a payment."""
        payment = self.get_object()
        
        if payment.status != 'pending':
            return Response(
                {'error': 'Only pending payments can be processed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transaction_id = request.data.get('transaction_id')
        gateway_response = request.data.get('gateway_response', {})
        
        if not transaction_id:
            return Response(
                {'error': 'Transaction ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            payment.process_payment(transaction_id, gateway_response)
            
            # Send payment confirmation notification
            from core.services.notification_service import NotificationService
            NotificationService.send_payment_notification(payment, 'completed')
            
            serializer = self.get_serializer(payment)
            return Response(serializer.data)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """Process a refund."""
        payment = self.get_object()
        
        if payment.status != 'completed':
            return Response(
                {'error': 'Only completed payments can be refunded.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        refund_amount = request.data.get('refund_amount')
        refund_reason = request.data.get('refund_reason', 'Refund requested')
        
        if not refund_amount:
            return Response(
                {'error': 'Refund amount is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            payment.process_refund(refund_amount, refund_reason)
            
            # Send refund notification
            from core.services.notification_service import NotificationService
            NotificationService.send_payment_notification(payment, 'refunded')
            
            serializer = self.get_serializer(payment)
            return Response(serializer.data)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
