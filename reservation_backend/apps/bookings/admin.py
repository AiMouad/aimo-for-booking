from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'property_obj', 'apartment', 'date_in', 'date_out',
        'num_nights', 'status', 'is_paid', 'created_at'
    )
    list_filter = ('status', 'is_paid', 'date_in')
    search_fields = (
        'user__username', 'user__email',
        'property_obj__name', 'apartment__name',
        'first_name', 'last_name', 'phone',
    )
    ordering = ('-created_at',)
    readonly_fields = ('id', 'num_nights', 'created_at', 'updated_at')
    date_hierarchy = 'date_in'
    actions = ['confirm_bookings', 'refuse_bookings']

    def confirm_bookings(self, request, queryset):
        count = 0
        for booking in queryset.filter(status='pending'):
            try:
                booking.status = 'confirmed'
                booking.save()
                count += 1
            except Exception:
                pass
        self.message_user(request, f'{count} bookings confirmed.')
    confirm_bookings.short_description = 'Confirm selected bookings'

    def refuse_bookings(self, request, queryset):
        count = queryset.filter(status='pending').update(status='refused')
        self.message_user(request, f'{count} bookings refused.')
    refuse_bookings.short_description = 'Refuse selected bookings'
