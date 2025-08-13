# Configuración de producción para Django
import os
import dj_database_url
from .settings import *

# Debug - NUNCA en producción
DEBUG = False

# Hosts permitidos
ALLOWED_HOSTS = [
    'thebadgerspage.onrender.com',
    'www.thebadgerspage.onrender.com',
    '127.0.0.1',
    'localhost',
    "the-badgers.com",
]

# Configuración de base de datos PostgreSQL para producción
# Render proporciona DATABASE_URL automáticamente
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL)
    }
else:
    # Fallback para configuración manual
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DATABASE_NAME', 'bjj_production'),
            'USER': os.environ.get('DATABASE_USER', 'bjj_user'),
            'PASSWORD': os.environ.get('DATABASE_PASSWORD'),
            'HOST': os.environ.get('DATABASE_HOST', 'localhost'),
            'PORT': os.environ.get('DATABASE_PORT', '5432'),
        }
    }
# Configuración CORS para producción
CORS_ALLOWED_ORIGINS = [
    "https://thebadgerspage.onrender.com",
    "https://www.thebadgerspage.onrender.com",
    "https://the-badgers.com",
    "https://www.the-badgers.com",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "https://thebadgerspage.onrender.com",
    "https://www.thebadgerspage.onrender.com",
    "https://the-badgers.com",
    "https://www.the-badgers.com",
]   

# Configuración de seguridad
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'True') == 'True'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Secret Key de producción
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

# Configuración de archivos estáticos
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Configuración de Cloudinary
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

# Solo usar Cloudinary si está configurado
if all([
    os.environ.get('CLOUDINARY_CLOUD_NAME'),
    os.environ.get('CLOUDINARY_API_KEY'),
    os.environ.get('CLOUDINARY_API_SECRET')
]):
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    CLOUDINARY_CONFIGURED = True
else:
    # Fallback a almacenamiento local en caso de no tener Cloudinary
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
    CLOUDINARY_CONFIGURED = False

# Configuración de logging para producción
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Variables de entorno requeridas para producción:
"""
SECRET_KEY=tu_secret_key_super_segura_de_al_menos_50_caracteres
DATABASE_URL=postgresql://user:password@host:port/database (proporcionado por Render)

# Cloudinary (opcional, si no se configura usa almacenamiento local)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key  
CLOUDINARY_API_SECRET=tu_api_secret

# Configuración de seguridad (opcional)
SECURE_SSL_REDIRECT=True
"""
