from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import datetime, timedelta
import uuid


class Property(models.Model):
    """
    Property model representing hotels, residences, or apartment buildings.
    Owned by a user with 'owner' role.
    """
    TYPE_CHOICES = [
        ('hotel', 'Hotel'),
        ('residence', 'Residence'),
        ('apartment', 'Apartment Building'),
        ('villa', 'Villa'),
        ('hostel', 'Hostel'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="Property Name")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Property Type")
    description = models.TextField(blank=True, verbose_name="Description")
    
    # Location
    address = models.CharField(max_length=255, verbose_name="Address")
    city = models.CharField(max_length=100, verbose_name="City")
    country = models.CharField(max_length=100, verbose_name="Country")
    postal_code = models.CharField(max_length=20, verbose_name="Postal Code")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Media and amenities
    images = models.JSONField(default=list, verbose_name="Property Images")
    amenities = models.JSONField(default=list, verbose_name="Amenities")
    featured_image = models.URLField(blank=True, verbose_name="Featured Image URL")
    
    # Business fields
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_properties',
        limit_choices_to={'role': 'owner'},
        verbose_name="Property Owner"
    )
    
    # Status and visibility
    is_active = models.BooleanField(default=True, verbose_name="Active")
    is_featured = models.BooleanField(default=False, verbose_name="Featured")
    is_verified = models.BooleanField(default=False, verbose_name="Verified")
    
    # Ratings and statistics
    average_rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        verbose_name="Average Rating"
    )
    total_reviews = models.IntegerField(default=0, verbose_name="Total Reviews")
    booking_count = models.IntegerField(default=0, verbose_name="Total Bookings")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    class Meta:
        verbose_name = "Property"
        verbose_name_plural = "Properties"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'is_active']),
            models.Index(fields=['city', 'is_active']),
            models.Index(fields=['type', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.city}"
    
    @property
    def full_address(self):
        """Return formatted full address."""
        parts = [self.address, self.city, self.postal_code, self.country]
        return ", ".join(filter(None, parts))
    
    @property
    def active_apartments_count(self):
        """Count of active apartments."""
        return self.apartments.filter(is_active=True).count()
    
    def update_rating(self):
        """Update average rating based on reviews."""
        from apps.reviews.models import Review
        reviews = Review.objects.filter(booking__property=self, is_active=True)
        if reviews.exists():
            self.average_rating = reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0.0
            self.total_reviews = reviews.count()
        else:
            self.average_rating = 0.0
            self.total_reviews = 0
        self.save(update_fields=['average_rating', 'total_reviews'])


class Apartment(models.Model):
    """
    Individual apartment/unit within a property.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="Apartment Name")
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='apartments',
        verbose_name="Property"
    )
    
    # Capacity and pricing
    max_guests = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)],
        verbose_name="Maximum Guests"
    )
    bedrooms = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        default=1,
        verbose_name="Bedrooms"
    )
    beds = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(20)],
        default=1,
        verbose_name="Beds"
    )
    bathrooms = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        default=1,
        verbose_name="Bathrooms"
    )
    
    # Pricing
    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Price per Night"
    )
    cleaning_fee = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Cleaning Fee"
    )
    service_fee = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Service Fee"
    )
    
    # Description and amenities
    description = models.TextField(blank=True, verbose_name="Description")
    amenities = models.JSONField(default=list, verbose_name="Apartment Amenities")
    images = models.JSONField(default=list, verbose_name="Apartment Images")
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name="Active")
    is_available_for_booking = models.BooleanField(default=True, verbose_name="Available for Booking")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    class Meta:
        verbose_name = "Apartment"
        verbose_name_plural = "Apartments"
        ordering = ['property', 'name']
        indexes = [
            models.Index(fields=['property', 'is_active']),
            models.Index(fields=['max_guests', 'is_active']),
            models.Index(fields=['price_per_night']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.property.name}"
    
    @property
    def total_price_per_night(self):
        """Calculate total price including fees."""
        return float(self.price_per_night) + float(self.cleaning_fee) + float(self.service_fee)
    
    def is_available(self, check_in, check_out, exclude_booking_id=None):
        """
        Check if apartment is available for given date range.
        
        Args:
            check_in (date): Check-in date
            check_out (date): Check-out date
            exclude_booking_id (UUID, optional): Exclude this booking from conflict check
            
        Returns:
            bool: True if available, False otherwise
        """
        if not self.is_active or not self.is_available_for_booking:
            return False
        
        # Check for overlapping bookings
        from apps.bookings.models import Booking
        
        conflicting_bookings = Booking.objects.filter(
            apartment=self,
            status__in=['pending', 'confirmed'],
            check_in__lt=check_out,
            check_out__gt=check_in
        )
        
        if exclude_booking_id:
            conflicting_bookings = conflicting_bookings.exclude(id=exclude_booking_id)
        
        return not conflicting_bookings.exists()
    
    def get_available_dates(self, start_date, end_date=None):
        """
        Get available date ranges for the apartment.
        This would integrate with a calendar/availability system.
        """
        # This would be implemented with a proper availability calendar
        # For now, return basic availability
        return True


class PropertyImage(models.Model):
    """
    Individual property images with ordering and metadata.
    """
    
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='property_images',
        verbose_name="Property"
    )
    image = models.ImageField(upload_to='property_images/', verbose_name="Image")
    caption = models.CharField(max_length=200, blank=True, verbose_name="Caption")
    is_primary = models.BooleanField(default=False, verbose_name="Primary Image")
    order = models.IntegerField(default=0, verbose_name="Display Order")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    
    class Meta:
        verbose_name = "Property Image"
        verbose_name_plural = "Property Images"
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['property', 'is_primary']),
            models.Index(fields=['property', 'order']),
        ]
    
    def __str__(self):
        return f"{self.property.name} - Image {self.order}"


class ApartmentImage(models.Model):
    """
    Individual apartment images with ordering and metadata.
    """
    
    apartment = models.ForeignKey(
        Apartment,
        on_delete=models.CASCADE,
        related_name='apartment_images',
        verbose_name="Apartment"
    )
    image = models.ImageField(upload_to='apartment_images/', verbose_name="Image")
    caption = models.CharField(max_length=200, blank=True, verbose_name="Caption")
    is_primary = models.BooleanField(default=False, verbose_name="Primary Image")
    order = models.IntegerField(default=0, verbose_name="Display Order")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    
    class Meta:
        verbose_name = "Apartment Image"
        verbose_name_plural = "Apartment Images"
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['apartment', 'is_primary']),
            models.Index(fields=['apartment', 'order']),
        ]
    
    def __str__(self):
        return f"{self.apartment.name} - Image {self.order}"
