from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid


class Review(models.Model):
    """
    Review model for booking experiences.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('published', 'Published'),
        ('hidden', 'Hidden'),
        ('flagged', 'Flagged'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    booking = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='review',
        verbose_name="Booking"
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_given',
        limit_choices_to={'role': 'client'},
        verbose_name="Reviewer"
    )
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name="Property"
    )
    apartment = models.ForeignKey(
        'properties.Apartment',
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True,
        verbose_name="Apartment"
    )
    
    # Review content
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Rating"
    )
    title = models.CharField(max_length=100, blank=True, verbose_name="Review Title")
    comment = models.TextField(verbose_name="Review Comment")
    
    # Detailed ratings (optional)
    cleanliness_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Cleanliness Rating"
    )
    accuracy_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Accuracy Rating"
    )
    location_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Location Rating"
    )
    check_in_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Check-in Rating"
    )
    value_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Value Rating"
    )
    
    # Status and moderation
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Status"
    )
    is_verified = models.BooleanField(default=False, verbose_name="Verified Stay")
    featured = models.BooleanField(default=False, verbose_name="Featured Review")
    
    # Response from host
    host_response = models.TextField(blank=True, verbose_name="Host Response")
    host_response_date = models.DateTimeField(null=True, blank=True, verbose_name="Host Response Date")
    
    # Moderation
    flagged_reason = models.TextField(blank=True, verbose_name="Flagged Reason")
    moderated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_reviews',
        limit_choices_to={'role': 'owner'},
        verbose_name="Moderated By"
    )
    moderated_at = models.DateTimeField(null=True, blank=True, verbose_name="Moderated At")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    class Meta:
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['property', 'status']),
            models.Index(fields=['apartment', 'status']),
            models.Index(fields=['reviewer', 'status']),
            models.Index(fields=['rating', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['featured', 'status']),
        ]
    
    def __str__(self):
        return f"Review {self.rating} by {self.reviewer.full_name} for {self.property.name}"
    
    def save(self, *args, **kwargs):
        # Set property and apartment from booking if not provided
        if not self.property and self.booking:
            self.property = self.booking.property
        if not self.apartment and self.booking:
            self.apartment = self.booking.apartment
        
        super().save(*args, **kwargs)
        
        # Update property rating after saving
        if self.status == 'published':
            self.property.update_rating()
    
    @property
    def average_detailed_rating(self):
        """Calculate average of detailed ratings."""
        ratings = [
            self.cleanliness_rating,
            self.accuracy_rating,
            self.location_rating,
            self.check_in_rating,
            self.value_rating
        ]
        ratings = [r for r in ratings if r is not None]
        return sum(ratings) / len(ratings) if ratings else None
    
    def can_be_reviewed(self):
        """Check if this review can be edited."""
        return self.status == 'pending' and self.created_at > timezone.now() - timezone.timedelta(days=30)
    
    def publish(self):
        """Publish the review."""
        self.status = 'published'
        self.save()
    
    def hide(self):
        """Hide the review."""
        self.status = 'hidden'
        self.save()
    
    def flag(self, reason):
        """Flag the review for moderation."""
        self.status = 'flagged'
        self.flagged_reason = reason
        self.save()
    
    def add_host_response(self, response):
        """Add response from host."""
        self.host_response = response
        self.host_response_date = timezone.now()
        self.save()


class ReviewImage(models.Model):
    """
    Images associated with reviews.
    """
    
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name="Review"
    )
    image = models.ImageField(upload_to='review_images/', verbose_name="Image")
    caption = models.CharField(max_length=200, blank=True, verbose_name="Caption")
    order = models.IntegerField(default=0, verbose_name="Display Order")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    
    class Meta:
        verbose_name = "Review Image"
        verbose_name_plural = "Review Images"
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['review', 'order']),
        ]
    
    def __str__(self):
        return f"Image for Review {self.review.id}"


class ReviewHelpfulness(models.Model):
    """
    Track helpfulness votes for reviews.
    """
    
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='helpfulness_votes',
        verbose_name="Review"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='helpfulness_votes',
        verbose_name="User"
    )
    is_helpful = models.BooleanField(verbose_name="Is Helpful")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    
    class Meta:
        verbose_name = "Review Helpfulness"
        verbose_name_plural = "Review Helpfulness Votes"
        unique_together = ['review', 'user']
        indexes = [
            models.Index(fields=['review', 'is_helpful']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} found Review {self.review.id} {'helpful' if self.is_helpful else 'not helpful'}"


class ReviewReport(models.Model):
    """
    Reports for inappropriate reviews.
    """
    
    REASON_CHOICES = [
        ('spam', 'Spam or Fake'),
        ('offensive', 'Offensive Language'),
        ('inappropriate', 'Inappropriate Content'),
        ('discrimination', 'Discrimination'),
        ('privacy', 'Privacy Violation'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewing', 'Reviewing'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='reports',
        verbose_name="Review"
    )
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='review_reports',
        verbose_name="Reporter"
    )
    
    reason = models.CharField(
        max_length=20,
        choices=REASON_CHOICES,
        verbose_name="Report Reason"
    )
    description = models.TextField(verbose_name="Description")
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Status"
    )
    
    # Moderation
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='review_reports_reviewed',
        limit_choices_to={'role': 'owner'},
        verbose_name="Reviewed By"
    )
    review_notes = models.TextField(blank=True, verbose_name="Review Notes")
    action_taken = models.CharField(max_length=100, blank=True, verbose_name="Action Taken")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name="Reviewed At")
    
    class Meta:
        verbose_name = "Review Report"
        verbose_name_plural = "Review Reports"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['review', 'status']),
            models.Index(fields=['reporter', 'status']),
            models.Index(fields=['reason', 'status']),
        ]
    
    def __str__(self):
        return f"Report on Review {self.review.id} by {self.reporter.full_name}"
    
    def review_report(self, reviewer, notes, action_taken):
        """Review and resolve the report."""
        self.status = 'resolved'
        self.reviewed_by = reviewer
        self.review_notes = notes
        self.action_taken = action_taken
        self.reviewed_at = timezone.now()
        self.save()


class PropertyReviewSummary(models.Model):
    """
    Aggregated review summary for properties.
    """
    
    property = models.OneToOneField(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='review_summary',
        verbose_name="Property"
    )
    
    # Aggregated ratings
    total_reviews = models.IntegerField(default=0, verbose_name="Total Reviews")
    average_rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        verbose_name="Average Rating"
    )
    
    # Detailed averages
    cleanliness_avg = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        verbose_name="Cleanliness Average"
    )
    accuracy_avg = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        verbose_name="Accuracy Average"
    )
    location_avg = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        verbose_name="Location Average"
    )
    check_in_avg = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        verbose_name="Check-in Average"
    )
    value_avg = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        verbose_name="Value Average"
    )
    
    # Rating distribution
    one_star_count = models.IntegerField(default=0, verbose_name="1 Star Count")
    two_star_count = models.IntegerField(default=0, verbose_name="2 Star Count")
    three_star_count = models.IntegerField(default=0, verbose_name="3 Star Count")
    four_star_count = models.IntegerField(default=0, verbose_name="4 Star Count")
    five_star_count = models.IntegerField(default=0, verbose_name="5 Star Count")
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True, verbose_name="Last Updated")
    
    class Meta:
        verbose_name = "Property Review Summary"
        verbose_name_plural = "Property Review Summaries"
        indexes = [
            models.Index(fields=['average_rating']),
            models.Index(fields=['total_reviews']),
        ]
    
    def __str__(self):
        return f"Review Summary for {self.property.name}"
    
    def update_summary(self):
        """Update the summary based on all published reviews."""
        from django.db.models import Avg, Count
        
        reviews = self.property.reviews.filter(status='published')
        
        if reviews.exists():
            # Update basic stats
            self.total_reviews = reviews.count()
            self.average_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0.0
            
            # Update detailed averages
            detailed_fields = [
                'cleanliness_rating', 'accuracy_rating', 'location_rating',
                'check_in_rating', 'value_rating'
            ]
            
            for field in detailed_fields:
                avg_value = reviews.aggregate(avg=Avg(field))['avg']
                setattr(self, f"{field.replace('_rating', '_avg')}", avg_value)
            
            # Update rating distribution
            rating_counts = reviews.values('rating').annotate(count=Count('id'))
            distribution = {str(i): 0 for i in range(1, 6)}
            
            for item in rating_counts:
                distribution[str(item['rating'])] = item['count']
            
            self.one_star_count = distribution['1']
            self.two_star_count = distribution['2']
            self.three_star_count = distribution['3']
            self.four_star_count = distribution['4']
            self.five_star_count = distribution['5']
        else:
            # Reset all values if no reviews
            self.total_reviews = 0
            self.average_rating = 0.0
            for field in ['cleanliness_avg', 'accuracy_avg', 'location_avg', 'check_in_avg', 'value_avg']:
                setattr(self, field, None)
            for i in range(1, 6):
                setattr(self, f"{i}_star_count", 0)
        
        self.save()
