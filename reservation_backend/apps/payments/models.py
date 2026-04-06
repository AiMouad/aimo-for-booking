from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid


class Payment(models.Model):
    """
    Payment model for booking transactions.
    """
    
    PAYMENT_METHOD_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('crypto', 'Cryptocurrency'),
        ('other', 'Other'),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('deposit', 'Deposit'),
        ('full_payment', 'Full Payment'),
        ('partial_payment', 'Partial Payment'),
        ('refund', 'Refund'),
        ('partial_refund', 'Partial Refund'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
        ('disputed', 'Disputed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name="Booking"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        verbose_name="User"
    )
    
    # Payment details
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Amount"
    )
    currency = models.CharField(max_length=3, default='USD', verbose_name="Currency")
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        verbose_name="Payment Method"
    )
    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        verbose_name="Payment Type"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Status"
    )
    
    # Transaction details
    transaction_id = models.CharField(max_length=100, blank=True, verbose_name="Transaction ID")
    gateway = models.CharField(max_length=50, blank=True, verbose_name="Payment Gateway")
    gateway_response = models.JSONField(default=dict, blank=True, verbose_name="Gateway Response")
    gateway_fee = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Gateway Fee"
    )
    
    # Refund details
    refund_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Refund Amount"
    )
    refund_reason = models.TextField(blank=True, verbose_name="Refund Reason")
    refund_transaction_id = models.CharField(max_length=100, blank=True, verbose_name="Refund Transaction ID")
    
    # Metadata
    description = models.TextField(blank=True, verbose_name="Description")
    notes = models.TextField(blank=True, verbose_name="Internal Notes")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name="Processed At")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Completed At")
    
    class Meta:
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking', 'status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['gateway']),
        ]
    
    def __str__(self):
        return f"Payment {self.amount} {self.currency} for Booking {self.booking.id}"
    
    def process_payment(self, transaction_id, gateway_response):
        """Process payment completion."""
        self.status = 'completed'
        self.transaction_id = transaction_id
        self.gateway_response = gateway_response
        self.processed_at = timezone.now()
        self.save()
        
        # Update booking payment status
        self.update_booking_payment_status()
    
    def process_refund(self, refund_amount, refund_reason, refund_transaction_id=None):
        """Process payment refund."""
        self.status = 'refunded'
        self.refund_amount = refund_amount
        self.refund_reason = refund_reason
        self.refund_transaction_id = refund_transaction_id
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


class PaymentMethod(models.Model):
    """
    User's saved payment methods.
    """
    
    METHOD_TYPE_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('bank_account', 'Bank Account'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_methods',
        verbose_name="User"
    )
    
    method_type = models.CharField(
        max_length=20,
        choices=METHOD_TYPE_CHOICES,
        verbose_name="Method Type"
    )
    
    # Card details (encrypted)
    card_last_four = models.CharField(max_length=4, blank=True, verbose_name="Last Four Digits")
    card_brand = models.CharField(max_length=20, blank=True, verbose_name="Card Brand")
    card_expiry_month = models.IntegerField(null=True, blank=True, verbose_name="Expiry Month")
    card_expiry_year = models.IntegerField(null=True, blank=True, verbose_name="Expiry Year")
    
    # Bank details (encrypted)
    bank_name = models.CharField(max_length=100, blank=True, verbose_name="Bank Name")
    account_last_four = models.CharField(max_length=4, blank=True, verbose_name="Account Last Four")
    
    # External provider details
    provider_customer_id = models.CharField(max_length=100, blank=True, verbose_name="Provider Customer ID")
    provider_payment_method_id = models.CharField(max_length=100, blank=True, verbose_name="Provider Payment Method ID")
    
    # Metadata
    nickname = models.CharField(max_length=50, blank=True, verbose_name="Nickname")
    is_default = models.BooleanField(default=False, verbose_name="Default Method")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    class Meta:
        verbose_name = "Payment Method"
        verbose_name_plural = "Payment Methods"
        ordering = ['-is_default', '-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['user', 'is_default']),
        ]
    
    def __str__(self):
        return f"{self.nickname or self.method_type} for {self.user.full_name}"


class RefundPolicy(models.Model):
    """
    Refund policies for properties.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='refund_policies',
        verbose_name="Property"
    )
    
    name = models.CharField(max_length=100, verbose_name="Policy Name")
    description = models.TextField(verbose_name="Description")
    
    # Refund rules
    full_refund_days = models.IntegerField(
        default=7,
        validators=[MinValueValidator(0)],
        verbose_name="Full Refund Days Before Check-in"
    )
    partial_refund_days = models.IntegerField(
        default=3,
        validators=[MinValueValidator(0)],
        verbose_name="Partial Refund Days Before Check-in"
    )
    partial_refund_percentage = models.IntegerField(
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Partial Refund Percentage"
    )
    
    # Conditions
    no_show_refund = models.BooleanField(default=False, verbose_name="Refund for No-Show")
    weather_refund = models.BooleanField(default=False, verbose_name="Weather-related Refund")
    emergency_refund = models.BooleanField(default=True, verbose_name="Emergency Refund")
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name="Active")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    class Meta:
        verbose_name = "Refund Policy"
        verbose_name_plural = "Refund Policies"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['property', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.property.name}"
    
    def calculate_refund(self, check_in, cancellation_date, cancellation_reason='guest_request'):
        """
        Calculate refund amount based on policy and cancellation timing.
        
        Args:
            check_in (date): Original check-in date
            cancellation_date (date): When booking was cancelled
            cancellation_reason (str): Reason for cancellation
            
        Returns:
            tuple: (refund_percentage, refund_amount, policy_applied)
        """
        days_until_checkin = (check_in - cancellation_date).days
        
        # Check for special conditions
        if cancellation_reason == 'emergency' and self.emergency_refund:
            return 100, 'full', 'emergency_policy'
        
        if days_until_checkin >= self.full_refund_days:
            return 100, 'full', 'full_refund_policy'
        elif days_until_checkin >= self.partial_refund_days:
            return self.partial_refund_percentage, 'partial', 'partial_refund_policy'
        elif cancellation_reason == 'no_show' and self.no_show_refund:
            return 0, 'none', 'no_show_policy'
        else:
            return 0, 'none', 'no_refund_policy'


class Invoice(models.Model):
    """
    Invoice generation for bookings and payments.
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='invoices',
        verbose_name="Booking"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
        verbose_name="User"
    )
    
    # Invoice details
    invoice_number = models.CharField(max_length=50, unique=True, verbose_name="Invoice Number")
    issue_date = models.DateField(verbose_name="Issue Date")
    due_date = models.DateField(verbose_name="Due Date")
    
    # Amounts
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Subtotal"
    )
    tax_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Tax Amount"
    )
    discount_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Discount Amount"
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Total Amount"
    )
    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Paid Amount"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name="Status"
    )
    
    # Notes
    notes = models.TextField(blank=True, verbose_name="Notes")
    terms = models.TextField(blank=True, verbose_name="Terms and Conditions")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name="Paid At")
    
    class Meta:
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking', 'status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['invoice_number']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"Invoice {self.invoice_number}"
    
    def generate_invoice_number(self):
        """Generate unique invoice number."""
        from django.utils import timezone
        year = timezone.now().year
        month = timezone.now().month
        
        # Get the last invoice for this month
        last_invoice = Invoice.objects.filter(
            invoice_number__startswith=f"INV-{year}{month:02d}"
        ).order_by('-invoice_number').first()
        
        if last_invoice:
            # Extract sequence number and increment
            last_seq = int(last_invoice.invoice_number.split('-')[-1])
            seq = last_seq + 1
        else:
            seq = 1
        
        self.invoice_number = f"INV-{year}{month:02d}-{seq:04d}"
        self.save(update_fields=['invoice_number'])
    
    @property
    def outstanding_balance(self):
        """Calculate outstanding balance."""
        return float(self.total_amount) - float(self.paid_amount)
    
    @property
    def is_paid(self):
        """Check if invoice is fully paid."""
        return self.paid_amount >= self.total_amount
    
    def mark_as_paid(self, amount=None):
        """Mark invoice as paid."""
        if amount is None:
            amount = self.outstanding_balance
        
        self.paid_amount += amount
        if self.is_paid:
            self.status = 'paid'
            self.paid_at = timezone.now()
        
        self.save(update_fields=['paid_amount', 'status', 'paid_at'])
