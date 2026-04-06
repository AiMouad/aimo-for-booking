"""
Booking service for handling business logic.
"""
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from apps.bookings.models import Booking, BookingPayment, BookingCancellation
from apps.payments.models import RefundPolicy


class BookingService:
    """Service class for booking business logic."""
    
    @staticmethod
    def calculate_total_price(apartment, check_in, check_out, num_guests=1):
        """Calculate total price for a booking."""
        num_nights = (check_out - check_in).days
        
        if num_nights <= 0:
            raise ValueError("Check-out must be after check-in")
        
        # Base price
        subtotal = float(apartment.price_per_night) * num_nights
        
        # Add fees
        cleaning_fee = float(apartment.cleaning_fee)
        service_fee = float(apartment.service_fee)
        
        total = subtotal + cleaning_fee + service_fee
        
        return {
            'subtotal': subtotal,
            'cleaning_fee': cleaning_fee,
            'service_fee': service_fee,
            'total_amount': total,
            'num_nights': num_nights
        }
    
    @staticmethod
    def check_availability(apartment, check_in, check_out, exclude_booking_id=None):
        """Check if apartment is available for given dates."""
        return apartment.is_available(check_in, check_out, exclude_booking_id)
    
    @staticmethod
    def create_booking(user, apartment, check_in, check_out, num_guests, **kwargs):
        """Create a new booking with business logic validation."""
        
        # Validate dates
        if check_in >= check_out:
            raise ValueError("Check-out must be after check-in")
        
        if check_in < timezone.now().date():
            raise ValueError("Check-in cannot be in the past")
        
        num_nights = (check_out - check_in).days
        if num_nights > 365:
            raise ValueError("Maximum booking duration is 365 days")
        
        # Validate guest capacity
        if num_guests > apartment.max_guests:
            raise ValueError(f"Maximum {apartment.max_guests} guests allowed")
        
        # Check availability
        if not BookingService.check_availability(apartment, check_in, check_out):
            raise ValueError("Apartment is not available for selected dates")
        
        # Calculate pricing
        pricing = BookingService.calculate_total_price(apartment, check_in, check_out, num_guests)
        
        with transaction.atomic():
            # Create booking
            booking = Booking.objects.create(
                guest=user,
                property=apartment.property,
                apartment=apartment,
                check_in=check_in,
                check_out=check_out,
                num_nights=num_nights,
                num_guests=num_guests,
                price_per_night=apartment.price_per_night,
                cleaning_fee=apartment.cleaning_fee,
                service_fee=apartment.service_fee,
                total_amount=pricing['total_amount'],
                **kwargs
            )
            
            # Create deposit payment if required
            if apartment.property.deposit_required:
                deposit_amount = pricing['total_amount'] * Decimal('0.1')  # 10% deposit
                BookingPayment.objects.create(
                    booking=booking,
                    amount=deposit_amount,
                    payment_type='deposit',
                    status='pending',
                    description='Initial deposit'
                )
            
            return booking
    
    @staticmethod
    def confirm_booking(booking):
        """Confirm a booking and handle availability."""
        with transaction.atomic():
            if booking.status != 'pending':
                raise ValueError("Only pending bookings can be confirmed")
            
            # Check availability again
            if not booking.apartment.is_available(booking.check_in, booking.check_out, booking.id):
                raise ValueError("Apartment is no longer available")
            
            # Confirm booking
            booking.confirm_booking()
            
            # Block dates in apartment availability
            booking.apartment.book_dates(booking.check_in, booking.num_nights)
            
            return booking
    
    @staticmethod
    def cancel_booking(booking, reason, cancelled_by):
        """Cancel a booking and handle refunds."""
        with transaction.atomic():
            if not booking.can_be_cancelled:
                raise ValueError("This booking cannot be cancelled")
            
            # Create cancellation record
            cancellation = BookingCancellation.objects.create(
                booking=booking,
                reason='guest_request',
                description=reason,
                cancelled_by=cancelled_by
            )
            
            # Cancel booking
            booking.cancel_booking(reason)
            
            # Process refund if applicable
            if booking.amount_paid > 0:
                BookingService.process_refund(booking, cancellation)
            
            return booking
    
    @staticmethod
    def process_refund(booking, cancellation):
        """Process refund based on refund policy."""
        if booking.amount_paid <= 0:
            return
        
        # Get refund policy
        refund_policy = booking.property.refund_policies.filter(is_active=True).first()
        
        if not refund_policy:
            # Default policy: no refund
            return
        
        # Calculate refund amount
        refund_percentage, refund_type, policy_applied = refund_policy.calculate_refund(
            booking.check_in,
            cancellation.created_at.date(),
            cancellation.reason
        )
        
        if refund_percentage > 0:
            refund_amount = booking.amount_paid * (refund_percentage / 100)
            
            # Create refund payment
            BookingPayment.objects.create(
                booking=booking,
                amount=-refund_amount,  # Negative amount for refund
                payment_type='refund',
                status='completed',
                description=f'Refund: {policy_applied}',
                refund_amount=refund_amount,
                refund_reason=cancellation.description
            )
            
            # Update booking payment status
            booking.amount_paid -= refund_amount
            if booking.amount_paid <= 0:
                booking.payment_status = 'refunded'
            else:
                booking.payment_status = 'partial'
            
            booking.save(update_fields=['amount_paid', 'payment_status'])
    
    @staticmethod
    def complete_booking(booking):
        """Complete a booking and handle post-completion tasks."""
        with transaction.atomic():
            if booking.status != 'confirmed':
                raise ValueError("Only confirmed bookings can be completed")
            
            if booking.check_out > timezone.now().date():
                raise ValueError("Cannot complete booking before check-out date")
            
            # Mark as completed
            booking.complete_booking()
            
            # Process final payment if not fully paid
            if booking.amount_paid < booking.total_amount:
                remaining_balance = booking.total_amount - booking.amount_paid
                
                # Auto-charge remaining balance (this would integrate with payment gateway)
                BookingPayment.objects.create(
                    booking=booking,
                    amount=remaining_balance,
                    payment_type='full_payment',
                    status='pending',
                    description='Final payment'
                )
            
            return booking
    
    @staticmethod
    def mark_no_show(booking):
        """Mark booking as no-show and handle penalties."""
        with transaction.atomic():
            if booking.status != 'confirmed':
                raise ValueError("Only confirmed bookings can be marked as no-show")
            
            if booking.check_in >= timezone.now().date():
                raise ValueError("Cannot mark as no-show before check-in date")
            
            # Mark as no-show
            booking.mark_as_no_show()
            
            # Apply no-show penalty (typically no refund)
            # This could be customized based on property policies
            
            return booking
    
    @staticmethod
    def get_booking_statistics(user, start_date=None, end_date=None):
        """Get booking statistics for a user."""
        queryset = Booking.objects.filter(property__owner=user)
        
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        # Basic statistics
        stats = {
            'total_bookings': queryset.count(),
            'pending_bookings': queryset.filter(status='pending').count(),
            'confirmed_bookings': queryset.filter(status='confirmed').count(),
            'cancelled_bookings': queryset.filter(status='cancelled').count(),
            'completed_bookings': queryset.filter(status='completed').count(),
            'total_revenue': queryset.filter(payment_status='paid').aggregate(
                total=models.Sum('total_amount')
            )['total'] or 0,
            'average_booking_value': queryset.aggregate(
                avg=models.Avg('total_amount')
            )['avg'] or 0,
        }
        
        # Occupancy rate calculation
        total_apartments = user.owned_properties.aggregate(
            total=models.Count('apartments')
        )['total'] or 1
        
        occupied_nights = queryset.filter(status='confirmed').aggregate(
            total=models.Sum('num_nights')
        )['total'] or 0
        
        period_days = 365
        if start_date and end_date:
            period_days = (end_date - start_date).days
        
        stats['occupancy_rate'] = (occupied_nights / (total_apartments * period_days)) * 100
        
        return stats
    
    @staticmethod
    def get_upcoming_bookings(user, days=30):
        """Get upcoming bookings for a user."""
        cutoff_date = timezone.now().date() + timedelta(days=days)
        
        return Booking.objects.filter(
            property__owner=user,
            status='confirmed',
            check_in__gte=timezone.now().date(),
            check_in__lte=cutoff_date
        ).order_by('check_in')
    
    @staticmethod
    def get_booking_calendar(property_obj, year, month):
        """Get booking calendar for a property."""
        from django.db.models import Count
        
        bookings = Booking.objects.filter(
            property=property_obj,
            status__in=['confirmed', 'pending'],
            check_in__year=year,
            check_in__month=month
        ).order_by('check_in')
        
        calendar_data = {}
        for booking in bookings:
            current_date = booking.check_in
            while current_date < booking.check_out:
                date_str = current_date.strftime('%Y-%m-%d')
                if date_str not in calendar_data:
                    calendar_data[date_str] = []
                calendar_data[date_str].append({
                    'id': str(booking.id),
                    'status': booking.status,
                    'num_guests': booking.num_guests
                })
                current_date += timedelta(days=1)
        
        return calendar_data
