from rest_framework import serializers
from django.utils import timezone
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    guest_name = serializers.ReadOnlyField()
    total_amount = serializers.ReadOnlyField()
    property_name = serializers.CharField(source='property_obj.name', read_only=True)
    apartment_name = serializers.CharField(source='apartment.name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'property_obj', 'property_name', 'apartment', 'apartment_name',
            'first_name', 'last_name', 'phone',
            'date_in', 'num_nights', 'date_out',
            'payment', 'rest', 'is_paid', 'total_amount',
            'status', 'notes', 'guest_name',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'date_out', 'total_amount', 'guest_name', 'created_at', 'updated_at']
        extra_kwargs = {
            'user': {'required': False},
            'created_by': {'required': False},
        }

    def validate_date_in(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError('Check-in date cannot be in the past.')
        return value

    def validate_num_nights(self, value):
        if value < 1:
            raise serializers.ValidationError('Booking must be at least 1 night.')
        return value

    def validate(self, attrs):
        apartment = attrs.get('apartment') or (self.instance.apartment if self.instance else None)
        date_in = attrs.get('date_in') or (self.instance.date_in if self.instance else None)
        num_nights = attrs.get('num_nights') or (self.instance.num_nights if self.instance else None)

        if apartment and date_in and num_nights:
            exclude_id = self.instance.id if self.instance else None
            if not apartment.is_available(date_in, num_nights, exclude_id):
                raise serializers.ValidationError({
                    'apartment': 'This apartment is not available for the selected dates.'
                })
        return attrs


class BookingCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for clients creating bookings."""
    class Meta:
        model = Booking
        fields = [
            'property_obj', 'apartment',
            'first_name', 'last_name', 'phone',
            'date_in', 'num_nights',
            'notes',
        ]

    def validate_date_in(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError('Check-in date cannot be in the past.')
        return value

    def validate_num_nights(self, value):
        if value < 1:
            raise serializers.ValidationError('Must book at least 1 night.')
        return value

    def validate(self, attrs):
        apartment = attrs.get('apartment')
        date_in = attrs.get('date_in')
        num_nights = attrs.get('num_nights')

        if apartment and date_in and num_nights:
            if not apartment.is_available(date_in, num_nights):
                raise serializers.ValidationError({
                    'apartment': 'This apartment is not available for the selected dates.'
                })
        return attrs


class BookingStatusSerializer(serializers.ModelSerializer):
    """For owner/worker to update booking status."""
    class Meta:
        model = Booking
        fields = ['status', 'notes']
