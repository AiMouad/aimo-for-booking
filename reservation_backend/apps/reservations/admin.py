from django.contrib import admin
from .models import Reservation

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['id', 'client', 'worker', 'service', 'date_time', 'status']
    list_filter = ['status', 'date_time']
    search_fields = ['client__email', 'worker__email', 'service__name']
