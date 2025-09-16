from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os
from core import views
from core.views import FrontendAppView
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Función para manejar OPTIONS requests globalmente
@csrf_exempt  
def global_options_handler(request):
    """Maneja todas las requests OPTIONS para CORS preflight"""
    response = JsonResponse({})
    
    origin = request.META.get('HTTP_ORIGIN', '')
    allowed_origins = [
        'https://the-badgers.com',
        'https://www.the-badgers.com', 
        'https://thebadgerspage.onrender.com',
        'https://www.thebadgerspage.onrender.com',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
    ]
    
    if origin in allowed_origins:
        response['Access-Control-Allow-Origin'] = origin
    else:
        response['Access-Control-Allow-Origin'] = 'https://the-badgers.com'
        
    response['Access-Control-Allow-Credentials'] = 'true'
    response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, HEAD'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRFToken'
    response['Access-Control-Max-Age'] = '86400'
    
    return response


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', views.api_root),
    path('api/galeria/', views.galeria_list),
    path('api/galeria/items/', views.galeria_items),

    path('api/galeria/upload/', views.galeria_upload),
    path('api/productos/', views.productos_proxy),
   
   

    
    # Servir archivos estáticos con MIME types correctos
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.STATIC_ROOT, 'assets')}),
    
    # Servir el frontend React para todas las demás rutas
    re_path(r'^$', FrontendAppView.as_view()),  # Página principal
    re_path(r'^(?!admin|api|static|media).*/$', FrontendAppView.as_view()),  # Rutas con /
    re_path(r'^(?!admin|api|static|media).*$', FrontendAppView.as_view()),   # Rutas sin /
]

# Servir archivos media (subidas de usuarios)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)