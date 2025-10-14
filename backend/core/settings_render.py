"""
Configuración específica para Render
"""
from .settings import *

# Debug para Render
import os
print("🔧 Configuración de Render cargada")
print(f"📁 BASE_DIR: {BASE_DIR}")
print(f"📁 Current working directory: {os.getcwd()}")
print(f"🌐 RENDER env var: {os.environ.get('RENDER', 'Not set')}")
print(f"🐍 Python executable: {os.sys.executable}")

# Configuración para producción en Render
DEBUG = False
ALLOWED_HOSTS = [
    'the-badgers.com',
    'www.the-badgers.com', 
    'thebadgerspage.onrender.com',
    'localhost',
    '127.0.0.1',
    '*',  # Temporal para desarrollo
]

# Configuración de archivos estáticos para Render
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'frontend_build'),
]

# Configuración de WhiteNoise con MIME types correctos
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Configuración de WhiteNoise
WHITENOISE_USE_FINDERS = True
WHITENOISE_AUTOREFRESH = True
WHITENOISE_MIMETYPES = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
}

# Configuración de base de datos SQLite para Render (más simple y confiable)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Configuración simplificada para Render
# Solo usar SQLite para evitar problemas de configuración externa
# MongoDB se puede configurar manualmente después del deploy si es necesario

# Configuración de seguridad
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Configuración de zona horaria para Render - IMPORTANTE para evitar errores con DateTimeField
USE_TZ = True  # Habilitar zonas horarias
TIME_ZONE = 'America/Argentina/Buenos_Aires'  # Zona horaria de Argentina

# Configuración de archivos estáticos adicional
STATIC_URL = '/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ============= CONFIGURACIÓN DE CLOUDINARY PARA PRODUCCIÓN =============
# Cloudinary permite almacenar imágenes en la nube de forma persistente
# Esto evita que se borren las fotos en cada deploy (Render usa contenedores efímeros)

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

# Verificar si Cloudinary está configurado correctamente
if all([
    os.environ.get('CLOUDINARY_CLOUD_NAME'),
    os.environ.get('CLOUDINARY_API_KEY'),
    os.environ.get('CLOUDINARY_API_SECRET')
]):
    # Usar Cloudinary como almacenamiento por defecto para archivos media
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    CLOUDINARY_CONFIGURED = True
    print("✅ Cloudinary configurado correctamente - Las imágenes se guardarán en la nube")
else:
    # Fallback a almacenamiento local (NO RECOMENDADO en producción)
    CLOUDINARY_CONFIGURED = False
    print("⚠️ ADVERTENCIA: Cloudinary NO configurado - Las imágenes se borrarán en cada deploy")
    print("⚠️ Configura las variables de entorno: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET")

# Configuración para migraciones automáticas en Render
import os
if os.environ.get('RENDER'):
    # Ejecutar migraciones automáticamente en Render
    import subprocess
    try:
        # Intentar con python3 primero, luego python
        python_cmd = 'python3' if os.path.exists('/usr/bin/python3') else 'python'
        subprocess.run([python_cmd, 'manage.py', 'migrate', '--noinput'], check=True)
        print("✅ Migraciones ejecutadas automáticamente")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Error ejecutando migraciones: {e}")
        # Continuar sin fallar el deploy
    except FileNotFoundError:
        print("⚠️ Python no encontrado para ejecutar migraciones")
        # Continuar sin fallar el deploy 