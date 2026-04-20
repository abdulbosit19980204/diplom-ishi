from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ('id', 'username', 'email', 'role', 'is_active', 'is_staff', 'date_joined')
    list_filter   = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email')
    ordering      = ('-date_joined',)
    list_editable = ('role', 'is_active')

    # Add role field to the user edit form
    fieldsets = UserAdmin.fieldsets + (
        ('Rol', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Rol', {'fields': ('role',)}),
    )
