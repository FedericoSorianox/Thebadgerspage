"""
Configuración específica para Render
"""
from .settings import *

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

# Configuración de base de datos PostgreSQL para Render
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + os.path.join(BASE_DIR, 'db.sqlite3'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Configuración de seguridad
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Configuración de archivos estáticos adicional
STATIC_URL = '/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Configuración para migraciones automáticas en Render
import os
if os.environ.get('RENDER'):
    # Ejecutar migraciones automáticamente en Render
    import subprocess
    try:
        subprocess.run(['python', 'manage.py', 'migrate', '--noinput'], check=True)
        print("✅ Migraciones ejecutadas automáticamente")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Error ejecutando migraciones: {e}")
        # Continuar sin fallar el deploy 