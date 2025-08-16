from django.db import models
from django.contrib.auth.models import User

class GaleriaItem(models.Model):
    archivo = models.FileField(upload_to='galeria/')
    nombre = models.CharField(max_length=100)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    # El tipo se puede deducir del archivo, pero lo dejamos para consulta rápida
    tipo = models.CharField(max_length=10, choices=[('img', 'Imagen'), ('video', 'Video')], blank=True)
    # Usuario que subió la imagen
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Deducir tipo por extensión
        if self.archivo and self.archivo.name:
            ext = self.archivo.name.lower()
            if ext.endswith('.mp4'):
                self.tipo = 'video'
            else:
                self.tipo = 'img'
        else:
            # Valor por defecto si no hay archivo
            self.tipo = 'img'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} ({self.tipo}) - {self.fecha_subida}"

# Modelos para el sistema de torneo BJJ
class Torneo(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    ubicacion = models.CharField(max_length=200, blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('planificacion', 'Planificación'),
        ('activo', 'Activo'),
        ('finalizado', 'Finalizado'),
        ('cancelado', 'Cancelado')
    ], default='planificacion')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    usuario_creador = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.nombre} - {self.fecha_inicio}"

    class Meta:
        ordering = ['-fecha_creacion']


class Categoria(models.Model):
    torneo = models.ForeignKey(Torneo, on_delete=models.CASCADE, related_name='categorias')
    nombre = models.CharField(max_length=200)
    peso_minimo = models.FloatField(help_text="Peso mínimo en kg", null=True, blank=True)
    peso_maximo = models.FloatField(help_text="Peso máximo en kg", null=True, blank=True)
    cinturon = models.CharField(max_length=20, choices=[
        ('blanca', 'Blanca'),
        ('azul', 'Azul'),
        ('purpura', 'Púrpura'),
        ('marron', 'Marrón'),
        ('negra', 'Negra')
    ], blank=True)
    grupo_edad = models.CharField(max_length=30, choices=[
        ('juvenil', 'Juvenil (16-17)'),
        ('adulto', 'Adulto (18-29)'),
        ('master1', 'Master 1 (30-35)'),
        ('master2', 'Master 2 (36-40)'),
        ('master3', 'Master 3 (41-45)'),
        ('master4', 'Master 4 (46-50)'),
        ('master5', 'Master 5 (51+)')
    ], blank=True)
    genero = models.CharField(max_length=10, choices=[
        ('masculino', 'Masculino'),
        ('femenino', 'Femenino')
    ], blank=True)
    estado = models.CharField(max_length=20, choices=[
        ('abierta', 'Abierta'),
        ('cerrada', 'Cerrada'),
        ('en_progreso', 'En Progreso'),
        ('finalizada', 'Finalizada')
    ], default='abierta')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} - {self.torneo.nombre}"

    class Meta:
        ordering = ['nombre']


class Participante(models.Model):
    nombre = models.CharField(max_length=200)
    apellido = models.CharField(max_length=200)
    academia = models.CharField(max_length=200, default='The Badgers')
    peso = models.FloatField(help_text="Peso en kg")
    cinturon = models.CharField(max_length=20, choices=[
        ('blanca', 'Blanca'),
        ('azul', 'Azul'),
        ('purpura', 'Púrpura'),
        ('marron', 'Marrón'),
        ('negra', 'Negra')
    ])
    fecha_nacimiento = models.DateField()
    genero = models.CharField(max_length=10, choices=[
        ('masculino', 'Masculino'),
        ('femenino', 'Femenino')
    ])
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='participantes')
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    @property
    def edad(self):
        from datetime import date
        today = date.today()
        return today.year - self.fecha_nacimiento.year - ((today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day))

    @property
    def nombre_completo(self):
        return f"{self.nombre} {self.apellido}"

    def __str__(self):
        return f"{self.nombre_completo} - {self.academia}"

    class Meta:
        ordering = ['nombre', 'apellido']


class Llave(models.Model):
    categoria = models.OneToOneField(Categoria, on_delete=models.CASCADE, related_name='llave')
    estructura = models.JSONField(help_text="Estructura de la llave en formato JSON")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)
    bloqueada = models.BooleanField(default=False, help_text="Si está bloqueada no se puede editar")

    def __str__(self):
        return f"Llave - {self.categoria.nombre}"

    class Meta:
        ordering = ['-fecha_creacion']


class Lucha(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='luchas')
    participante1 = models.ForeignKey(Participante, on_delete=models.CASCADE, related_name='luchas_como_p1')
    participante2 = models.ForeignKey(Participante, on_delete=models.CASCADE, related_name='luchas_como_p2')
    ronda = models.CharField(max_length=50, help_text="Ej: Final, Semifinal, Cuartos")
    
    # Cronómetro
    duracion_segundos = models.IntegerField(default=300, help_text="Duración en segundos")
    tiempo_transcurrido = models.IntegerField(default=0, help_text="Tiempo transcurrido en segundos")
    
    # Puntuación Participante 1
    puntos_p1 = models.IntegerField(default=0)
    ventajas_p1 = models.IntegerField(default=0)
    penalizaciones_p1 = models.IntegerField(default=0)
    
    # Puntuación Participante 2
    puntos_p2 = models.IntegerField(default=0)
    ventajas_p2 = models.IntegerField(default=0)
    penalizaciones_p2 = models.IntegerField(default=0)
    
    # Estado de la lucha
    estado = models.CharField(max_length=20, choices=[
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En Progreso'),
        ('pausada', 'Pausada'),
        ('finalizada', 'Finalizada')
    ], default='pendiente')
    
    ganador = models.ForeignKey(Participante, on_delete=models.SET_NULL, null=True, blank=True, related_name='luchas_ganadas')
    resultado = models.CharField(max_length=50, blank=True, help_text="Ej: Por puntos, Sumisión, etc.")
    
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.participante1.nombre_completo} vs {self.participante2.nombre_completo} - {self.ronda}"

    class Meta:
        ordering = ['-fecha_creacion']