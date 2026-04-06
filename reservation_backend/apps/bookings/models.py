from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import datetime, timedelta
import uuid


class Booking(models.Model):
    """
    Booking model for apartment reservations.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('no_show', 'No Show'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    guest = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
        limit_choices_to={'role': 'client'},
        verbose_name="Guest"
    )
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name="Property"
    )
    apartment = models.ForeignKey(
        'properties.Apartment',
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name="Apartment"
    )
    
    # Booking details
    check_in = models.DateField(verbose_name="Check-in Date")
    check_out = models.DateField(verbose_name="Check-out Date")
    num_nights = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Number of Nights"
    )
    num_guests = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Number of Guests"
    )
    
    # Guest information (for non-registered guests)
    guest_first_name = models.CharField(max_length=50, blank=True, verbose_name="Guest First Name")
    guest_last_name = models.CharField(max_length=50, blank=True, verbose_name="Guest Last Name")
    guest_email = models.EmailField(blank=True, verbose_name="Guest Email")
    guest_phone = models.CharField(max_length=20, blank=True, verbose_name="Guest Phone")
    
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
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Total Amount"
    )
    
    # Payment
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending',
        verbose_name="Payment Status"
    )
    amount_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Amount Paid"
    )
    deposit_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Deposit Amount"
    )
    
    # Status and timestamps
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Booking Status"
    )
    is_guest_reviewed = models.BooleanField(default=False, verbose_name="Guest Reviewed")
    is_host_reviewed = models.BooleanField(default=False, verbose_name="Host Reviewed")
    
    # Notes and special requests
    special_requests = models.TextField(blank=True, verbose_name="Special Requests")
    internal_notes = models.TextField(blank=True, verbose_name="Internal Notes")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    confirmed_at = models.DateTimeField(null=True, blank=True, verbose_name="Confirmed At")
    cancelled_at = models.DateTimeField(null=True, blank=True, verbose_name="Cancelled At")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Completed At")
    
    class Meta:
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['guest', 'status']),
            models.Index(fields=['property', 'status']),
            models.Index(fields=['apartment', 'status']),
            models.Index(fields=['check_in', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['payment_status']),
        ]
    
    def __str__(self):
        guest_name = self.guest.get_full_name() or self.guest.username
        return f"Booking {self.id} - {guest_name} - {self.apartment.name}"
    
    def save(self, *args, **kwargs):
        # Calculate total amount before saving
        if not self.total_amount:
            self.calculate_total_amount()
        
        # Calculate number of nights if not provided
        if self.check_in and self.check_out and not self.num_nights:
            self.num_nights = (self.check_out - self.check_in).days
        
        super().save(*args, **kwargs)
    
    def calculate_total_amount(self):
        """Calculate total booking amount."""
        if self.price_per_night and self.num_nights:
            subtotal = float(self.price_per_night) * self.num_nights
            total = subtotal + float(self.cleaning_fee) + float(self.service_fee)
            self.total_amount = total
    
    @property
    def outstanding_balance(self):
        """Calculate remaining balance to be paid."""
        return float(self.total_amount) - float(self.amount_paid)
    
    @property
    def is_fully_paid(self):
        """Check if booking is fully paid."""
        return self.amount_paid >= self.total_amount
    
    @property
    def can_be_cancelled(self):
        """Check if booking can be cancelled based on business rules."""
        if self.status in ['cancelled', 'completed', 'no_show', 'refunded']:
            return False
        
        # Business rule: Can cancel if check-in is more than 24 hours away
        if self.check_in:
            time_until_checkin = self.check_in - timezone.now().date()
            return time_until_checkin.days >= 1
        
        return False
    
    @property
    def can_be_reviewed(self):
        """Check if booking can be reviewed by guest."""
        return (
            self.status == 'completed' and 
            not self.is_guest_reviewed and
            self.check_out < timezone.now().date()
        )
    
    def confirm_booking(self):
        """Confirm the booking and update timestamps."""
        if self.status == 'pending':
            self.status = 'confirmed'
            self.confirmed_at = timezone.now()
            self.save()
            return True
        return False
    
    def cancel_booking(self, reason=""):
        """Cancel the booking if allowed."""
        if self.can_be_cancelled:
            self.status = 'cancelled'
            self.cancelled_at = timezone.now()
            if reason:
                self.internal_notes = f"Cancelled: {reason}"
            self.save()
            return True
        return False
    
    def complete_booking(self):
        """Mark booking as completed."""
        if self.status == 'confirmed' and self.check_out < timezone.now().date():
            self.status = 'completed'
            self.completed_at = timezone.now()
            self.save()
            return True
        return False
    
    def mark_as_no_show(self):
        """Mark booking as no-show if guest didn't arrive."""
        if self.status == 'confirmed' and self.check_in < timezone.now().date():
            self.status = 'no_show'
            self.save()
            return True
        return False


class BookingPayment(models.Model):
    """
    Individual payment records for bookings.
    """
    
    PAYMENT_METHOD_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('other', 'Other'),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('deposit', 'Deposit'),
        ('full_payment', 'Full Payment'),
        ('partial_payment', 'Partial Payment'),
        ('refund', 'Refund'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name="Booking"
    )
    
    # Payment details
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Amount"
    )
    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        verbose_name="Payment Type"
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        verbose_name="Payment Method"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Payment Status"
    )
    
    # Transaction details
    transaction_id = models.CharField(max_length=100, blank=True, verbose_name="Transaction ID")
    gateway_response = models.JSONField(default=dict, blank=True, verbose_name="Gateway Response")
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name="Processed At")
    
    # Refund details
    refund_reason = models.TextField(blank=True, verbose_name="Refund Reason")
    refund_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Refund Amount"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    class Meta:
        verbose_name = "Booking Payment"
        verbose_name_plural = "Booking Payments"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['transaction_id']),
        ]
    
    def __str__(self):
        return f"Payment {self.amount} for Booking {self.booking.id}"
    
    def process_payment(self, transaction_id, gateway_response):
        """Mark payment as processed."""
        self.status = 'completed'
        self.transaction_id = transaction_id
        self.gateway_response = gateway_response
        self.processed_at = timezone.now()
        self.save()
        
        # Update booking payment status
        self.update_booking_payment_status()
    
    def update_booking_payment_status(self):
        """Update the parent booking's payment status."""
        booking = self.booking
        total_paid = booking.payments.filter(status='completed').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        booking.amount_paid = total_paid
        
        # Update payment status
        if total_paid >= booking.total_amount:
            booking.payment_status = 'paid'
        elif total_paid > 0:
            booking.payment_status = 'partial'
        else:
            booking.payment_status = 'pending'
        
        booking.save(update_fields=['amount_paid', 'payment_status'])


class BookingCancellation(models.Model):
    """
    Cancellation records for bookings.
    """
    
    CANCELLATION_REASON_CHOICES = [
        ('guest_request', 'Guest Request'),
        ('host_request', 'Host Request'),
        ('system', 'System'),
        ('force_majeure', 'Force Majeure'),
        ('payment_issue', 'Payment Issue'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='cancellation',
        verbose_name="Booking"
    )
    
    # Cancellation details
    reason = models.CharField(
        max_length=20,
        choices=CANCELLATION_REASON_CHOICES,
        verbose_name="Cancellation Reason"
    )
    description = models.TextField(verbose_name="Description")
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='cancelled_bookings',
        verbose_name="Cancelled By"
    )
    
    # Refund information
    refund_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Refund Amount"
    )
    refund_policy = models.CharField(max_length=100, blank=True, verbose_name="Refund Policy Applied")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    
    class Meta:
        verbose_name = "Booking Cancellation"
        verbose_name_plural = "Booking Cancellations"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Cancellation of Booking {self.booking.id}"
