"""
Configuración específica para Render
"""
import os
from .settings import *
from django.core.exceptions import ImproperlyConfigured

print("🔧 Configuración de Render cargada")
print(f"📁 BASE_DIR: {BASE_DIR}")

# Configuración para producción en Render
DEBUG = False
ALLOWED_HOSTS = [
    'the-badgers.com',
    'www.the-badgers.com',
    'thebadgerspage.onrender.com',
]

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'frontend_build')]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATIC_URL = '/static/'

# Media base
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

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

# # Configuración de base de datos SQLite para Render (más simple y confiable)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }

# ============= DATABASE via DATABASE_URL (recommended) =============
# Usa dj-database-url para obtener DATABASE_URL si está seteado; si no, cae a sqlite (solo dev).
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 'sqlite:///' + os.path.join(BASE_DIR, 'db.sqlite3')),
        conn_max_age=600,
    )
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

# ============= CLOUDINARY =============
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

if all([
    os.environ.get('CLOUDINARY_CLOUD_NAME'),
    os.environ.get('CLOUDINARY_API_KEY'),
    os.environ.get('CLOUDINARY_API_SECRET')
]):
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    CLOUDINARY_CONFIGURED = True
    print("✅ Cloudinary configurado correctamente - Las imágenes se guardarán en Cloudinary")
else:
    CLOUDINARY_CONFIGURED = False
    # En producción: preferimos fallar temprano a correr con storage efímero
    raise ImproperlyConfigured(
        "Cloudinary no está configurado en producción. "
        "Setea CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en Render."
    )