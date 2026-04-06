from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Property, Apartment, PropertyImage, ApartmentImage

User = get_user_model()


class PropertyImageSerializer(serializers.ModelSerializer):
    """Serializer for property images."""
    
    class Meta:
        model = PropertyImage
        fields = [
            'id', 'image', 'caption', 'is_primary', 'order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ApartmentImageSerializer(serializers.ModelSerializer):
    """Serializer for apartment images."""
    
    class Meta:
        model = ApartmentImage
        fields = [
            'id', 'image', 'caption', 'is_primary', 'order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PropertySerializer(serializers.ModelSerializer):
    """Serializer for properties."""
    
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    active_apartments_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'name', 'type', 'description', 'address', 'city', 'country',
            'postal_code', 'latitude', 'longitude', 'images', 'amenities',
            'featured_image', 'owner', 'owner_name', 'is_active', 'is_featured',
            'is_verified', 'average_rating', 'total_reviews', 'booking_count',
            'active_apartments_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'average_rating', 'total_reviews', 'booking_count',
            'active_apartments_count', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """Create property with owner from request user."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['owner'] = request.user
        return super().create(validated_data)


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for property lists."""
    
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    active_apartments_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'name', 'type', 'city', 'country', 'featured_image',
            'owner', 'owner_name', 'is_active', 'is_featured', 'is_verified',
            'average_rating', 'total_reviews', 'active_apartments_count',
            'created_at'
        ]


class ApartmentSerializer(serializers.ModelSerializer):
    """Serializer for apartments."""
    
    property_name = serializers.CharField(source='property.name', read_only=True)
    property_owner = serializers.CharField(source='property.owner.get_full_name', read_only=True)
    images = ApartmentImageSerializer(many=True, read_only=True)
    total_price_per_night = serializers.ReadOnlyField()
    
    class Meta:
        model = Apartment
        fields = [
            'id', 'name', 'property', 'property_name', 'property_owner',
            'max_guests', 'bedrooms', 'beds', 'bathrooms', 'price_per_night',
            'cleaning_fee', 'service_fee', 'description', 'amenities',
            'images', 'is_active', 'is_available_for_booking',
            'total_price_per_night', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_price_per_night', 'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """Validate apartment data."""
        # Ensure max_guests is reasonable
        max_guests = data.get('max_guests')
        if max_guests and max_guests > 20:
            raise serializers.ValidationError("Maximum guests cannot exceed 20.")
        
        # Validate pricing
        price_per_night = data.get('price_per_night')
        if price_per_night and price_per_night <= 0:
            raise serializers.ValidationError("Price per night must be greater than 0.")
        
        return data


class ApartmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for apartment lists."""
    
    property_name = serializers.CharField(source='property.name', read_only=True)
    property_city = serializers.CharField(source='property.city', read_only=True)
    total_price_per_night = serializers.ReadOnlyField()
    
    class Meta:
        model = Apartment
        fields = [
            'id', 'name', 'property', 'property_name', 'property_city',
            'max_guests', 'bedrooms', 'beds', 'bathrooms', 'price_per_night',
            'cleaning_fee', 'service_fee', 'featured_image', 'is_active',
            'is_available_for_booking', 'total_price_per_night', 'created_at'
        ]


class ApartmentAvailabilitySerializer(serializers.Serializer):
    """Serializer for checking apartment availability."""
    
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    num_guests = serializers.IntegerField(min_value=1, max_value=20)
    
    def validate(self, data):
        """Validate availability check parameters."""
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        
        if check_in and check_out and check_in >= check_out:
            raise serializers.ValidationError("Check-out date must be after check-in date.")
        
        # Check if dates are not too far in the future
        from datetime import date
        if check_in and check_in > date.today().replace(year=date.today().year + 1):
            raise serializers.ValidationError("Check-in date cannot be more than 1 year in the future.")
        
        return data


class PropertyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating properties."""
    
    images = PropertyImageSerializer(many=True, required=False)
    
    class Meta:
        model = Property
        fields = [
            'name', 'type', 'description', 'address', 'city', 'country',
            'postal_code', 'latitude', 'longitude', 'images', 'amenities',
            'featured_image'
        ]
    
    def create(self, validated_data):
        """Create property with images."""
        images_data = validated_data.pop('images', [])
        request = self.context.get('request')
        
        if request and hasattr(request, 'user'):
            validated_data['owner'] = request.user
        
        property = Property.objects.create(**validated_data)
        
        # Create associated images
        for image_data in images_data:
            PropertyImage.objects.create(property=property, **image_data)
        
        return property


class ApartmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating apartments."""
    
    images = ApartmentImageSerializer(many=True, required=False)
    
    class Meta:
        model = Apartment
        fields = [
            'name', 'property', 'max_guests', 'bedrooms', 'beds', 'bathrooms',
            'price_per_night', 'cleaning_fee', 'service_fee', 'description',
            'amenities', 'images'
        ]
    
    def create(self, validated_data):
        """Create apartment with images."""
        images_data = validated_data.pop('images', [])
        apartment = Apartment.objects.create(**validated_data)
        
        # Create associated images
        for image_data in images_data:
            ApartmentImage.objects.create(apartment=apartment, **image_data)
        
        return apartment


class PropertySearchSerializer(serializers.Serializer):
    """Serializer for property search parameters."""
    
    location = serializers.CharField(required=False)
    check_in = serializers.DateField(required=False)
    check_out = serializers.DateField(required=False)
    num_guests = serializers.IntegerField(min_value=1, max_value=20, required=False)
    property_type = serializers.ChoiceField(
        choices=Property.TYPE_CHOICES,
        required=False
    )
    min_price = serializers.DecimalField(min_value=0, required=False)
    max_price = serializers.DecimalField(min_value=0, required=False)
    amenities = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    rating = serializers.IntegerField(min_value=1, max_value=5, required=False)
    
    def validate(self, data):
        """Validate search parameters."""
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        
        if check_in and not check_out:
            raise serializers.ValidationError("Check-out date is required when check-in is provided.")
        
        if check_in and check_out and check_in >= check_out:
            raise serializers.ValidationError("Check-out date must be after check-in date.")
        
        min_price = data.get('min_price')
        max_price = data.get('max_price')
        
        if min_price and max_price and min_price >= max_price:
            raise serializers.ValidationError("Minimum price must be less than maximum price.")
        
        return data
