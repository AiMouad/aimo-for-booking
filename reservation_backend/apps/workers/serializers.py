from rest_framework import serializers
from .models import WorkerProfile, WorkerSchedule
from apps.users.serializers import UserPublicSerializer


class WorkerScheduleSerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = WorkerSchedule
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time', 'is_available']
        read_only_fields = ['id', 'day_name']


class WorkerProfileSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    schedules = WorkerScheduleSerializer(many=True, read_only=True)
    assigned_properties_count = serializers.IntegerField(
        source='assigned_properties.count', read_only=True
    )

    class Meta:
        model = WorkerProfile
        fields = [
            'id', 'user', 'bio', 'specialization',
            'assigned_properties', 'assigned_properties_count',
            'is_available', 'schedules',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
