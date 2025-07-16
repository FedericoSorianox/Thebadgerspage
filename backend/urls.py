from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', views.api_root),
    path('galeria/', views.galeria_list),
    path('galeria/upload/', views.galeria_upload),
    path('usuarios/crear/', views.crear_usuario),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 