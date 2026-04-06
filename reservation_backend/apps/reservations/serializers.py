from rest_framework import serializers
from django.utils import timezone
from django.db import models
from .models import Reservation
from apps.services.serializers import ServiceSerializer
from apps.users.serializers import UserSerializer
from core.exceptions import ConflictError


class ReservationSerializer(serializers.ModelSerializer):
    client_detail = UserSerializer(source='client', read_only=True)
    worker_detail = UserSerializer(source='worker', read_only=True)
    service_detail = ServiceSerializer(source='service', read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'client', 'worker', 'service', 'date_time', 'end_time',
            'status', 'notes', 'worker_notes', 'total_price', 'deposit_paid',
            'rating', 'review', 'client_detail', 'worker_detail', 'service_detail',
            'created_at', 'updated_at', 'confirmed_at', 'completed_at', 
            'cancelled_at', 'can_cancel'
        ]
        read_only_fields = [
            'id', 'client', 'status', 'end_time', 'created_at', 'updated_at',
            'confirmed_at', 'completed_at', 'cancelled_at', 'can_cancel'
        ]

    def validate(self, data):
        """Validate date_time and check for overlapping reservations for the worker."""
        date_time = data.get('date_time')
        service = data.get('service')
        worker = data.get('worker')

        if date_time and date_time < timezone.now():
            raise serializers.ValidationError({"date_time": "Reservation cannot be in the past."})

        # Check for overlapping if we have all needed data (creating new)
        if date_time and service and worker:
            end_time = date_time + timezone.timedelta(minutes=service.duration_minutes)
            
            # Check overlap for the worker
            overlapping = Reservation.objects.filter(
                worker=worker,
                status__in=[Reservation.Status.CONFIRMED, Reservation.Status.PENDING],
            ).filter(
                models.Q(date_time__lt=end_time) & models.Q(end_time__gt=date_time)
            )
            
            # If updating, exclude self
            if self.instance:
                overlapping = overlapping.exclude(id=self.instance.id)

            if overlapping.exists():
                raise ConflictError("The selected worker is not available at this time.")

        return data

    def create(self, validated_data):
        # Auto-set client to the requesting user and calculate end_time
        request = self.context.get('request')
        validated_data['client'] = request.user
        
        service = validated_data['service']
        validated_data['end_time'] = validated_data['date_time'] + timezone.timedelta(minutes=service.duration_minutes)
        validated_data['total_price'] = service.price
        
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['can_cancel'] = instance.can_cancel
        return data


class ReservationStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating reservation status with business logic validation."""
    
    class Meta:
        model = Reservation
        fields = ['status', 'worker_notes']

    def validate(self, data):
        status = data.get('status')
        request = self.context.get('request')
        
        # Business rules for status transitions
        if self.instance:
            current_status = self.instance.status
            
            # Client can only cancel their own reservations
            if status == 'CANCELLED' and request.user.role == 'CLIENT':
                if not self.instance.can_cancel:
                    raise serializers.ValidationError(
                        "This reservation cannot be cancelled due to the cancellation policy."
                    )
            
            # Worker can confirm, complete, or mark no-show
            if request.user.role == 'WORKER':
                if status not in ['CONFIRMED', 'COMPLETED', 'NO_SHOW']:
                    raise serializers.ValidationError(
                        "Workers can only confirm, complete, or mark no-show."
                    )
                
                if current_status not in ['PENDING', 'CONFIRMED']:
                    raise serializers.ValidationError(
                        f"Cannot change status from {current_status} to {status}."
                    )
        
        return data

    def update(self, instance, validated_data):
        status = validated_data.get('status')
        
        # Set timestamps based on status
        if status == Reservation.Status.CONFIRMED and not instance.confirmed_at:
            validated_data['confirmed_at'] = timezone.now()
        elif status == Reservation.Status.COMPLETED and not instance.completed_at:
            validated_data['completed_at'] = timezone.now()
        elif status == Reservation.Status.CANCELLED and not instance.cancelled_at:
            validated_data['cancelled_at'] = timezone.now()
        
        return super().update(instance, validated_data)


class ReservationRatingSerializer(serializers.ModelSerializer):
    """Serializer for rating and reviewing completed reservations."""
    
    class Meta:
        model = Reservation
        fields = ['rating', 'review']

    def validate(self, data):
        if self.instance.status != Reservation.Status.COMPLETED:
            raise serializers.ValidationError(
                "You can only rate completed reservations."
            )
        
        if self.instance.rating is not None:
            raise serializers.ValidationError(
                "You have already rated this reservation."
            )
        
        return data
