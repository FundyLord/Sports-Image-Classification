from django.contrib import admin
from .models import SportSighting


@admin.register(SportSighting)
class SportSightingAdmin(admin.ModelAdmin):
    list_display = ['sport', 'user', 'confidence', 'latitude', 'longitude', 'created_at']
    list_filter = ['sport', 'created_at']
    search_fields = ['sport', 'user__username']
    ordering = ['-created_at']
