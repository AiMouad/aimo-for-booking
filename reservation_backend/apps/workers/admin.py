from django.contrib import admin
from .models import WorkerProfile, WorkerSchedule

@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'specialization', 'is_available', 'created_at']
    list_filter = ['is_available', 'specialization']
    search_fields = ['user__username', 'user__email']

@admin.register(WorkerSchedule)
class WorkerScheduleAdmin(admin.ModelAdmin):
    list_display = ['id', 'worker', 'day_of_week', 'start_time', 'end_time', 'is_available']
    list_filter = ['day_of_week', 'is_available']
    search_fields = ['worker__user__username', 'worker__user__email']
