from django.contrib import admin

from .models import SavedProject


@admin.register(SavedProject)
class SavedProjectAdmin(admin.ModelAdmin):
    list_display = ["id", "freelancer", "project", "created_at"]
    list_select_related = ["freelancer", "project"]
    search_fields = ["freelancer__email", "project__title"]
    ordering = ["-created_at"]
