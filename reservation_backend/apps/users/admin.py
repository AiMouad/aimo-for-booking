from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'email_verified', 'is_active', 'date_joined')
    list_filter = ('role', 'email_verified', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    readonly_fields = ('id', 'date_joined', 'last_login')
    fieldsets = (
        ('Account', {'fields': ('id', 'username', 'email', 'password', 'role')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Status', {'fields': ('is_active', 'email_verified', 'verification_code', 'verification_code_expires')}),
        ('Dates', {'fields': ('date_joined', 'last_login')}),
    )
