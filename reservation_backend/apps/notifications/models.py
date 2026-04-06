from django.db import models
from django.conf import settings

class Notification(models.Model):
    class Type(models.TextChoices):
        RESERVATION_CREATED = 'reservation_created', 'Reservation Created'
        RESERVATION_CONFIRMED = 'reservation_confirmed', 'Reservation Confirmed'
        RESERVATION_CANCELLED = 'reservation_cancelled', 'Reservation Cancelled'
        RESERVATION_REMINDER = 'reservation_reminder', 'Reservation Reminder'
        SYSTEM_ANNOUNCEMENT = 'system_announcement', 'System Announcement'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    type = models.CharField(max_length=30, choices=Type.choices)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional related object
    reservation = models.ForeignKey(
        'reservations.Reservation',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f"{self.title} - {self.recipient.username}"
