from django.contrib import admin
from .models import GaleriaItem


@admin.register(GaleriaItem)
class GaleriaItemAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo', 'fecha_subida', 'usuario']
    list_filter = ['tipo', 'fecha_subida']
    search_fields = ['nombre']
    date_hierarchy = 'fecha_subida'
