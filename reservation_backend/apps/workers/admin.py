from django.contrib import admin
from .models import Availability

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ['id', 'worker', 'start_time', 'end_time', 'is_recurring']
    list_filter = ['is_recurring', 'worker']
    search_fields = ['worker__username', 'worker__email']
