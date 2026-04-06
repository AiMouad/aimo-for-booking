from rest_framework import serializers
from .models import Category, Service


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'description', 'image', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ServiceSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'price', 'duration_minutes',
            'category', 'category_detail', 'image', 'is_active', 'created_at', 'updated_at',
            'max_advance_booking_days', 'min_cancellation_hours', 
            'requires_deposit', 'deposit_amount'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ServiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'price', 'duration_minutes', 
            'category_name', 'category_icon', 'image', 'is_active'
        ]
