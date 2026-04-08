import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from datetime import datetime, timedelta


class Property(models.Model):
    class Type(models.TextChoices):
        HOTEL = 'hotel', _('Hotel')
        RESIDENCE = 'residence', _('Residence')
        APARTMENT = 'apartment', _('Apartment')
        VILLA = 'villa', _('Villa')
        OFFICE = 'office', _('Office / Co-working')

    property_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.APARTMENT)
    location = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    amenities = models.JSONField(default=list, blank=True)   # e.g. ["WiFi", "Pool", "Parking"]
    media = models.JSONField(default=list, blank=True)       # list of image URLs
    is_public = models.BooleanField(default=True)
    views = models.PositiveIntegerField(default=0)
    rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_properties',
        limit_choices_to={'role': 'owner'},
        null=True, blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Property')
        verbose_name_plural = _('Properties')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['type']),
            models.Index(fields=['is_public']),
        ]

    def __str__(self):
        return self.name

    def update_rating(self):
        """Recalculate average rating from all reviews."""
        reviews = self.reviews.all()
        if reviews.exists():
            avg = reviews.aggregate(models.Avg('rating'))['rating__avg']
            self.rating = round(avg, 2)
        else:
            self.rating = 0.0
        self.save(update_fields=['rating'])


class AvailableDate(models.Model):
    """Stores available date ranges for an apartment."""
    apartment = models.ForeignKey(
        'Apartment', on_delete=models.CASCADE, related_name='available_dates'
    )
    start = models.DateField()
    end = models.DateField(null=True, blank=True)  # None = indefinite
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Available Date Range')
        verbose_name_plural = _('Available Date Ranges')
        ordering = ['start']

    def __str__(self):
        end_str = self.end.strftime('%Y-%m-%d') if self.end else 'open-ended'
        return f'{self.apartment.name}: {self.start:%Y-%m-%d} → {end_str}'


class Apartment(models.Model):
    """A bookable unit within a Property."""
    apartment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name='apartments'
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=100, help_text='e.g. Studio, Suite, 2-BR')
    price = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    max_guests = models.PositiveSmallIntegerField(default=2)
    media = models.JSONField(default=list, blank=True)
    is_public = models.BooleanField(default=True)
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Apartment / Unit')
        verbose_name_plural = _('Apartments / Units')
        ordering = ['property', 'name']

    def __str__(self):
        return f'{self.name} — {self.property.name}'

    # ── Availability logic (ported + improved from source) ────────────────────

    def is_available(self, date_in, num_nights, exclude_booking_id=None):
        """
        Check if this apartment is available for [date_in, date_in + num_nights).
        Checks:
          1. Falls within an AvailableDate range
          2. No conflicting pending/confirmed booking
        """
        from datetime import date as date_type
        if isinstance(date_in, str):
            date_in = datetime.strptime(date_in, '%Y-%m-%d').date()

        date_out = date_in + timedelta(days=int(num_nights))

        # 1. Must fall within an available range
        in_range = False
        for avail in self.available_dates.all():
            range_ok = avail.start <= date_in and (
                avail.end is None or date_out <= avail.end
            )
            if range_ok:
                in_range = True
                break

        if not in_range:
            return False

        # 2. No overlapping confirmed/pending bookings
        from apps.bookings.models import Booking
        conflicts = Booking.objects.filter(
            apartment=self,
            status__in=['pending', 'confirmed'],
            date_in__lt=date_out,
            date_out__gt=date_in,
        )
        if exclude_booking_id:
            conflicts = conflicts.exclude(id=exclude_booking_id)

        return not conflicts.exists()

    def book_dates(self, date_in, num_nights):
        """
        Remove the booked period from available date ranges, splitting as needed.
        Returns True on success, False if not available.
        """
        if isinstance(date_in, str):
            date_in = datetime.strptime(date_in, '%Y-%m-%d').date()

        date_out = date_in + timedelta(days=int(num_nights))

        for avail in self.available_dates.all():
            range_covers = avail.start <= date_in and (
                avail.end is None or date_out <= avail.end
            )
            if range_covers:
                # Create the "before" portion if it exists
                if avail.start < date_in:
                    AvailableDate.objects.create(
                        apartment=self, start=avail.start, end=date_in
                    )
                # Create the "after" portion if it exists
                if avail.end is None or date_out < avail.end:
                    AvailableDate.objects.create(
                        apartment=self, start=date_out, end=avail.end
                    )
                avail.delete()
                return True

        return False

    def add_available_dates(self, start_date, end_date=None):
        """
        Add a new available range, merging with adjacent/overlapping ranges.
        Used when a booking is cancelled or refused.
        """
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date and isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

        overlapping = []
        for avail in self.available_dates.all():
            if self._overlaps_or_adjacent(start_date, end_date, avail.start, avail.end):
                overlapping.append(avail)

        if overlapping:
            all_starts = [start_date] + [r.start for r in overlapping]
            all_ends = [end_date] + [r.end for r in overlapping if r.end is not None]
            merged_start = min(all_starts)
            merged_end = max(all_ends) if all_ends and end_date is not None else None

            for r in overlapping:
                r.delete()

            AvailableDate.objects.create(apartment=self, start=merged_start, end=merged_end)
        else:
            AvailableDate.objects.create(apartment=self, start=start_date, end=end_date)

    @staticmethod
    def _overlaps_or_adjacent(s1, e1, s2, e2):
        """True if [s1,e1] and [s2,e2] overlap or are adjacent (any None = open-ended)."""
        if e1 is None and e2 is None:
            return True
        if e1 is None:
            return e2 >= s1 if e2 else True
        if e2 is None:
            return e1 >= s2
        return (s1 <= e2 and s2 <= e1) or e1 == s2 or e2 == s1


class Review(models.Model):
    """A guest review for a Property."""
    review_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews',
        limit_choices_to={'role__in': ['client', 'guest']},
    )
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name='reviews'
    )
    rating = models.FloatField(validators=[MinValueValidator(1.0), MaxValueValidator(5.0)])
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Review')
        verbose_name_plural = _('Reviews')
        ordering = ['-created_at']
        # One review per user per property
        unique_together = [('user', 'property')]

    def __str__(self):
        return f'Review by {self.user.username} for {self.property.name} ({self.rating}★)'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update property's average rating
        self.property.update_rating()
