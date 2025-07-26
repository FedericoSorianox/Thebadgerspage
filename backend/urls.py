from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os
from core import views
from core.views import FrontendAppView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', views.api_root),
    path('api/galeria/', views.galeria_list),
    path('api/galeria/temp/', views.galeria_list_temp),
    path('api/galeria/upload/', views.galeria_upload),
   
    path('api/migrate-to-cloudinary/', views.migrate_to_cloudinary_endpoint),
    path('api/migrate-existing-images/', views.migrate_existing_images_endpoint),
    path('api/update-item-cloudinary/', views.update_item_cloudinary_url),
    path('api/usuarios/crear/', views.crear_usuario),
    path('api/usuarios/cambiar-password/', views.cambiar_password),
    path('api/usuarios/setup/', views.setup_usuarios),
    path('api/test-cloudinary/', views.test_cloudinary, name='test_cloudinary'),
    path('api/cleanup-unsplash/', views.cleanup_unsplash_images, name='cleanup_unsplash'),
    
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