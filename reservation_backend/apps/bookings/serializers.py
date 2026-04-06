from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Booking, BookingPayment, BookingCancellation

User = get_user_model()


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for bookings."""
    
    guest_name = serializers.CharField(source='guest.get_full_name', read_only=True)
    property_name = serializers.CharField(source='property.name', read_only=True)
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)
    outstanding_balance = serializers.ReadOnlyField()
    is_fully_paid = serializers.ReadOnlyField()
    can_be_cancelled = serializers.ReadOnlyField()
    can_be_reviewed = serializers.ReadOnlyField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'guest', 'guest_name', 'property', 'property_name',
            'apartment', 'apartment_name', 'check_in', 'check_out', 'num_nights',
            'num_guests', 'guest_first_name', 'guest_last_name', 'guest_email',
            'guest_phone', 'price_per_night', 'cleaning_fee', 'service_fee',
            'total_amount', 'payment_status', 'amount_paid', 'deposit_amount',
            'status', 'is_guest_reviewed', 'is_host_reviewed', 'special_requests',
            'internal_notes', 'created_at', 'updated_at', 'confirmed_at',
            'cancelled_at', 'completed_at', 'outstanding_balance',
            'is_fully_paid', 'can_be_cancelled', 'can_be_reviewed'
        ]
        read_only_fields = [
            'id', 'total_amount', 'status', 'amount_paid', 'created_at',
            'updated_at', 'confirmed_at', 'cancelled_at', 'completed_at',
            'outstanding_balance', 'is_fully_paid', 'can_be_cancelled',
            'can_be_reviewed'
        ]
    
    def validate(self, data):
        """Validate booking data."""
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        num_guests = data.get('num_guests')
        apartment = data.get('apartment')
        
        # Validate dates
        if check_in and check_out:
            if check_in >= check_out:
                raise serializers.ValidationError("Check-out date must be after check-in date.")
            
            if check_in < timezone.now().date():
                raise serializers.ValidationError("Check-in date cannot be in the past.")
            
            # Calculate number of nights
            num_nights = (check_out - check_in).date() - check_in
            data['num_nights'] = num_nights.days
        
        # Validate guest capacity
        if apartment and num_guests:
            if num_guests > apartment.max_guests:
                raise serializers.ValidationError(
                    f"Number of guests cannot exceed apartment capacity ({apartment.max_guests})."
                )
        
        # Check availability
        if apartment and check_in and check_out:
            if not apartment.is_available(check_in, check_out, exclude_booking_id=self.instance.id if self.instance else None):
                raise serializers.ValidationError("Apartment is not available for the selected dates.")
        
        return data
    
    def create(self, validated_data):
        """Create booking with calculated total amount."""
        request = self.context.get('request')
        
        if request and hasattr(request, 'user'):
            validated_data['guest'] = request.user
        
        # Calculate total amount
        price_per_night = validated_data.get('price_per_night')
        num_nights = validated_data.get('num_nights', 1)
        cleaning_fee = validated_data.get('cleaning_fee', 0)
        service_fee = validated_data.get('service_fee', 0)
        
        if price_per_night and num_nights:
            subtotal = float(price_per_night) * num_nights
            total = subtotal + float(cleaning_fee) + float(service_fee)
            validated_data['total_amount'] = total
        
        return super().create(validated_data)


class BookingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for booking lists."""
    
    guest_name = serializers.CharField(source='guest.get_full_name', read_only=True)
    property_name = serializers.CharField(source='property.name', read_only=True)
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'guest_name', 'property_name', 'apartment_name',
            'check_in', 'check_out', 'num_nights', 'num_guests',
            'total_amount', 'payment_status', 'status', 'created_at'
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings."""
    
    class Meta:
        model = Booking
        fields = [
            'property', 'apartment', 'check_in', 'check_out', 'num_guests',
            'guest_first_name', 'guest_last_name', 'guest_email', 'guest_phone',
            'special_requests'
        ]
    
    def validate(self, data):
        """Validate booking creation."""
        request = self.context.get('request')
        
        # Set guest from authenticated user
        if request and hasattr(request, 'user'):
            data['guest'] = request.user
        
        # Get apartment and property
        apartment = data.get('apartment')
        if apartment:
            data['property'] = apartment.property
            data['price_per_night'] = apartment.price_per_night
            data['cleaning_fee'] = apartment.cleaning_fee
            data['service_fee'] = apartment.service_fee
        
        return super().validate(data)


class BookingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating bookings."""
    
    class Meta:
        model = Booking
        fields = [
            'num_guests', 'guest_first_name', 'guest_last_name',
            'guest_email', 'guest_phone', 'special_requests', 'internal_notes'
        ]
    
    def validate(self, data):
        """Validate booking update."""
        # Don't allow changing critical fields after confirmation
        instance = self.instance
        if instance and instance.status == 'confirmed':
            # Only allow certain fields to be updated after confirmation
            allowed_fields = {'special_requests', 'internal_notes'}
            for field in data.keys():
                if field not in allowed_fields:
                    raise serializers.ValidationError(f"Cannot change {field} after booking is confirmed.")
        
        return data


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating booking status."""
    
    class Meta:
        model = Booking
        fields = ['status', 'internal_notes']
    
    def validate_status(self, value):
        """Validate status transition."""
        instance = self.instance
        if not instance:
            raise serializers.ValidationError("Booking instance is required.")
        
        current_status = instance.status
        
        # Define allowed status transitions
        allowed_transitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['cancelled', 'completed', 'no_show'],
            'cancelled': ['refunded'],
            'completed': [],
            'no_show': ['refunded'],
            'refunded': [],
        }
        
        if value not in allowed_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from {current_status} to {value}."
            )
        
        return value
    
    def save(self, **kwargs):
        """Save status update with timestamps."""
        status = self.validated_data.get('status')
        
        if status == 'confirmed':
            self.instance.confirm_booking()
        elif status == 'cancelled':
            self.instance.cancel_booking(self.validated_data.get('internal_notes', ''))
        elif status == 'completed':
            self.instance.complete_booking()
        elif status == 'no_show':
            self.instance.mark_as_no_show()
        
        return super().save(**kwargs)


class BookingPaymentSerializer(serializers.ModelSerializer):
    """Serializer for booking payments."""
    
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = BookingPayment
        fields = [
            'id', 'booking', 'user', 'amount', 'currency', 'payment_method',
            'payment_method_display', 'payment_type', 'payment_type_display',
            'status', 'status_display', 'transaction_id', 'gateway',
            'gateway_response', 'gateway_fee', 'refund_amount', 'refund_reason',
            'refund_transaction_id', 'description', 'notes', 'created_at',
            'updated_at', 'processed_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'processed_at', 'completed_at'
        ]
    
    def validate(self, data):
        """Validate payment data."""
        amount = data.get('amount')
        booking = data.get('booking') if 'booking' in data else self.instance.booking
        
        if amount and booking:
            if amount > booking.total_amount:
                raise serializers.ValidationError("Payment amount cannot exceed booking total.")
        
        return data


class BookingCancellationSerializer(serializers.ModelSerializer):
    """Serializer for booking cancellations."""
    
    class Meta:
        model = BookingCancellation
        fields = [
            'id', 'booking', 'reason', 'description', 'cancelled_by',
            'refund_amount', 'refund_policy', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        """Validate cancellation data."""
        booking = data.get('booking') if 'booking' in data else self.instance.booking
        
        if booking and not booking.can_be_cancelled:
            raise serializers.ValidationError("This booking cannot be cancelled.")
        
        return data


class BookingSearchSerializer(serializers.Serializer):
    """Serializer for booking search parameters."""
    
    status = serializers.ChoiceField(
        choices=Booking.STATUS_CHOICES,
        required=False
    )
    payment_status = serializers.ChoiceField(
        choices=Booking.PAYMENT_STATUS_CHOICES,
        required=False
    )
    check_in_from = serializers.DateField(required=False)
    check_in_to = serializers.DateField(required=False)
    check_out_from = serializers.DateField(required=False)
    check_out_to = serializers.DateField(required=False)
    property_id = serializers.UUIDField(required=False)
    apartment_id = serializers.UUIDField(required=False)
    guest_id = serializers.UUIDField(required=False)
    min_amount = serializers.DecimalField(min_value=0, required=False)
    max_amount = serializers.DecimalField(min_value=0, required=False)
    
    def validate(self, data):
        """Validate search parameters."""
        check_in_from = data.get('check_in_from')
        check_in_to = data.get('check_in_to')
        
        if check_in_from and check_in_to and check_in_from > check_in_to:
            raise serializers.ValidationError("Check-in 'from' date must be before 'to' date.")
        
        check_out_from = data.get('check_out_from')
        check_out_to = data.get('check_out_to')
        
        if check_out_from and check_out_to and check_out_from > check_out_to:
            raise serializers.ValidationError("Check-out 'from' date must be before 'to' date.")
        
        min_amount = data.get('min_amount')
        max_amount = data.get('max_amount')
        
        if min_amount and max_amount and min_amount >= max_amount:
            raise serializers.ValidationError("Minimum amount must be less than maximum amount.")
        
        return data


class BookingStatisticsSerializer(serializers.Serializer):
    """Serializer for booking statistics."""
    
    total_bookings = serializers.IntegerField(read_only=True)
    pending_bookings = serializers.IntegerField(read_only=True)
    confirmed_bookings = serializers.IntegerField(read_only=True)
    cancelled_bookings = serializers.IntegerField(read_only=True)
    completed_bookings = serializers.IntegerField(read_only=True)
    total_revenue = serializers.DecimalField(read_only=True, max_digits=12, decimal_places=2)
    average_booking_value = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)
    occupancy_rate = serializers.FloatField(read_only=True)
    
    # Monthly data
    monthly_bookings = serializers.ListField(read_only=True)
    monthly_revenue = serializers.ListField(read_only=True)
