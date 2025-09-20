INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',  # Añadido para token authentication
    'corsheaders',
    'cloudinary_storage',
    'core',
]

MIDDLEWARE = [
    'core.middleware.CustomCorsMiddleware',  # Nuestro middleware CORS personalizado
    'corsheaders.middleware.CorsMiddleware',  # Mantener como backup
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

# Configuración CORS - temporalmente permisiva para debug
CORS_ALLOW_ALL_ORIGINS = True  # TEMPORAL: Permitir todos los orígenes
CORS_ALLOW_CREDENTIALS = False  # Debe ser False cuando se usa CORS_ALLOW_ALL_ORIGINS

# Descomentar y actualizar CORS_ALLOWED_ORIGINS - solo para thebadgerspage
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
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
    'Authorization',
]

# Confianza CSRF para frontends permitidos - solo thebadgerspage
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://thebadgerspage.onrender.com',
    'https://the-badgers.com',
    'https://www.the-badgers.com',
    'https://thebadgersadmin.onrender.com',
]

import os
# from dotenv import load_dotenv

# Load environment variables from .env file (commented temporarily)
# load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Configuración de base de datos - SQLite para desarrollo, fácil de migrar después
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'thebadgerspage.db'),
    }
}

# Configuración futura para MongoDB (cuando se resuelvan problemas de compatibilidad)
# DATABASES = {
#     'default': {
#         'ENGINE': 'djongo',
#         'NAME': 'thebadgerspage_db',
#         'CLIENT': {
#             'host': 'mongodb://localhost:27017',
#             'username': 'admin',
#             'password': 'password123',
#             'authSource': 'admin'
#         }
#     }
# }

# Configuración alternativa para desarrollo local (SQLite si es necesario)
if os.environ.get('USE_SQLITE', 'false').lower() == 'true':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': 'db.sqlite3',
        }
    }

# Configuración de DEBUG basada en entorno (por defecto True en local)
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'thebadgerspage.onrender.com',
    # REMOVIDO: 'thebadgersadmin.onrender.com' - proyecto separado
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

# SECRET_KEY única para el proyecto thebadgerspage
SECRET_KEY = os.environ.get('PROJECT_SECRET_KEY', 'dev-secret-key-thebadgerspage-1234567890abcdef')

# Configuración para forzar HTTPS solo en producción
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# Solo activar SSL redirect en producción
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # Aceptar cookies cross-site cuando se usa dominio distinto (frontend separado)
    SESSION_COOKIE_SAMESITE = 'None'
    CSRF_COOKIE_SAMESITE = 'None'
else:
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    # En desarrollo usar Lax para facilitar pruebas locales
    SESSION_COOKIE_SAMESITE = 'Lax'
    CSRF_COOKIE_SAMESITE = 'Lax'

# Configuración simplificada para evitar problemas durante el build
# Usar siempre almacenamiento local para evitar timeouts y problemas de configuración externa
print("🔧 Configuración simplificada - usando almacenamiento local")
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Configuración de Cloudinary simplificada (no se usa durante el build)
CLOUDINARY_CONFIGURED = False

# ============= CONFIGURACIÓN DJANGO REST FRAMEWORK =============

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',  # Lectura pública, escritura autenticada
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
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