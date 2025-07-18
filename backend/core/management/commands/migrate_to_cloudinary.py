from django.core.management.base import BaseCommand
from core.models import GaleriaItem
import cloudinary
import cloudinary.uploader
import os

class Command(BaseCommand):
    help = 'Migrar archivos de la galería a Cloudinary'

    def handle(self, *args, **options):
        self.stdout.write("Iniciando migración a Cloudinary...")
        
        # Configurar Cloudinary
        cloudinary.config(
            cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
            api_key=os.environ.get('CLOUDINARY_API_KEY'),
            api_secret=os.environ.get('CLOUDINARY_API_SECRET')
        )
        
        # Obtener todos los items de la galería
        items = GaleriaItem.objects.all()
        self.stdout.write(f"Encontrados {items.count()} items para migrar")
        
        for item in items:
            self.stdout.write(f"Procesando item {item.id}: {item.nombre}")
            
            # Verificar si el archivo existe localmente
            if item.archivo and hasattr(item.archivo, 'path'):
                local_path = item.archivo.path
                if os.path.exists(local_path):
                    self.stdout.write(f"  Archivo local encontrado: {local_path}")
                    
                    try:
                        # Subir a Cloudinary
                        with open(local_path, 'rb') as f:
                            result = cloudinary.uploader.upload(
                                f,
                                public_id=f"galeria/{item.nombre}_{item.id}",
                                resource_type="auto"
                            )
                        
                        self.stdout.write(f"  Subido a Cloudinary: {result['secure_url']}")
                        
                        # Actualizar el modelo con la nueva URL
                        item.archivo.name = f"galeria/{item.nombre}_{item.id}"
                        item.save()
                        
                        self.stdout.write(self.style.SUCCESS(f"  ✅ Item {item.id} migrado exitosamente"))
                        
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"  ❌ Error migrando item {item.id}: {e}"))
                else:
                    self.stdout.write(self.style.WARNING(f"  ⚠️ Archivo local no encontrado: {local_path}"))
            else:
                self.stdout.write(self.style.WARNING(f"  ⚠️ Item {item.id} no tiene archivo válido"))
        
        self.stdout.write(self.style.SUCCESS("Migración completada!")) 