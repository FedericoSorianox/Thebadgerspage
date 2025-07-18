from django.core.management.base import BaseCommand
from core.models import GaleriaItem
import cloudinary
import cloudinary.uploader
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Migra imágenes existentes de la galería a Cloudinary'

    def handle(self, *args, **options):
        self.stdout.write('Iniciando migración de imágenes a Cloudinary...')
        
        # Configurar Cloudinary
        cloudinary.config(
            cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
            api_key=os.environ.get('CLOUDINARY_API_KEY'),
            api_secret=os.environ.get('CLOUDINARY_API_SECRET')
        )
        
        # Verificar configuración
        if not all([os.environ.get('CLOUDINARY_CLOUD_NAME'), 
                   os.environ.get('CLOUDINARY_API_KEY'), 
                   os.environ.get('CLOUDINARY_API_SECRET')]):
            self.stdout.write(self.style.ERROR('Cloudinary no está configurado correctamente'))
            return
        
        # Obtener todos los items de la galería
        items = GaleriaItem.objects.all()
        migrated_count = 0
        errors = []
        
        for item in items:
            try:
                self.stdout.write(f'Procesando item {item.id}: {item.nombre}')
                
                # Verificar si ya es una URL de Cloudinary
                if item.archivo.url.startswith('http'):
                    self.stdout.write(f'  Item {item.id} ya es una URL de Cloudinary, saltando...')
                    continue
                
                # Verificar si el archivo existe localmente
                if item.archivo and hasattr(item.archivo, 'path'):
                    local_path = item.archivo.path
                    if os.path.exists(local_path):
                        self.stdout.write(f'  Subiendo archivo local: {local_path}')
                        
                        # Subir a Cloudinary
                        with open(local_path, 'rb') as f:
                            result = cloudinary.uploader.upload(
                                f,
                                public_id=f"galeria/{item.nombre}_{item.id}",
                                resource_type="auto"
                            )
                        
                        # Actualizar el modelo con la nueva URL
                        item.archivo = result['secure_url']
                        item.save()
                        
                        migrated_count += 1
                        self.stdout.write(f'  ✅ Migrado exitosamente: {result["secure_url"]}')
                    else:
                        error_msg = f"Archivo no encontrado para item {item.id}: {local_path}"
                        self.stdout.write(self.style.WARNING(f'  ⚠️ {error_msg}'))
                        errors.append(error_msg)
                else:
                    error_msg = f"Item {item.id} no tiene archivo válido"
                    self.stdout.write(self.style.WARNING(f'  ⚠️ {error_msg}'))
                    errors.append(error_msg)
                    
            except Exception as e:
                error_msg = f"Error migrando item {item.id}: {str(e)}"
                self.stdout.write(self.style.ERROR(f'  ❌ {error_msg}'))
                errors.append(error_msg)
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'Migración completada. {migrated_count} archivos migrados.'))
        self.stdout.write(f'Total de items: {items.count()}')
        if errors:
            self.stdout.write(self.style.WARNING(f'Errores encontrados: {len(errors)}'))
            for error in errors:
                self.stdout.write(f'  - {error}') 