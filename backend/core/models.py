from django.db import models
from django.contrib.auth.models import User


class GaleriaItem(models.Model):
    """Modelo para items de la galería (imágenes y videos)"""
    
    TIPO_CHOICES = [
        ('img', 'Imagen'),
        ('video', 'Video'),
    ]
    
    archivo = models.FileField(upload_to='galeria/', null=True, blank=True)
    url = models.URLField(max_length=500, null=True, blank=True, help_text="URL externa (ej. Cloudinary)")
    nombre = models.CharField(max_length=100)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, blank=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        verbose_name = 'Item de Galería'
        verbose_name_plural = 'Items de Galería'
        ordering = ['-fecha_subida']
    
    def __str__(self):
        return f"{self.nombre} - {self.fecha_subida.strftime('%Y-%m-%d')}"
    
    def save(self, *args, **kwargs):
        """Determinar automáticamente el tipo basado en el archivo o URL"""
        if self.archivo:
            # Caso: archivo local
            if hasattr(self.archivo, 'content_type'):
                content_type = self.archivo.content_type
            elif hasattr(self.archivo, 'file') and hasattr(self.archivo.file, 'content_type'):
                content_type = self.archivo.file.content_type
            else:
                # Si no podemos determinar el tipo, intentar por extensión
                archivo_str = str(self.archivo)
                if archivo_str.lower().endswith(('.mp4', '.mov', '.avi', '.mkv')):
                    content_type = 'video/'
                else:
                    content_type = 'image/'
            
            if content_type.startswith('video/'):
                self.tipo = 'video'
            else:
                self.tipo = 'img'
        elif self.url:
            # Caso: URL externa (ej. Cloudinary)
            if self.url.lower().endswith(('.mp4', '.mov', '.avi', '.mkv')):
                self.tipo = 'video'
            else:
                self.tipo = 'img'
        
        super().save(*args, **kwargs)
    
    def get_url(self):
        """Obtener la URL del archivo, ya sea local o externa"""
        if self.url:
            return self.url
        elif self.archivo:
            return self.archivo.url
        return None
