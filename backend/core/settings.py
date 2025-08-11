INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'cloudinary_storage',
    'core',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Configuración CORS - simplificar para evitar conflictos
CORS_ALLOW_ALL_ORIGINS = False  # Cambiar a False para usar la lista específica
CORS_ALLOW_CREDENTIALS = True

# Descomentar y actualizar CORS_ALLOWED_ORIGINS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://thebadgerspage.onrender.com",
    "https://the-badgers.com",
    "https://www.the-badgers.com",
    "https://thebadgersadmin.onrender.com",
]

# Agregar CORS_ALLOW_HEADERS específicos para la API
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'cache-control',
    'pragma',
    'expires',
]

# Permitir métodos HTTP adicionales
CORS_ALLOWED_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Agregar configuración adicional para CORS
CORS_PREFLIGHT_MAX_AGE = 86400
CORS_EXPOSE_HEADERS = [
    'Content-Length',
    'Content-Range',
]

import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Configuración de base de datos
# Usar PostgreSQL compartido con el sistema de socios
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'badgersdb',
        'USER': 'badgersdb_user',
        'PASSWORD': '6uI9aBMZlUg8sXXiKDIHkhDlJN5wbrhi',
        'HOST': 'dpg-d1jrhpemcj7s73a8sskg-a.oregon-postgres.render.com',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# Configuración para desarrollo local (SQLite)
if os.environ.get('USE_SQLITE', 'false').lower() == 'true':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': 'db.sqlite3',
        }
    }

# Configuración de DEBUG basada en entorno
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'thebadgerspage.onrender.com',
    'thebadgersadmin.onrender.com',  # Agregar este
    'the-badgers.com',
    'www.the-badgers.com',
]

STATIC_URL = "static/"
ROOT_URLCONF = 'urls'

# Static files configuration
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'frontend_build'),
]

# Configuración de WhiteNoise para archivos estáticos
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Configuración de AutoField para evitar warnings
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuración para subida de archivos
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
FILE_UPLOAD_TEMP_DIR = None

SECRET_KEY = 'dev-secret-key-1234567890abcdef'

# Configuración para forzar HTTPS solo en producción
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# Solo activar SSL redirect en producción
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
else:
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False

# Configuración de Cloudinary para almacenamiento de archivos
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

# Verificar si las variables de Cloudinary están configuradas
CLOUDINARY_CONFIGURED = all([
    os.environ.get('CLOUDINARY_CLOUD_NAME'),
    os.environ.get('CLOUDINARY_API_KEY'),
    os.environ.get('CLOUDINARY_API_SECRET')
])

# Usar Cloudinary para archivos media si está configurado y no estamos en DEBUG
if CLOUDINARY_CONFIGURED and not DEBUG:
    print("DEBUG: Usando Cloudinary para almacenamiento de archivos")
    print(f"DEBUG: Cloudinary configurado con cloud_name: {os.environ.get('CLOUDINARY_CLOUD_NAME')}")
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    # No establecer MEDIA_URL cuando usamos Cloudinary, dejar que Cloudinary maneje las URLs
else:
    print(f"DEBUG: Usando almacenamiento local. DEBUG={DEBUG}, CLOUDINARY_CONFIGURED={CLOUDINARY_CONFIGURED}")
    print(f"DEBUG: Variables de entorno - CLOUD_NAME: {os.environ.get('CLOUDINARY_CLOUD_NAME')}, API_KEY: {os.environ.get('CLOUDINARY_API_KEY')}, API_SECRET: {'Configurado' if os.environ.get('CLOUDINARY_API_SECRET') else 'No configurado'}")
    # En desarrollo o si Cloudinary no está configurado, usar almacenamiento local
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ============= CONFIGURACIÓN DJANGO REST FRAMEWORK =============

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
}