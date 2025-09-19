import os
from django.core.wsgi import get_wsgi_application

# Usar settings_render en producción (Render), settings normales en desarrollo
settings_module = 'core.settings_render' if os.environ.get('RENDER') else 'core.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

print(f"🚀 WSGI: Usando settings module: {settings_module}")
print(f"🌐 RENDER env: {os.environ.get('RENDER', 'Not set')}")

application = get_wsgi_application() 