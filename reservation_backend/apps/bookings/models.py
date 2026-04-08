import uuid
from datetime import date, timedelta
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        CONFIRMED = 'confirmed', _('Confirmed')
        REFUSED = 'refused', _('Refused')
        CANCELLED = 'cancelled', _('Cancelled')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='bookings',
        null=True, blank=True,
    )
    property_obj = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='bookings',
    )
    apartment = models.ForeignKey(
        'properties.Apartment',
        on_delete=models.CASCADE,
        related_name='bookings',
        null=True, blank=True,
    )

    # Guest info (for walk-in / anonymous guests)
    first_name = models.CharField(max_length=60, null=True, blank=True)
    last_name = models.CharField(max_length=60, null=True, blank=True)
    phone = models.CharField(max_length=25, null=True, blank=True)

    # Dates
    date_in = models.DateField()
    num_nights = models.PositiveSmallIntegerField(default=1)
    date_out = models.DateField()

    # Payment
    payment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rest = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_paid = models.BooleanField(default=False)

    # Status
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True, default='')

    # Audit
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='created_bookings',
        null=True, blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Booking')
        verbose_name_plural = _('Bookings')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['date_in']),
            models.Index(fields=['property_obj']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        guest = self.user.username if self.user else f'{self.first_name} {self.last_name}'
        return f'Booking {self.id} - {guest} @ {self.property_obj.name}'

    def clean(self):
        """Server-side validation — called before save()."""
        today = timezone.now().date()

        # ── 1. Prevent bookings in the past ───────────────────────────────────
        if self.date_in and self.date_in < today:
            raise ValidationError({
                'date_in': _('Check-in date cannot be in the past.')
            })

        # ── 2. Minimum 1 night ────────────────────────────────────────────────
        if self.num_nights is not None and self.num_nights < 1:
            raise ValidationError({
                'num_nights': _('Booking must be at least 1 night.')
            })

        # ── 3. Calculate and validate date_out ────────────────────────────────
        if self.date_in and self.num_nights:
            self.date_out = self.date_in + timedelta(days=self.num_nights)

        # ── 4. Check apartment availability ───────────────────────────────────
        if self.apartment and self.date_in and self.num_nights:
            exclude_id = self.id if self.pk else None
            if not self.apartment.is_available(self.date_in, self.num_nights, exclude_id):
                raise ValidationError({
                    'apartment': _(
                        'This apartment is not available for the selected dates. '
                        'Please choose different dates or another unit.'
                    )
                })

    def save(self, *args, **kwargs):
        # Run full validation
        self.full_clean()

        is_new = self.pk is None
        old_status = None

        if not is_new:
            try:
                old = Booking.objects.get(pk=self.pk)
                old_status = old.status
            except Booking.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        # ── Manage apartment availability on status transitions ────────────────
        if self.apartment:
            if is_new and self.status == self.Status.CONFIRMED:
                self.apartment.book_dates(self.date_in, self.num_nights)

            elif not is_new and old_status != self.Status.CONFIRMED and self.status == self.Status.CONFIRMED:
                self.apartment.book_dates(self.date_in, self.num_nights)

            elif not is_new and old_status == self.Status.CONFIRMED and self.status in (
                self.Status.REFUSED, self.Status.CANCELLED, self.Status.PENDING
            ):
                self.apartment.add_available_dates(self.date_in, self.date_out)

    def delete(self, *args, **kwargs):
        # Restore availability if a confirmed booking is deleted
        if self.apartment and self.status == self.Status.CONFIRMED:
            self.apartment.add_available_dates(self.date_in, self.date_out)
        super().delete(*args, **kwargs)

    @property
    def total_amount(self):
        return (self.payment or 0) + (self.rest or 0)

    @property
    def guest_name(self):
        if self.user:
            return self.user.full_name
        parts = [self.first_name, self.last_name]
        return ' '.join(p for p in parts if p) or 'Unknown Guest'
