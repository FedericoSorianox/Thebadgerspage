from rest_framework import serializers
from .models import Torneo, Categoria, Participante, Llave, Lucha


class TorneoSerializer(serializers.ModelSerializer):
    usuario_creador = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Torneo
        fields = ['id', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'ubicacion', 
                 'estado', 'fecha_creacion', 'usuario_creador']
        read_only_fields = ['fecha_creacion', 'usuario_creador']
    
    def create(self, validated_data):
        """Crear torneo y sus categorías fijas automáticamente"""
        print(f"DEBUG TorneoSerializer.create: validated_data={validated_data}")
        try:
            torneo = super().create(validated_data)
            print(f"DEBUG TorneoSerializer.create: Torneo creado: {torneo}")
            
            print("DEBUG TorneoSerializer.create: Creando categorías por defecto...")
            torneo.create_default_categories()
            print(f"DEBUG TorneoSerializer.create: Categorías creadas para torneo {torneo.id}")
            
            return torneo
        except Exception as e:
            print(f"DEBUG TorneoSerializer.create: ERROR: {e}")
            raise


class CategoriaSerializer(serializers.ModelSerializer):
    torneo_nombre = serializers.CharField(source='torneo.nombre', read_only=True)
    participantes_count = serializers.SerializerMethodField()
    llaves_count = serializers.SerializerMethodField()
    luchas_pendientes = serializers.SerializerMethodField()
    
    class Meta:
        model = Categoria
        fields = ['id', 'torneo', 'torneo_nombre', 'nombre', 'tipo_categoria', 
                 'peso_minimo', 'peso_maximo', 'estado', 'fecha_creacion', 
                 'participantes_count', 'llaves_count', 'luchas_pendientes']
        read_only_fields = ['fecha_creacion', 'nombre', 'tipo_categoria', 'peso_minimo', 'peso_maximo']
    
    def get_participantes_count(self, obj):
        # Contar participantes tanto asignados directamente como los que coinciden por peso/cinturón
        participantes_asignados = obj.participantes_asignados.filter(activo=True).count()
        
        # Contar participantes que coinciden automáticamente
        participantes_automaticos = 0
        if obj.tipo_categoria in ['blanca', 'azul', 'violeta', 'marron', 'negro']:
            # Es una categoría por cinturón
            cinturon_map = {
                'blanca': 'blanca',
                'azul': 'azul', 
                'violeta': 'violeta',
                'marron': 'marron',
                'negro': 'negro'
            }
            cinturon = cinturon_map.get(obj.tipo_categoria)
            if cinturon:
                queryset = obj.torneo.participantes.filter(
                    activo=True,
                    cinturon=cinturon,
                    categoria_asignada__isnull=True  # Solo los no asignados manualmente
                )
                
                # Filtrar por peso
                if obj.peso_minimo is not None:
                    queryset = queryset.filter(peso__gte=obj.peso_minimo)
                if obj.peso_maximo is not None:
                    queryset = queryset.filter(peso__lte=obj.peso_maximo)
                    
                participantes_automaticos = queryset.count()
        
        return participantes_asignados + participantes_automaticos
    
    def get_llaves_count(self, obj):
        """Contar el número de llaves generadas para esta categoría"""
        try:
            return 1 if hasattr(obj, 'llave') and obj.llave else 0
        except:
            return 0
    
    def get_luchas_pendientes(self, obj):
        """Contar el número de luchas pendientes en esta categoría"""
        from .models import Lucha
        return Lucha.objects.filter(
            categoria=obj,
            estado='pendiente'
        ).count()


class ParticipanteSerializer(serializers.ModelSerializer):
    categoria_sugerida_nombre = serializers.SerializerMethodField()
    categoria_actual_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Participante
        fields = ['id', 'nombre', 'cinturon', 'academia', 'peso', 'torneo', 
                 'categoria_asignada', 'categoria_sugerida_nombre', 'categoria_actual_nombre',
                 'fecha_inscripcion', 'activo']
        read_only_fields = ['fecha_inscripcion']
    
    def get_categoria_sugerida_nombre(self, obj):
        categoria = obj.categoria_sugerida
        return categoria.nombre if categoria else None
    
    def get_categoria_actual_nombre(self, obj):
        categoria = obj.categoria_actual
        return categoria.nombre if categoria else None


class LlaveSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    participantes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Llave
        fields = ['id', 'categoria', 'categoria_nombre', 'estructura', 'tipo_eliminacion',
                 'fecha_creacion', 'fecha_modificacion', 'bloqueada', 'finalizada', 
                 'participantes_count']
        read_only_fields = ['fecha_creacion', 'fecha_modificacion']
    
    def get_participantes_count(self, obj):
        return len(obj.obtener_participantes())


class LuchaSerializer(serializers.ModelSerializer):
    participante1_nombre = serializers.CharField(source='participante1.nombre', read_only=True)
    participante2_nombre = serializers.CharField(source='participante2.nombre', read_only=True)
    participante1_academia = serializers.CharField(source='participante1.academia', read_only=True)
    participante2_academia = serializers.CharField(source='participante2.academia', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    ganador_nombre = serializers.CharField(source='ganador.nombre', read_only=True)
    tiempo_restante = serializers.SerializerMethodField()
    
    class Meta:
        model = Lucha
        fields = ['id', 'categoria', 'categoria_nombre', 'participante1', 'participante1_nombre', 
                 'participante1_academia', 'participante2', 'participante2_nombre', 'participante2_academia',
                 'ronda', 'posicion_llave', 'duracion_segundos', 'tiempo_transcurrido', 'tiempo_restante',
                 'cronometro_activo',
                 # Puntos P1
                 'puntos_p1', 'ventajas_p1', 'penalizaciones_p1',
                 'montadas_p1', 'guardas_pasadas_p1', 'rodillazos_p1', 'derribos_p1',
                 # Puntos P2  
                 'puntos_p2', 'ventajas_p2', 'penalizaciones_p2',
                 'montadas_p2', 'guardas_pasadas_p2', 'rodillazos_p2', 'derribos_p2',
                 # Estado y resultado
                 'estado', 'ganador', 'ganador_nombre', 'tipo_victoria', 'resultado_detalle',
                 'fecha_inicio', 'fecha_fin', 'fecha_creacion']
        read_only_fields = ['fecha_creacion', 'puntos_p1', 'puntos_p2']
    
    def get_tiempo_restante(self, obj):
        """Calcula el tiempo restante en segundos"""
        return max(0, obj.duracion_segundos - obj.tiempo_transcurrido)


# Serializers específicos para el frontend
class ParticipanteSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado para usar en las llaves"""
    class Meta:
        model = Participante
        fields = ['id', 'nombre', 'academia']


class LuchaSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado para las luchas en el cronómetro"""
    participante1_nombre = serializers.CharField(source='participante1.nombre', read_only=True)
    participante2_nombre = serializers.CharField(source='participante2.nombre', read_only=True)
    tiempo_restante = serializers.SerializerMethodField()
    
    class Meta:
        model = Lucha
        fields = ['id', 'participante1', 'participante1_nombre', 'participante2', 'participante2_nombre',
                 'ronda', 'duracion_segundos', 'tiempo_transcurrido', 'tiempo_restante', 'cronometro_activo',
                 'puntos_p1', 'ventajas_p1', 'penalizaciones_p1', 'puntos_p2', 'ventajas_p2', 
                 'penalizaciones_p2', 'estado', 'tipo_victoria']
    
    def get_tiempo_restante(self, obj):
        """Calcula el tiempo restante en segundos"""
        return max(0, obj.duracion_segundos - obj.tiempo_transcurrido)
