from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os
from core import views
from core.views import FrontendAppView
from core import dev_views
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

# Router para las APIs del sistema de gestión BJJ
router = DefaultRouter()
router.register(r'categorias', views.CategoriaViewSet)
router.register(r'participantes', views.ParticipanteViewSet)
router.register(r'llaves', views.LlaveViewSet)
router.register(r'luchas', views.LuchaViewSet)
router.register(r'atletas', views.AtletaViewSet)
router.register(r'atleta-puntos', views.AtletaPuntoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', views.api_root),
    # Endpoints de autenticación
    path('api/auth/login/', views.login_api, name='api_login'),
    path('api/auth/logout/', views.logout_api, name='api_logout'),
    path('api/auth/user/', views.user_info, name='api_user_info'),
    path('api/auth/status/', views.check_auth_status, name='api_auth_status'),
    path('api/user/', views.user_info),
    path('api/create-user/', views.create_user),
    path('api/galeria/', views.galeria_list),
    path('api/galeria/items/', views.galeria_items),

    path('api/galeria/upload/', views.galeria_upload),
    path('api/productos/', views.productos_proxy),
    
    # Endpoints de desarrollo (solo disponibles cuando DEBUG=True)
    path('api/dev/galeria/upload/', dev_views.dev_galeria_upload),
    path('api/dev/auth/status/', dev_views.dev_auth_status),
    path('api/dev/auth/login/', dev_views.dev_login),
   
    # APIs del sistema de gestión BJJ
    path('api/torneo/', include(router.urls)),
    path('api/torneo/luchas-disponibles/', views.luchas_disponibles),
   
    path('api/update-item-cloudinary/', views.update_item_cloudinary_url),
    path('api/usuarios/crear/', views.crear_usuario),
    path('api/usuarios/cambiar-password/', views.cambiar_password),
    path('api/usuarios/setup/', views.setup_usuarios),

    
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