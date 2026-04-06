from django.db import models
from django.conf import settings

class Availability(models.Model):
    worker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='availabilities'
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_recurring = models.BooleanField(default=False)
    
    # Optional field for recurring day of week (0=Monday, 6=Sunday)
    day_of_week = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['start_time']
        verbose_name_plural = 'Availabilities'
        indexes = [
            models.Index(fields=['worker', 'start_time']),
        ]

    def __str__(self):
        return f'{self.worker.username} availability: {self.start_time} - {self.end_time}'
