from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

# Importar CloudinaryStorage si está disponible
try:
    from cloudinary_storage.storage import MediaCloudinaryStorage
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False

class GaleriaItem(models.Model):
    # Usar CloudinaryStorage si está configurado, sino usar el almacenamiento por defecto
    if CLOUDINARY_AVAILABLE and hasattr(settings, 'CLOUDINARY_CONFIGURED') and settings.CLOUDINARY_CONFIGURED and not settings.DEBUG:
        archivo = models.FileField(upload_to='galeria/', storage=MediaCloudinaryStorage())
    else:
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