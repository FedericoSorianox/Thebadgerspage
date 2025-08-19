from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

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
    usuario_creador = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    def create_default_categories(self):
        """Crea las categorías fijas predefinidas para este torneo"""
        # Definir las categorías fijas
        categorias_fijas = [
            # Principiante GI
            ('Principiante GI - Hasta 70kg', 'principiante_gi', None, 70.0),
            ('Principiante GI - Hasta 80kg', 'principiante_gi', 70.1, 80.0),
            ('Principiante GI - Más de 80kg', 'principiante_gi', 80.1, None),
            
            # Intermedio GI
            ('Intermedio GI - Hasta 70kg', 'intermedio_gi', None, 70.0),
            ('Intermedio GI - Hasta 80kg', 'intermedio_gi', 70.1, 80.0),
            ('Intermedio GI - Más de 80kg', 'intermedio_gi', 80.1, None),
            
            # Avanzado GI
            ('Avanzado GI - Hasta 70kg', 'avanzado_gi', None, 70.0),
            ('Avanzado GI - Hasta 80kg', 'avanzado_gi', 70.1, 80.0),
            ('Avanzado GI - Más de 80kg', 'avanzado_gi', 80.1, None),
            
            # Principiante No GI
            ('Principiante No GI - Hasta 70kg', 'principiante_nogi', None, 70.0),
            ('Principiante No GI - Hasta 80kg', 'principiante_nogi', 70.1, 80.0),
            ('Principiante No GI - Más de 80kg', 'principiante_nogi', 80.1, None),
            
            # Intermedio No GI
            ('Intermedio No GI - Hasta 70kg', 'intermedio_nogi', None, 70.0),
            ('Intermedio No GI - Hasta 80kg', 'intermedio_nogi', 70.1, 80.0),
            ('Intermedio No GI - Más de 80kg', 'intermedio_nogi', 80.1, None),
            
            # Avanzado No GI
            ('Avanzado No GI - Hasta 70kg', 'avanzado_nogi', None, 70.0),
            ('Avanzado No GI - Hasta 80kg', 'avanzado_nogi', 70.1, 80.0),
            ('Avanzado No GI - Más de 80kg', 'avanzado_nogi', 80.1, None),
            
            # Por cinturones
            ('Blanca - Hasta 70kg', 'blanca', None, 70.0),
            ('Blanca - Hasta 80kg', 'blanca', 70.1, 80.0),
            ('Blanca - Más de 80kg', 'blanca', 80.1, None),
            
            ('Azul - Hasta 70kg', 'azul', None, 70.0),
            ('Azul - Hasta 80kg', 'azul', 70.1, 80.0),
            ('Azul - Más de 80kg', 'azul', 80.1, None),
            
            ('Violeta - Hasta 70kg', 'violeta', None, 70.0),
            ('Violeta - Hasta 80kg', 'violeta', 70.1, 80.0),
            ('Violeta - Más de 80kg', 'violeta', 80.1, None),
            
            ('Marrón - Hasta 70kg', 'marron', None, 70.0),
            ('Marrón - Hasta 80kg', 'marron', 70.1, 80.0),
            ('Marrón - Más de 80kg', 'marron', 80.1, None),
            
            ('Negro - Hasta 70kg', 'negro', None, 70.0),
            ('Negro - Hasta 80kg', 'negro', 70.1, 80.0),
            ('Negro - Más de 80kg', 'negro', 80.1, None),
        ]
        
        for nombre, tipo_categoria, peso_min, peso_max in categorias_fijas:
            Categoria.objects.get_or_create(
                torneo=self,
                nombre=nombre,
                defaults={
                    'tipo_categoria': tipo_categoria,
                    'peso_minimo': peso_min,
                    'peso_maximo': peso_max,
                }
            )

    def __str__(self):
        return f"{self.nombre} - {self.fecha_inicio}"

    class Meta:
        ordering = ['-fecha_creacion']


class Categoria(models.Model):
    TIPO_CATEGORIA_CHOICES = [
        ('principiante_gi', 'Principiante GI'),
        ('intermedio_gi', 'Intermedio GI'),
        ('avanzado_gi', 'Avanzado GI'),
        ('principiante_nogi', 'Principiante No GI'),
        ('intermedio_nogi', 'Intermedio No GI'),
        ('avanzado_nogi', 'Avanzado No GI'),
        ('blanca', 'Blanca'),
        ('azul', 'Azul'),
        ('violeta', 'Violeta'),
        ('marron', 'Marrón'),
        ('negro', 'Negro'),
    ]
    
    torneo = models.ForeignKey(Torneo, on_delete=models.CASCADE, related_name='categorias')
    nombre = models.CharField(max_length=200)
    tipo_categoria = models.CharField(max_length=30, choices=TIPO_CATEGORIA_CHOICES, default='blanca')
    peso_minimo = models.FloatField(help_text="Peso mínimo en kg", null=True, blank=True)
    peso_maximo = models.FloatField(help_text="Peso máximo en kg", null=True, blank=True)
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
        ordering = ['tipo_categoria', 'peso_minimo']


class Participante(models.Model):
    CINTURON_CHOICES = [
        ('blanca', 'Blanca'),
        ('azul', 'Azul'),
        ('violeta', 'Violeta'),
        ('marron', 'Marrón'),
        ('negro', 'Negro'),
    ]
    
    nombre = models.CharField(max_length=200)
    cinturon = models.CharField(max_length=20, choices=CINTURON_CHOICES)
    academia = models.CharField(max_length=200, default='The Badgers')
    peso = models.FloatField(help_text="Peso en kg", null=True, blank=True)  # Opcional para que se asigne automáticamente
    torneo = models.ForeignKey(Torneo, on_delete=models.CASCADE, related_name='participantes', null=True)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    # Campo para asignar a categoría específica si el organizador lo desea
    categoria_asignada = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='participantes_asignados')

    @property
    def categoria_sugerida(self):
        """Retorna la categoría sugerida basada en cinturón y peso"""
        if not self.peso:
            return None
            
        # Determinar rango de peso
        if self.peso <= 70.0:
            sufijo_peso = " - Hasta 70kg"
        elif self.peso <= 80.0:
            sufijo_peso = " - Hasta 80kg" 
        else:
            sufijo_peso = " - Más de 80kg"
        
        # Buscar categoría por cinturón
        nombre_categoria = f"{self.get_cinturon_display()}{sufijo_peso}"
        
        try:
            return self.torneo.categorias.get(nombre=nombre_categoria)
        except Categoria.DoesNotExist:
            return None

    @property
    def categoria_actual(self):
        """Retorna la categoría asignada o la sugerida"""
        return self.categoria_asignada or self.categoria_sugerida

    def __str__(self):
        return f"{self.nombre} - {self.academia} ({self.get_cinturon_display()})"

    class Meta:
        ordering = ['nombre']


class Llave(models.Model):
    categoria = models.OneToOneField(Categoria, on_delete=models.CASCADE, related_name='llave')
    estructura = models.JSONField(help_text="Estructura de la llave en formato JSON", default=dict)
    tipo_eliminacion = models.CharField(max_length=20, choices=[
        ('simple', 'Eliminación Simple'),
        ('doble', 'Eliminación Doble')
    ], default='simple')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)
    bloqueada = models.BooleanField(default=False, help_text="Si está bloqueada no se puede editar")
    finalizada = models.BooleanField(default=False)

    def obtener_participantes(self):
        """Obtiene únicamente los participantes asignados manualmente a la categoría"""
        return list(self.categoria.participantes_asignados.filter(activo=True))
    
    def calcular_rondas_necesarias(self, num_participantes):
        """Calcula cuántas rondas son necesarias para un número de participantes"""
        if num_participantes <= 1:
            return 0
        
        import math
        return math.ceil(math.log2(num_participantes))
    
    def generar_llave_simple(self):
        """Genera una llave de eliminación simple"""
        participantes = self.obtener_participantes()
        num_participantes = len(participantes)
        
        if num_participantes < 2:
            self.estructura = {
                'tipo': 'eliminacion_simple',
                'participantes': num_participantes,
                'mensaje': 'Se necesitan al menos 2 participantes para generar una llave'
            }
            return
        
        # Mezclar participantes aleatoriamente
        import random
        random.shuffle(participantes)
        
        # Calcular la próxima potencia de 2
        import math
        next_power_of_2 = 2 ** math.ceil(math.log2(num_participantes))
        
        rondas = []
        
        # Primera ronda
        primera_ronda = []
        for i in range(0, num_participantes, 2):
            if i + 1 < num_participantes:
                lucha = {
                    'participante1': {
                        'id': participantes[i].id,
                        'nombre': participantes[i].nombre,
                        'academia': participantes[i].academia
                    },
                    'participante2': {
                        'id': participantes[i + 1].id,
                        'nombre': participantes[i + 1].nombre,
                        'academia': participantes[i + 1].academia
                    },
                    'ganador': None,
                    'estado': 'pendiente'
                }
            else:
                # BYE - participante pasa directo
                lucha = {
                    'participante1': {
                        'id': participantes[i].id,
                        'nombre': participantes[i].nombre,
                        'academia': participantes[i].academia
                    },
                    'participante2': {'bye': True},
                    'ganador': {
                        'id': participantes[i].id,
                        'nombre': participantes[i].nombre,
                        'academia': participantes[i].academia
                    },
                    'estado': 'finalizada'
                }
            primera_ronda.append(lucha)
        
        rondas.append({
            'nombre': 'Primera Ronda',
            'luchas': primera_ronda
        })
        
        # Generar rondas siguientes vacías
        num_rondas = self.calcular_rondas_necesarias(num_participantes)
        nombres_rondas = self.generar_nombres_rondas(num_rondas)
        
        for i in range(1, num_rondas):
            luchas_previas = rondas[i-1]['luchas']
            num_luchas_siguiente = len(luchas_previas) // 2
            
            luchas_siguiente = []
            for j in range(num_luchas_siguiente):
                luchas_siguiente.append({
                    'participante1': None,
                    'participante2': None,
                    'ganador': None,
                    'estado': 'pendiente'
                })
            
            rondas.append({
                'nombre': nombres_rondas[i],
                'luchas': luchas_siguiente
            })
        
        self.estructura = {
            'tipo': 'eliminacion_simple',
            'participantes': num_participantes,
            'rondas': rondas,
            'fecha_generacion': str(timezone.now().isoformat())
        }
        
        # Crear las luchas reales para la primera ronda
        self.crear_luchas_primera_ronda(primera_ronda)
        
    def generar_nombres_rondas(self, num_rondas):
        """Genera nombres apropiados para las rondas según el número total"""
        nombres = []
        for i in range(num_rondas):
            if i == num_rondas - 1:  # Última ronda
                nombres.append('Final')
            elif i == num_rondas - 2:  # Penúltima ronda
                nombres.append('Semifinal')
            elif i == num_rondas - 3:  # Antepenúltima ronda
                nombres.append('Cuartos de Final')
            else:
                nombres.append(f'Ronda {i + 1}')
        return nombres
    
    def crear_luchas_primera_ronda(self, luchas_data):
        """Crea las entidades Lucha para la primera ronda"""
        for i, lucha_data in enumerate(luchas_data):
            if 'bye' not in lucha_data.get('participante2', {}):
                # Es una lucha real
                p1 = Participante.objects.get(id=lucha_data['participante1']['id'])
                p2 = Participante.objects.get(id=lucha_data['participante2']['id'])
                
                Lucha.objects.create(
                    categoria=self.categoria,
                    participante1=p1,
                    participante2=p2,
                    ronda='Primera Ronda',
                    posicion_llave=i,
                    estado='pendiente'
                )
    
    def actualizar_llave_con_resultado(self, lucha):
        """Actualiza la estructura de la llave cuando una lucha termina"""
        if not self.estructura or 'rondas' not in self.estructura:
            return
        
        # Buscar la lucha en la estructura (tolerante a None)
        for ronda_idx, ronda in enumerate(self.estructura['rondas']):
            for lucha_idx, lucha_estructura in enumerate(ronda['luchas']):
                p1_struct = lucha_estructura.get('participante1') or {}
                p2_struct = lucha_estructura.get('participante2') or {}
                if (p1_struct.get('id') == lucha.participante1.id and
                    p2_struct.get('id') == lucha.participante2.id):
                    
                    # Actualizar con el ganador
                    ganador = lucha.determinar_ganador()
                    if ganador:
                        lucha_estructura['ganador'] = {
                            'id': ganador.id,
                            'nombre': ganador.nombre,
                            'academia': ganador.academia
                        }
                        lucha_estructura['estado'] = 'finalizada'
                        
                        # Promover ganador a la siguiente ronda
                        self.promover_ganador_siguiente_ronda(ronda_idx, lucha_idx, ganador)
                    
                    break
        
        self.save()
    
    def promover_ganador_siguiente_ronda(self, ronda_idx, lucha_idx, ganador):
        """Promueve al ganador a la siguiente ronda"""
        if ronda_idx + 1 >= len(self.estructura['rondas']):
            return  # Ya es la final
        
        siguiente_ronda = self.estructura['rondas'][ronda_idx + 1]
        posicion_siguiente = lucha_idx // 2
        
        if posicion_siguiente < len(siguiente_ronda['luchas']):
            lucha_siguiente = siguiente_ronda['luchas'][posicion_siguiente]
            
            ganador_data = {
                'id': ganador.id,
                'nombre': ganador.nombre,
                'academia': ganador.academia
            }
            
            if lucha_siguiente['participante1'] is None:
                lucha_siguiente['participante1'] = ganador_data
            elif lucha_siguiente['participante2'] is None:
                lucha_siguiente['participante2'] = ganador_data
                
                # Si ambos participantes están listos, crear la lucha
                p1 = Participante.objects.get(id=lucha_siguiente['participante1']['id'])
                p2 = Participante.objects.get(id=lucha_siguiente['participante2']['id'])
                
                nombre_ronda = self.estructura['rondas'][ronda_idx + 1]['nombre']
                
                Lucha.objects.create(
                    categoria=self.categoria,
                    participante1=p1,
                    participante2=p2,
                    ronda=nombre_ronda,
                    posicion_llave=posicion_siguiente,
                    estado='pendiente'
                )

    def __str__(self):
        return f"Llave - {self.categoria.nombre}"

    class Meta:
        ordering = ['-fecha_creacion']


class Lucha(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='luchas')
    participante1 = models.ForeignKey(Participante, on_delete=models.CASCADE, related_name='luchas_como_p1')
    participante2 = models.ForeignKey(Participante, on_delete=models.CASCADE, related_name='luchas_como_p2')
    ronda = models.CharField(max_length=50, help_text="Ej: Final, Semifinal, Cuartos")
    posicion_llave = models.IntegerField(help_text="Posición en la llave", null=True, blank=True)
    
    # Cronómetro
    duracion_segundos = models.IntegerField(default=300, help_text="Duración en segundos (5 min default)")
    tiempo_transcurrido = models.IntegerField(default=0, help_text="Tiempo transcurrido en segundos")
    cronometro_activo = models.BooleanField(default=False)
    
    # Sistema de puntuación BJJ - Participante 1
    puntos_p1 = models.IntegerField(default=0, help_text="Puntos totales")
    ventajas_p1 = models.IntegerField(default=0, help_text="Ventajas")
    penalizaciones_p1 = models.IntegerField(default=0, help_text="Penalizaciones")
    # Detalle de puntos
    montadas_p1 = models.IntegerField(default=0, help_text="Montadas (4 puntos c/u)")
    guardas_pasadas_p1 = models.IntegerField(default=0, help_text="Guardas pasadas (3 puntos c/u)")
    rodillazos_p1 = models.IntegerField(default=0, help_text="Rodillazos (2 puntos c/u)")
    derribos_p1 = models.IntegerField(default=0, help_text="Derribos (2 puntos c/u)")
    
    # Sistema de puntuación BJJ - Participante 2
    puntos_p2 = models.IntegerField(default=0, help_text="Puntos totales")
    ventajas_p2 = models.IntegerField(default=0, help_text="Ventajas")
    penalizaciones_p2 = models.IntegerField(default=0, help_text="Penalizaciones")
    # Detalle de puntos
    montadas_p2 = models.IntegerField(default=0, help_text="Montadas (4 puntos c/u)")
    guardas_pasadas_p2 = models.IntegerField(default=0, help_text="Guardas pasadas (3 puntos c/u)")
    rodillazos_p2 = models.IntegerField(default=0, help_text="Rodillazos (2 puntos c/u)")
    derribos_p2 = models.IntegerField(default=0, help_text="Derribos (2 puntos c/u)")
    
    # Estado de la lucha
    estado = models.CharField(max_length=20, choices=[
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En Progreso'),
        ('pausada', 'Pausada'),
        ('finalizada', 'Finalizada')
    ], default='pendiente')
    
    ganador = models.ForeignKey(Participante, on_delete=models.SET_NULL, null=True, blank=True, related_name='luchas_ganadas')
    tipo_victoria = models.CharField(max_length=20, choices=[
        ('puntos', 'Por Puntos'),
        ('sumision', 'Por Sumisión'),
        ('ventajas', 'Por Ventajas'),
        ('penalizacion', 'Por Penalización'),
        ('descalificacion', 'Descalificación'),
        ('wo', 'Walk Over')
    ], blank=True)
    resultado_detalle = models.CharField(max_length=100, blank=True, help_text="Ej: Armbar, Guillotine, etc.")
    
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def calcular_puntos_p1(self):
        """Calcula los puntos totales del participante 1 según el sistema BJJ"""
        return (self.montadas_p1 * 4 + 
                self.guardas_pasadas_p1 * 3 + 
                (self.rodillazos_p1 + self.derribos_p1) * 2)
    
    def calcular_puntos_p2(self):
        """Calcula los puntos totales del participante 2 según el sistema BJJ"""
        return (self.montadas_p2 * 4 + 
                self.guardas_pasadas_p2 * 3 + 
                (self.rodillazos_p2 + self.derribos_p2) * 2)
    
    def calcular_puntos(self):
        """Calcula y actualiza los puntos totales de ambos participantes"""
        self.puntos_p1 = self.calcular_puntos_p1()
        self.puntos_p2 = self.calcular_puntos_p2()
    
    def save(self, *args, **kwargs):
        """Actualizar puntos totales automáticamente al guardar"""
        self.puntos_p1 = self.calcular_puntos_p1()
        self.puntos_p2 = self.calcular_puntos_p2()
        super().save(*args, **kwargs)
    
    def determinar_ganador(self):
        """Determina el ganador según las reglas de BJJ"""
        if self.estado != 'finalizada':
            return None
        
        # Por sumisión o descalificación
        if self.tipo_victoria in ['sumision', 'descalificacion', 'wo']:
            return self.ganador
        
        # Por puntos
        if self.puntos_p1 > self.puntos_p2:
            return self.participante1
        elif self.puntos_p2 > self.puntos_p1:
            return self.participante2
        
        # Empate en puntos, revisar ventajas
        if self.ventajas_p1 > self.ventajas_p2:
            return self.participante1
        elif self.ventajas_p2 > self.ventajas_p1:
            return self.participante2
        
        # Empate en ventajas, revisar penalizaciones (gana quien tenga menos)
        if self.penalizaciones_p1 < self.penalizaciones_p2:
            return self.participante1
        elif self.penalizaciones_p2 < self.penalizaciones_p1:
            return self.participante2
        
        # Empate total - en competición real se define por criterio del árbitro
        return None

    def __str__(self):
        return f"{self.participante1.nombre} vs {self.participante2.nombre} - {self.ronda}"

    class Meta:
        ordering = ['-fecha_creacion']