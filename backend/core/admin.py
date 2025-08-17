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
    list_display = ['nombre', 'torneo', 'tipo_categoria', 'peso_rango', 'estado', 'participantes_count']
    list_filter = ['torneo', 'tipo_categoria', 'estado']
    search_fields = ['nombre', 'torneo__nombre']
    readonly_fields = ['fecha_creacion']
    
    def peso_rango(self, obj):
        if obj.peso_minimo is None and obj.peso_maximo is None:
            return "Sin límite"
        elif obj.peso_minimo is None:
            return f"Hasta {obj.peso_maximo}kg"
        elif obj.peso_maximo is None:
            return f"Más de {obj.peso_minimo}kg"
        else:
            return f"{obj.peso_minimo}kg - {obj.peso_maximo}kg"
    peso_rango.short_description = 'Rango de Peso'
    
    def participantes_count(self, obj):
        # Contar participantes asignados + automáticos
        asignados = obj.participantes_asignados.filter(activo=True).count()
        
        automaticos = 0
        if obj.tipo_categoria in ['blanca', 'azul', 'violeta', 'marron', 'negro']:
            queryset = obj.torneo.participantes.filter(
                activo=True,
                cinturon=obj.tipo_categoria,
                categoria_asignada__isnull=True
            )
            if obj.peso_minimo is not None:
                queryset = queryset.filter(peso__gte=obj.peso_minimo)
            if obj.peso_maximo is not None:
                queryset = queryset.filter(peso__lte=obj.peso_maximo)
            automaticos = queryset.count()
        
        return asignados + automaticos
    participantes_count.short_description = 'Participantes'


@admin.register(Participante)
class ParticipanteAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'academia', 'categoria_actual_nombre', 'cinturon', 'peso', 'activo']
    list_filter = ['torneo', 'cinturon', 'activo', 'academia']
    search_fields = ['nombre', 'academia']
    readonly_fields = ['fecha_inscripcion', 'categoria_sugerida_nombre']
    
    def categoria_actual_nombre(self, obj):
        categoria = obj.categoria_actual
        return categoria.nombre if categoria else "Sin categoría"
    categoria_actual_nombre.short_description = 'Categoría'
    
    def categoria_sugerida_nombre(self, obj):
        categoria = obj.categoria_sugerida
        return categoria.nombre if categoria else "Sin sugerencia (falta peso)"
    categoria_sugerida_nombre.short_description = 'Categoría Sugerida'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'academia', 'cinturon')
        }),
        ('Información Deportiva', {
            'fields': ('peso', 'torneo')
        }),
        ('Categorización', {
            'fields': ('categoria_sugerida_nombre', 'categoria_asignada'),
            'description': 'La categoría sugerida se calcula automáticamente. Use "categoria_asignada" solo si necesita una asignación manual.'
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
    search_fields = ['participante1__nombre', 'participante2__nombre', 'categoria__nombre']
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
