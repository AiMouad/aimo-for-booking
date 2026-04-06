from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.services.models import Service

class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed'
        NO_SHOW = 'NO_SHOW', 'No Show'

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_reservations'
    )
    worker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='worker_reservations'
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    
    date_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Client notes and worker notes
    notes = models.TextField(blank=True)
    worker_notes = models.TextField(blank=True)
    
    # Payment and rating
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit_paid = models.BooleanField(default=False)
    rating = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-date_time']
        indexes = [
            models.Index(fields=['client', 'status']),
            models.Index(fields=['worker', 'status']),
            models.Index(fields=['date_time']),
            models.Index(fields=['status', 'date_time']),
        ]

    def __str__(self):
        return f'{self.client.username} - {self.service.name} with {self.worker.username}'
    
    @property
    def can_cancel(self):
        """Check if reservation can be cancelled"""
        if self.status in ['CANCELLED', 'COMPLETED', 'NO_SHOW']:
            return False
        
        # Check cancellation policy
        from django.utils import timezone
        min_cancellation_time = self.date_time - timezone.timedelta(
            hours=self.service.min_cancellation_hours
        )
        return timezone.now() < min_cancellation_time
    
    @property
    def duration_minutes(self):
        """Calculate duration in minutes"""
        if self.end_time and self.date_time:
            diff = self.end_time - self.date_time
            return int(diff.total_seconds() / 60)
        return self.service.duration_minutes
