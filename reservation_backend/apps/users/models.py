from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from django.utils import timezone
import uuid


class User(AbstractUser):
    """Custom User model with role-based access and enhanced features"""
    
    class Role(models.TextChoices):
        OWNER = 'OWNER', _('Owner')
        WORKER = 'WORKER', _('Worker')
        CLIENT = 'CLIENT', _('Client')
    
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        INACTIVE = 'INACTIVE', _('Inactive')
        SUSPENDED = 'SUSPENDED', _('Suspended')
        PENDING_VERIFICATION = 'PENDING_VERIFICATION', _('Pending Verification')
    
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name="Email Address")
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ],
        verbose_name="Phone Number"
    )
    
    # Profile information
    first_name = models.CharField(max_length=50, verbose_name="First Name")
    last_name = models.CharField(max_length=50, verbose_name="Last Name")
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, verbose_name="Avatar")
    bio = models.TextField(blank=True, max_length=500, verbose_name="Bio")
    
    # Role and status
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CLIENT,
        verbose_name="Role"
    )
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.ACTIVE,
        verbose_name="Account Status"
    )
    
    # Verification and security
    is_email_verified = models.BooleanField(default=False, verbose_name="Email Verified")
    is_phone_verified = models.BooleanField(default=False, verbose_name="Phone Verified")
    email_verification_token = models.CharField(max_length=255, blank=True, verbose_name="Email Verification Token")
    email_verification_expires = models.DateTimeField(null=True, blank=True, verbose_name="Email Verification Expires")
    password_reset_token = models.CharField(max_length=255, blank=True, verbose_name="Password Reset Token")
    password_reset_expires = models.DateTimeField(null=True, blank=True, verbose_name="Password Reset Expires")
    
    # Business information (for owners)
    company_name = models.CharField(max_length=100, blank=True, verbose_name="Company Name")
    tax_id = models.CharField(max_length=50, blank=True, verbose_name="Tax ID")
    business_license = models.FileField(upload_to='licenses/', null=True, blank=True, verbose_name="Business License")
    
    # Preferences
    language = models.CharField(max_length=10, default='en', verbose_name="Language")
    timezone = models.CharField(max_length=50, default='UTC', verbose_name="Timezone")
    currency = models.CharField(max_length=3, default='USD', verbose_name="Currency")
    
    # Statistics
    last_login_ip = models.GenericIPAddressField(null=True, blank=True, verbose_name="Last Login IP")
    login_count = models.IntegerField(default=0, verbose_name="Login Count")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    last_login = models.DateTimeField(null=True, blank=True, verbose_name="Last Login")
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['status']),
            models.Index(fields=['is_email_verified']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
    
    @property
    def is_owner(self):
        return self.role == self.Role.OWNER
    
    @property
    def is_worker(self):
        return self.role == self.Role.WORKER
    
    @property
    def is_client(self):
        return self.role == self.Role.CLIENT
    
    @property
    def is_verified(self):
        """Check if user is fully verified."""
        return self.is_email_verified and self.is_phone_verified
    
    @property
    def full_name(self):
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def update_login_info(self, ip_address=None):
        """Update login information."""
        self.last_login = timezone.now()
        self.login_count += 1
        if ip_address:
            self.last_login_ip = ip_address
        self.save(update_fields=['last_login', 'login_count', 'last_login_ip'])
    
    def generate_email_verification_token(self):
        """Generate email verification token."""
        from django.utils.crypto import get_random_string
        self.email_verification_token = get_random_string(64)
        self.email_verification_expires = timezone.now() + timezone.timedelta(hours=24)
        self.save(update_fields=['email_verification_token', 'email_verification_expires'])
    
    def verify_email(self, token):
        """Verify email with token."""
        if (
            self.email_verification_token == token and 
            self.email_verification_expires and 
            self.email_verification_expires > timezone.now()
        ):
            self.is_email_verified = True
            self.email_verification_token = ''
            self.email_verification_expires = None
            self.save(update_fields=['is_email_verified', 'email_verification_token', 'email_verification_expires'])
            return True
        return False


class UserProfile(models.Model):
    """Extended user profile information."""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name="User"
    )
    
    # Address information
    address_line_1 = models.CharField(max_length=255, blank=True, verbose_name="Address Line 1")
    address_line_2 = models.CharField(max_length=255, blank=True, verbose_name="Address Line 2")
    city = models.CharField(max_length=100, blank=True, verbose_name="City")
    state = models.CharField(max_length=100, blank=True, verbose_name="State/Province")
    postal_code = models.CharField(max_length=20, blank=True, verbose_name="Postal Code")
    country = models.CharField(max_length=100, blank=True, verbose_name="Country")
    
    # Preferences
    notification_email = models.BooleanField(default=True, verbose_name="Email Notifications")
    notification_sms = models.BooleanField(default=False, verbose_name="SMS Notifications")
    newsletter_subscription = models.BooleanField(default=False, verbose_name="Newsletter Subscription")
    
    # Social links
    website = models.URLField(blank=True, verbose_name="Website")
    linkedin = models.URLField(blank=True, verbose_name="LinkedIn")
    twitter = models.URLField(blank=True, verbose_name="Twitter")
    facebook = models.URLField(blank=True, verbose_name="Facebook")
    
    # Additional information
    date_of_birth = models.DateField(null=True, blank=True, verbose_name="Date of Birth")
    gender = models.CharField(max_length=10, blank=True, verbose_name="Gender")
    nationality = models.CharField(max_length=50, blank=True, verbose_name="Nationality")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['city', 'country']),
        ]
    
    def __str__(self):
        return f"Profile of {self.user.full_name}"
    
    @property
    def full_address(self):
        """Get formatted full address."""
        parts = [
            self.address_line_1,
            self.address_line_2,
            self.city,
            self.state,
            self.postal_code,
            self.country
        ]
        return ", ".join(filter(None, parts))


class UserActivity(models.Model):
    """Track user activities for analytics and security."""
    
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('register', 'Register'),
        ('password_change', 'Password Change'),
        ('password_reset', 'Password Reset'),
        ('email_verify', 'Email Verify'),
        ('profile_update', 'Profile Update'),
        ('booking_create', 'Booking Create'),
        ('booking_cancel', 'Booking Cancel'),
        ('property_create', 'Property Create'),
        ('property_update', 'Property Update'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='activities',
        verbose_name="User"
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, verbose_name="Action")
    description = models.TextField(blank=True, verbose_name="Description")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP Address")
    user_agent = models.TextField(blank=True, verbose_name="User Agent")
    
    # Related object (optional)
    content_type = models.ForeignKey(
        'contenttypes.ContentType',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Content Type"
    )
    object_id = models.UUIDField(null=True, blank=True, verbose_name="Object ID")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    
    class Meta:
        verbose_name = "User Activity"
        verbose_name_plural = "User Activities"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['action', 'created_at']),
            models.Index(fields=['ip_address']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} - {self.action} at {self.created_at}"