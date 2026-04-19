import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class WorkerProfile(models.Model):
    """Extended profile for worker users."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='worker_profile',
        limit_choices_to={'role': 'worker'},
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workers',
        limit_choices_to={'role': 'owner'},
        null=True, blank=True,
        help_text='The owner who employs this worker'
    )
    bio = models.TextField(blank=True, default='')
    specialization = models.CharField(max_length=100, blank=True, default='')
    assigned_properties = models.ManyToManyField(
        'properties.Property',
        related_name='assigned_workers',
        blank=True,
    )
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Worker Profile')
        verbose_name_plural = _('Worker Profiles')

    def __str__(self):
        return f'Worker: {self.user.username}'


class WorkerSchedule(models.Model):
    """Availability schedule for a worker."""
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, _('Monday')
        TUESDAY = 1, _('Tuesday')
        WEDNESDAY = 2, _('Wednesday')
        THURSDAY = 3, _('Thursday')
        FRIDAY = 4, _('Friday')
        SATURDAY = 5, _('Saturday')
        SUNDAY = 6, _('Sunday')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name='schedules',
    )
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('Worker Schedule')
        verbose_name_plural = _('Worker Schedules')
        ordering = ['day_of_week', 'start_time']
        unique_together = [('worker', 'day_of_week')]

    def __str__(self):
        return f'{self.worker.user.username} — {self.get_day_of_week_display()}: {self.start_time}–{self.end_time}'
