from django.contrib import admin
from .models import Property, Apartment, AvailableDate, Review


class ApartmentInline(admin.TabularInline):
    model = Apartment
    extra = 0
    show_change_link = True


class AvailableDateInline(admin.TabularInline):
    model = AvailableDate
    extra = 0


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'type', 'location', 'rating', 'is_public', 'created_at')
    list_filter = ('type', 'is_public')
    search_fields = ('name', 'location', 'owner__username')
    ordering = ('-created_at',)
    inlines = [ApartmentInline]
    readonly_fields = ('property_id', 'created_at', 'updated_at', 'rating', 'views')


@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'property', 'max_guests', 'price', 'is_available_now')
    list_filter = ('property',)
    search_fields = ('name', 'property__name')
    inlines = [AvailableDateInline]

    def is_available_now(self, obj):
        from datetime import date
        return obj.is_available(date.today(), date.today())
    is_available_now.boolean = True
    is_available_now.short_description = 'Available today'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('property', 'user', 'rating', 'created_at')
    list_filter = ('rating',)
    ordering = ('-created_at',)
