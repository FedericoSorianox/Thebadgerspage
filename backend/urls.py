from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from core import views
from core.views import FrontendAppView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', views.api_root),
    path('api/galeria/', views.galeria_list),
    path('api/galeria/upload/', views.galeria_upload),
    path('api/usuarios/crear/', views.crear_usuario),
    # Servir el frontend React para todas las demás rutas
    re_path(r'^$', FrontendAppView.as_view()),  # Página principal
    re_path(r'^(?!admin|api|static|media).*/$', FrontendAppView.as_view()),  # Rutas con /
    re_path(r'^(?!admin|api|static|media).*$', FrontendAppView.as_view()),   # Rutas sin /
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 