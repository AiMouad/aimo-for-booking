from rest_framework import serializers
from .models import Availability
from django.utils import timezone


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['id', 'worker', 'start_time', 'end_time', 'is_recurring', 'day_of_week']
        read_only_fields = ['id', 'worker']

    def validate(self, data):
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError("End time must be after start time.")
            
        if start_time and start_time < timezone.now():
            raise serializers.ValidationError({"start_time": "Availability cannot be in the past."})

        return data

    def create(self, validated_data):
        # Auto-set the worker to the requesting user
        request = self.context.get('request')
        validated_data['worker'] = request.user
        return super().create(validated_data)
