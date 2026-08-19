from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["email", "is_staff", "is_active", "is_email_verified"]
    list_filter = ["is_staff", "is_active", "is_email_verified"]
    search_fields = ["email"]
    ordering = ["email"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("Personal info", {"fields": ["email", "password"]}),
        ("Permissions", {"fields": ["is_staff", "is_superuser", "is_active"]}),
        ("Important dates", {"fields": ["last_login", "created_at", "updated_at"]}),
    )
