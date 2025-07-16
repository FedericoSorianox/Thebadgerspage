from django.db import models

class GaleriaItem(models.Model):
    archivo = models.FileField(upload_to='galeria/')
    nombre = models.CharField(max_length=100)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    # El tipo se puede deducir del archivo, pero lo dejamos para consulta rápida
    tipo = models.CharField(max_length=10, choices=[('img', 'Imagen'), ('video', 'Video')], blank=True)

    def save(self, *args, **kwargs):
        # Deducir tipo por extensión
        if self.archivo and self.archivo.name:
            ext = self.archivo.name.lower()
            if ext.endswith('.mp4'):
                self.tipo = 'video'
            else:
                self.tipo = 'img'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} ({self.tipo}) - {self.fecha_subida}" 