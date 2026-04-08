from rest_framework import serializers
from .models import Property, Apartment, AvailableDate, Review


class AvailableDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableDate
        fields = ['id', 'start', 'end', 'created_at']
        read_only_fields = ['id', 'created_at']


class ApartmentSerializer(serializers.ModelSerializer):
    available_dates = AvailableDateSerializer(many=True, read_only=True)
    property_name = serializers.CharField(source='property.name', read_only=True)

    class Meta:
        model = Apartment
        fields = [
            'apartment_id', 'property', 'property_name', 'name', 'type',
            'price', 'max_guests', 'media', 'is_public', 'description',
            'available_dates', 'created_at', 'updated_at',
        ]
        read_only_fields = ['apartment_id', 'created_at', 'updated_at']


class ApartmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing apartments."""
    class Meta:
        model = Apartment
        fields = ['apartment_id', 'name', 'type', 'price', 'max_guests', 'media', 'is_public']


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_photo = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['review_id', 'user', 'user_name', 'user_photo', 'rating', 'comment', 'created_at']
        read_only_fields = ['review_id', 'user', 'user_name', 'user_photo', 'created_at']

    def get_user_photo(self, obj):
        request = self.context.get('request')
        if obj.user.photo and request:
            return request.build_absolute_uri(obj.user.photo.url)
        return None

    def validate_rating(self, value):
        if not 1.0 <= value <= 5.0:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for property listings."""
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    apartments_count = serializers.IntegerField(source='apartments.count', read_only=True)

    class Meta:
        model = Property
        fields = [
            'property_id', 'name', 'type', 'location', 'rating',
            'media', 'is_public', 'views', 'owner_name', 'apartments_count', 'created_at',
        ]


class PropertySerializer(serializers.ModelSerializer):
    """Full property detail serializer."""
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    apartments = ApartmentListSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    reviews_count = serializers.IntegerField(source='reviews.count', read_only=True)

    class Meta:
        model = Property
        fields = [
            'property_id', 'name', 'type', 'location', 'description',
            'amenities', 'media', 'is_public', 'views', 'rating',
            'owner', 'owner_name', 'apartments', 'reviews', 'reviews_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['property_id', 'views', 'rating', 'created_at', 'updated_at']
        extra_kwargs = {
            'owner': {'required': False, 'write_only': True},
        }

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'owner':
            validated_data['owner'] = request.user
        return super().create(validated_data)
