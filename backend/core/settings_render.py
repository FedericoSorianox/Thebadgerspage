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