from rest_framework import serializers
from .models import Torneo, Categoria, Participante, Llave, Lucha


class TorneoSerializer(serializers.ModelSerializer):
    usuario_creador = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Torneo
        fields = ['id', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'ubicacion', 
                 'estado', 'fecha_creacion', 'usuario_creador']
        read_only_fields = ['fecha_creacion', 'usuario_creador']


class CategoriaSerializer(serializers.ModelSerializer):
    torneo_nombre = serializers.CharField(source='torneo.nombre', read_only=True)
    participantes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Categoria
        fields = ['id', 'torneo', 'torneo_nombre', 'nombre', 'peso_minimo', 'peso_maximo', 
                 'cinturon', 'grupo_edad', 'genero', 'estado', 'fecha_creacion', 'participantes_count']
        read_only_fields = ['fecha_creacion']
        extra_kwargs = {
            'peso_minimo': {'required': False, 'allow_null': True},
            'peso_maximo': {'required': False, 'allow_null': True},
            'cinturon': {'required': False, 'allow_blank': True},
            'grupo_edad': {'required': False, 'allow_blank': True},
            'genero': {'required': False, 'allow_blank': True},
        }
    
    def validate_cinturon(self, value):
        """Permitir cinturón vacío o None"""
        if not value:
            return ''
        return value
    
    def validate_grupo_edad(self, value):
        """Permitir grupo de edad vacío o None"""
        if not value:
            return ''
        return value
    
    def validate_genero(self, value):
        """Permitir género vacío o None"""
        if not value:
            return ''
        return value
    
    def get_participantes_count(self, obj):
        return obj.participantes.filter(activo=True).count()


class ParticipanteSerializer(serializers.ModelSerializer):
    edad = serializers.ReadOnlyField()
    nombre_completo = serializers.ReadOnlyField()
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    
    class Meta:
        model = Participante
        fields = ['id', 'nombre', 'apellido', 'nombre_completo', 'academia', 'peso', 'cinturon', 
                 'fecha_nacimiento', 'edad', 'genero', 'categoria', 'categoria_nombre', 
                 'fecha_inscripcion', 'activo']
        read_only_fields = ['fecha_inscripcion', 'edad', 'nombre_completo']


class LlaveSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    
    class Meta:
        model = Llave
        fields = ['id', 'categoria', 'categoria_nombre', 'estructura', 'fecha_creacion', 
                 'fecha_modificacion', 'bloqueada']
        read_only_fields = ['fecha_creacion', 'fecha_modificacion']


class LuchaSerializer(serializers.ModelSerializer):
    participante1_nombre = serializers.CharField(source='participante1.nombre_completo', read_only=True)
    participante2_nombre = serializers.CharField(source='participante2.nombre_completo', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    ganador_nombre = serializers.CharField(source='ganador.nombre_completo', read_only=True)
    
    class Meta:
        model = Lucha
        fields = ['id', 'categoria', 'categoria_nombre', 'participante1', 'participante1_nombre', 
                 'participante2', 'participante2_nombre', 'ronda', 'duracion_segundos', 'tiempo_transcurrido',
                 'puntos_p1', 'ventajas_p1', 'penalizaciones_p1', 'puntos_p2', 'ventajas_p2', 
                 'penalizaciones_p2', 'estado', 'ganador', 'ganador_nombre', 'resultado', 
                 'fecha_inicio', 'fecha_fin', 'fecha_creacion']
        read_only_fields = ['fecha_creacion']


# Serializers específicos para el frontend
class ParticipanteSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado para usar en las llaves"""
    class Meta:
        model = Participante
        fields = ['id', 'nombre', 'apellido', 'academia']


class LuchaSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado para mostrar luchas en las llaves"""
    participante1 = ParticipanteSimpleSerializer(read_only=True)
    participante2 = ParticipanteSimpleSerializer(read_only=True)
    ganador = ParticipanteSimpleSerializer(read_only=True)
    
    class Meta:
        model = Lucha
        fields = ['id', 'participante1', 'participante2', 'ronda', 'estado', 'ganador', 
                 'puntos_p1', 'puntos_p2', 'resultado']
