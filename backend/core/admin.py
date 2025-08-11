from django.contrib import admin
from .models import GaleriaItem, Torneo, Categoria, Participante, Llave, Lucha


@admin.register(GaleriaItem)
class GaleriaItemAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo', 'fecha_subida', 'usuario']
    list_filter = ['tipo', 'fecha_subida']
    search_fields = ['nombre']
    date_hierarchy = 'fecha_subida'


@admin.register(Torneo)
class TorneoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'fecha_inicio', 'fecha_fin', 'estado', 'usuario_creador', 'fecha_creacion']
    list_filter = ['estado', 'fecha_inicio', 'fecha_creacion']
    search_fields = ['nombre', 'descripcion', 'ubicacion']
    date_hierarchy = 'fecha_inicio'
    readonly_fields = ['fecha_creacion']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'descripcion', 'ubicacion')
        }),
        ('Fechas', {
            'fields': ('fecha_inicio', 'fecha_fin')
        }),
        ('Estado', {
            'fields': ('estado',)
        }),
        ('Metadatos', {
            'fields': ('usuario_creador', 'fecha_creacion'),
            'classes': ('collapse',)
        })
    )


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'torneo', 'cinturon', 'grupo_edad', 'genero', 'peso_rango', 'estado', 'participantes_count']
    list_filter = ['torneo', 'cinturon', 'grupo_edad', 'genero', 'estado']
    search_fields = ['nombre', 'torneo__nombre']
    
    def peso_rango(self, obj):
        return f"{obj.peso_minimo}kg - {obj.peso_maximo}kg"
    peso_rango.short_description = 'Peso'
    
    def participantes_count(self, obj):
        return obj.participantes.filter(activo=True).count()
    participantes_count.short_description = 'Participantes'


@admin.register(Participante)
class ParticipanteAdmin(admin.ModelAdmin):
    list_display = ['nombre_completo', 'academia', 'categoria', 'cinturon', 'peso', 'edad', 'activo']
    list_filter = ['categoria__torneo', 'categoria', 'cinturon', 'genero', 'activo', 'academia']
    search_fields = ['nombre', 'apellido', 'academia']
    readonly_fields = ['edad', 'fecha_inscripcion']
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('nombre', 'apellido', 'fecha_nacimiento', 'edad', 'genero')
        }),
        ('Información Deportiva', {
            'fields': ('academia', 'peso', 'cinturon', 'categoria')
        }),
        ('Estado', {
            'fields': ('activo', 'fecha_inscripcion')
        })
    )


@admin.register(Llave)
class LlaveAdmin(admin.ModelAdmin):
    list_display = ['categoria', 'fecha_creacion', 'fecha_modificacion', 'bloqueada']
    list_filter = ['categoria__torneo', 'bloqueada', 'fecha_creacion']
    search_fields = ['categoria__nombre', 'categoria__torneo__nombre']
    readonly_fields = ['fecha_creacion', 'fecha_modificacion']


@admin.register(Lucha)
class LuchaAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'categoria', 'ronda', 'estado', 'ganador', 'fecha_inicio']
    list_filter = ['categoria__torneo', 'categoria', 'ronda', 'estado', 'fecha_inicio']
    search_fields = ['participante1__nombre', 'participante1__apellido', 
                    'participante2__nombre', 'participante2__apellido', 'categoria__nombre']
    readonly_fields = ['fecha_creacion']
    
    fieldsets = (
        ('Información de la Lucha', {
            'fields': ('categoria', 'participante1', 'participante2', 'ronda')
        }),
        ('Cronómetro', {
            'fields': ('duracion_segundos', 'tiempo_transcurrido')
        }),
        ('Puntuación Participante 1', {
            'fields': ('puntos_p1', 'ventajas_p1', 'penalizaciones_p1'),
            'classes': ('collapse',)
        }),
        ('Puntuación Participante 2', {
            'fields': ('puntos_p2', 'ventajas_p2', 'penalizaciones_p2'),
            'classes': ('collapse',)
        }),
        ('Resultado', {
            'fields': ('estado', 'ganador', 'resultado')
        }),
        ('Fechas', {
            'fields': ('fecha_inicio', 'fecha_fin', 'fecha_creacion'),
            'classes': ('collapse',)
        })
    )
