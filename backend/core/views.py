from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from core.models import GaleriaItem
import json
import base64
from django.views.generic import View
from django.http import FileResponse
from django.conf import settings
import os
import cloudinary
import cloudinary.uploader
import requests
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django.shortcuts import get_object_or_404
from .models import Categoria, Participante, Llave, Lucha, Atleta, AtletaPunto
from .serializers import (
    CategoriaSerializer, ParticipanteSerializer,
    LlaveSerializer, LuchaSerializer, LuchaSimpleSerializer,
    AtletaSerializer, AtletaPuntoSerializer
)
from datetime import datetime
# Importación segura de Token para evitar warnings del linter
try:
    from rest_framework.authtoken.models import Token
except ImportError:
    # Fallback para casos donde el módulo no esté disponible
    Token = None
from .permissions import IsAdminOrReadOnly
from django.views.decorators.http import require_http_methods
from django.utils import timezone

# Decorador para añadir headers CORS manualmente
def add_cors_headers(view_func):
    def wrapped_view(request, *args, **kwargs):
        response = view_func(request, *args, **kwargs)
        
        # Obtener el origin del request
        origin = request.META.get('HTTP_ORIGIN', '')
        
        # Lista de orígenes permitidos
        allowed_origins = [
            'https://the-badgers.com',
            'https://www.the-badgers.com',
            'https://thebadgerspage.onrender.com',
            'https://www.thebadgerspage.onrender.com',
            'http://localhost:5173',
            'http://localhost:5174',
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
    return wrapped_view

def api_root(request):
    return JsonResponse({"mensaje": "¡API funcionando correctamente!"})

@add_cors_headers
def galeria_items(request):
    """Listado paginado de galería con scroll infinito y filtros.
    Params:
      - cursor: ISO datetime (fecha_subida) para paginar hacia abajo
      - limit: cantidad (default 24, max 500)
      - tipo: img|video (opcional)
      - q: texto en nombre (opcional)
    """
    try:
        print("DEBUG: Iniciando galeria_items")
        from core.models import GaleriaItem
        qs = GaleriaItem.objects.all().order_by('-fecha_subida')
        print(f"DEBUG: Total items en DB: {qs.count()}")

        tipo = request.GET.get('tipo')
        if tipo in ('img', 'video'):
            qs = qs.filter(tipo=tipo)
            print(f"DEBUG: Filtrando por tipo: {tipo}")

        q = request.GET.get('q')
        if q:
            qs = qs.filter(nombre__icontains=q)
            print(f"DEBUG: Filtrando por query: {q}")

        cursor = request.GET.get('cursor')
        if cursor:
            try:
                # cursor es fecha_subida ISO
                from datetime import datetime
                from django.utils.dateparse import parse_datetime
                dt = parse_datetime(cursor)
                if dt is not None:
                    qs = qs.filter(fecha_subida__lt=dt)
                    print(f"DEBUG: Usando cursor: {cursor}")
            except Exception as e:
                print(f"DEBUG: Error parseando cursor: {e}")

        try:
            limit = min(int(request.GET.get('limit', '24')), 500)
        except ValueError:
            limit = 24

        print(f"DEBUG: Limit: {limit}")
        items = list(qs[:limit])
        print(f"DEBUG: Items obtenidos: {len(items)}")

        data = []
        for i, it in enumerate(items):
            try:
                # Usar la propiedad url del modelo que maneja tanto archivos locales como URLs de Cloudinary
                file_url = it.url
                if not file_url:
                    print(f"DEBUG: Item {i} sin URL, saltando")
                    continue

                # ocultar unsplash
                if 'unsplash.com' in file_url:
                    print(f"DEBUG: Item {i} es unsplash, saltando")
                    continue

                data.append({
                    'id': it.id,
                    'url': file_url,
                    'nombre': it.nombre,
                    'fecha': it.fecha_subida.strftime('%Y-%m-%dT%H:%M:%SZ') if it.fecha_subida else None,
                    'tipo': it.tipo or 'img',
                    'usuario': it.usuario.username if it.usuario else 'Anónimo',
                })
                print(f"DEBUG: Item {i} procesado: {it.nombre}")
            except Exception as e:
                print(f"DEBUG: Error procesando item {i}: {e}")
                continue

        next_cursor = None
        if items and items[-1].fecha_subida:
            next_cursor = items[-1].fecha_subida.strftime('%Y-%m-%dT%H:%M:%SZ')

        print(f"DEBUG: Respuesta exitosa con {len(data)} items")
        return JsonResponse({'results': data, 'next_cursor': next_cursor})
    except Exception as e:
        print(f"DEBUG: Error en galeria_items: {str(e)}")
        import traceback
        print(f"DEBUG: Traceback completo: {traceback.format_exc()}")
        return JsonResponse({'error': str(e)}, status=500)

@add_cors_headers
@csrf_exempt
def galeria_list(request):
    # Manejar preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        return response
        
    # Solo verificar autenticación para métodos que no sean GET (lectura pública)
    if request.method != 'GET':
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Basic '):
            return JsonResponse({'error': 'Authorization required'}, status=401)
        
        try:
            # Decodificar credenciales Basic Auth
            auth_decoded = base64.b64decode(auth_header[6:]).decode('utf-8')
            username, password = auth_decoded.split(':', 1)
            
            # Autenticar usuario
            user = authenticate(request, username=username, password=password)
            if not user or not user.is_active:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
                
            # Verificar que el usuario tiene permisos (is_staff o is_superuser)
            if not (user.is_staff or user.is_superuser):
                return JsonResponse({'error': 'Insufficient permissions'}, status=403)
                
        except (ValueError, UnicodeDecodeError):
            return JsonResponse({'error': 'Invalid authorization format'}, status=401)
    
    items = GaleriaItem.objects.order_by('-fecha_subida')[:8]
    data = []
    
    for i, item in enumerate(items):
        print(f"DEBUG galeria_list: Procesando item {item.id} - {item.nombre}")
        
        # Usar la propiedad url del modelo que maneja tanto archivos locales como URLs de Cloudinary
        file_url = item.url
        if not file_url:
            print(f"DEBUG galeria_list: Item {item.id} sin URL válida, saltando...")
            continue

        print(f"DEBUG galeria_list: URL encontrada: {file_url}")

        # FILTRAR IMÁGENES DE UNSPLASH - NO MOSTRARLAS
        if 'unsplash.com' in file_url:
            print(f"DEBUG galeria_list: Saltando imagen de Unsplash: {file_url}")
            continue
        
        data.append({
            'id': item.id,
            'url': file_url,
            'nombre': item.nombre,
            'fecha': item.fecha_subida.strftime('%Y-%m-%d'),
            'tipo': item.tipo,
            'usuario': item.usuario.username if item.usuario else 'Anónimo',
        })
    
    print(f"DEBUG galeria_list: Respuesta final: {data}")
    return JsonResponse(data, safe=False)
@csrf_exempt
def galeria_upload(request):
    print(f"DEBUG: Método de la petición: {request.method}")
    print(f"DEBUG: Content-Type: {request.META.get('CONTENT_TYPE', 'No especificado')}")
    print(f"DEBUG: Content-Length: {request.META.get('CONTENT_LENGTH', 'No especificado')}")
    print(f"DEBUG: POST data: {dict(request.POST)}")
    print(f"DEBUG: FILES: {dict(request.FILES)}")
    print(f"DEBUG: Número de archivos: {len(request.FILES)}")
    print(f"DEBUG: Claves en FILES: {list(request.FILES.keys())}")
    print(f"DEBUG: Headers completos: {dict(request.META)}")
    
    # Debug de configuración de Cloudinary
    print(f"DEBUG: DEBUG setting: {settings.DEBUG}")
    print(f"DEBUG: CLOUDINARY_CONFIGURED: {getattr(settings, 'CLOUDINARY_CONFIGURED', 'No definido')}")
    print(f"DEBUG: DEFAULT_FILE_STORAGE: {getattr(settings, 'DEFAULT_FILE_STORAGE', 'No definido')}")
    print(f"DEBUG: CLOUDINARY_CLOUD_NAME: {os.environ.get('CLOUDINARY_CLOUD_NAME', 'No configurado')}")
    print(f"DEBUG: CLOUDINARY_API_KEY: {os.environ.get('CLOUDINARY_API_KEY', 'No configurado')}")
    print(f"DEBUG: CLOUDINARY_API_SECRET: {'Configurado' if os.environ.get('CLOUDINARY_API_SECRET') else 'No configurado'}")
    
    # En desarrollo local, permitir acceso sin autenticación
    if settings.DEBUG:
        print("DEBUG: Modo desarrollo - saltando autenticación")
        # Crear un usuario dummy para desarrollo
        from django.contrib.auth.models import User
        user, created = User.objects.get_or_create(
            username='dev',
            defaults={
                'email': 'dev@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            user.set_password('dev123')
            user.save()
            print("DEBUG: Usuario dev creado")
    else:
        # Verificar autenticación para todos los métodos en producción
        if not request.META.get('HTTP_AUTHORIZATION'):
            return JsonResponse({'error': 'No autenticado'}, status=401)

        auth = request.META['HTTP_AUTHORIZATION']
        user = None

        # Intentar autenticación con Token primero
        if auth.startswith('Token '):
            token_key = auth.split(' ')[1]
            try:
                from rest_framework.authtoken.models import Token
                token = Token.objects.get(key=token_key)
                user = token.user
                print(f"DEBUG: Usuario autenticado por Token: {user.username}")
            except Token.DoesNotExist:
                return JsonResponse({'error': 'Token inválido'}, status=401)
            except Exception as e:
                print(f"DEBUG: Error con Token auth: {e}")
                return JsonResponse({'error': 'Error de autenticación'}, status=401)

        # Fallback a autenticación Basic si no es Token
        elif auth.startswith('Basic '):
            try:
                userpass = base64.b64decode(auth.split(' ')[1]).decode('utf-8')
                username, password = userpass.split(':', 1)
                print(f"DEBUG: Intentando autenticar usuario: {username}")
                user = authenticate(username=username, password=password)
                if not user:
                    print(f"DEBUG: Autenticación fallida para usuario: {username}")
                    return JsonResponse({'error': 'Credenciales inválidas'}, status=401)
            except Exception as e:
                print(f"DEBUG: Error con Basic auth: {e}")
                return JsonResponse({'error': 'Error de autenticación'}, status=401)
        else:
            return JsonResponse({'error': 'Tipo de autenticación no soportado'}, status=401)

        # Verificar permisos de admin
        if not (user.is_staff or user.is_superuser):
            print(f"DEBUG: Usuario sin permisos de admin: {user.username}")
            return JsonResponse({'error': 'Permisos insuficientes'}, status=403)
    
    # Si es un GET request, solo verificar credenciales y devolver OK
    if request.method == 'GET':
        return JsonResponse({'ok': True, 'message': 'Credenciales válidas', 'user': user.username if user else 'dev'})
    
    # Solo POST está permitido para subir archivos
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    # Verificar campos requeridos
    nombre = request.POST.get('nombre')
    archivo = request.FILES.get('archivo')
    
    print(f"DEBUG: Nombre recibido: {nombre}")
    print(f"DEBUG: Archivo recibido: {archivo}")
    print(f"DEBUG: Tipo de archivo: {type(archivo)}")
    
    if archivo:
        print(f"DEBUG: Tamaño del archivo: {archivo.size}")
        print(f"DEBUG: Tipo del archivo: {archivo.content_type}")
        print(f"DEBUG: Nombre del archivo: {archivo.name}")
        print(f"DEBUG: Archivo es válido: {archivo.name and archivo.size > 0}")
        print(f"DEBUG: Archivo tiene contenido: {hasattr(archivo, 'read')}")
        
        # Intentar leer los primeros bytes para verificar que no esté vacío
        try:
            archivo.seek(0)
            first_bytes = archivo.read(10)
            print(f"DEBUG: Primeros 10 bytes: {first_bytes}")
            archivo.seek(0)  # Resetear posición
        except Exception as e:
            print(f"DEBUG: Error al leer archivo: {e}")
    else:
        print(f"DEBUG: No se recibió archivo en request.FILES")
        print(f"DEBUG: Claves disponibles en FILES: {list(request.FILES.keys())}")
        print(f"DEBUG: Todos los archivos: {request.FILES}")
    
    if not nombre:
        return JsonResponse({'error': 'El nombre es requerido'}, status=400)
    
    if not archivo:
        return JsonResponse({'error': 'El archivo es requerido'}, status=400)
    
    # Verificar que el archivo no esté vacío
    if archivo.size == 0:
        return JsonResponse({'error': 'El archivo está vacío'}, status=400)
    
    # Verificar tipo de archivo
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4']
    if archivo.content_type not in allowed_types:
        return JsonResponse({'error': f'Tipo de archivo no permitido: {archivo.content_type}'}, status=400)
    
    # Verificar tamaño del archivo
    # Máximo 50MB para videos, 10MB para imágenes
    is_video = (archivo.content_type or '').startswith('video')
    max_bytes = 50 * 1024 * 1024 if is_video else 10 * 1024 * 1024
    if archivo.size > max_bytes:
        return JsonResponse({'error': 'El archivo es demasiado grande (máximo 50MB para videos y 10MB para imágenes)'}, status=400)
    
    try:
        print(f"DEBUG: Intentando crear GaleriaItem con nombre: {nombre}")
        print(f"DEBUG: Archivo: {archivo.name}, tamaño: {archivo.size}")
        print(f"DEBUG: Usuario: {user.username}")
        
        # SOLUCIÓN SIMPLE: Siempre subir a Cloudinary en producción
        print(f"DEBUG: Subiendo a Cloudinary directamente")
        
        try:
            # Configurar Cloudinary
            cloudinary.config(
                cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
                api_key=os.environ.get('CLOUDINARY_API_KEY'),
                api_secret=os.environ.get('CLOUDINARY_API_SECRET')
            )
            
            # Subir a Cloudinary
            username = user.username if user else 'dev'
            result = cloudinary.uploader.upload(
                archivo,
                public_id=f"galeria/{nombre}_{username}",
                resource_type="auto"
            )
            
            print(f"DEBUG: ✅ Archivo subido a Cloudinary: {result['secure_url']}")
            
            # Crear el item con la URL de Cloudinary
            item = GaleriaItem.objects.create(
                nombre=nombre,
                archivo_url=result['secure_url'],  # Guardar la URL completa de Cloudinary
                usuario=user if user else None
            )

            # Para Cloudinary, devolver directamente la URL sin procesar
            file_url = result['secure_url']
            print(f"DEBUG: Usando URL directa de Cloudinary: {file_url}")

        except Exception as e:
            print(f"DEBUG: ❌ Error subiendo a Cloudinary: {e}")
            # Si falla Cloudinary, usar almacenamiento local
            media_dir = os.path.join(settings.MEDIA_ROOT, 'galeria')
            if not os.path.exists(media_dir):
                os.makedirs(media_dir, exist_ok=True)

            item = GaleriaItem.objects.create(
                nombre=nombre,
                archivo=archivo,  # Archivo local
                usuario=user if user else None
            )

            # Para almacenamiento local, construir URL absoluta
            file_url = request.build_absolute_uri(item.archivo.url).replace('http://', 'https://')
            print(f"DEBUG: Usando URL local: {file_url}")
        
        print(f"DEBUG: GaleriaItem creado exitosamente con ID: {item.id}")
        
        # Verificar que el archivo se guardó correctamente
        if item.archivo or item.archivo_url:
            print(f"DEBUG: Archivo guardado correctamente")
            print(f"DEBUG: URL final: {item.url}")
            if item.archivo:
                print(f"DEBUG: Archivo local: {item.archivo.path}")
            if item.archivo_url:
                print(f"DEBUG: URL Cloudinary: {item.archivo_url}")
        else:
            print(f"DEBUG: ADVERTENCIA: El archivo no se guardó correctamente")
        
        # Ya no se purgan elementos antiguos: conservamos todo el historial
        
        response_data = {
            'ok': True,
            'message': 'Archivo subido exitosamente',
            'id': item.id,
            'url': file_url
        }
        print(f"DEBUG: Respuesta exitosa: {response_data}")
        return JsonResponse(response_data)
    except Exception as e:
        import traceback
        print(f"DEBUG: Error al guardar el archivo: {e}")
        print(f"DEBUG: Traceback completo: {traceback.format_exc()}")
        return JsonResponse({'error': f'Error al guardar el archivo: {str(e)}'}, status=500)

@csrf_exempt
def crear_usuario(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return JsonResponse({'error': 'Faltan campos'}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Usuario ya existe'}, status=400)
        user = User.objects.create_user(username=username, password=password)
        return JsonResponse({'ok': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def cambiar_password(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    if not request.META.get('HTTP_AUTHORIZATION'):
        return JsonResponse({'error': 'No autenticado'}, status=401)
    auth = request.META['HTTP_AUTHORIZATION']
    if not auth.startswith('Basic '):
        return JsonResponse({'error': 'Tipo de autenticación no soportado'}, status=401)
    userpass = base64.b64decode(auth.split(' ')[1]).decode('utf-8')
    username, password = userpass.split(':', 1)
    user = authenticate(username=username, password=password)
    if not user:
        return JsonResponse({'error': 'Credenciales inválidas'}, status=401)
    try:
        data = json.loads(request.body)
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        if not old_password or not new_password:
            return JsonResponse({'error': 'Faltan campos'}, status=400)
        if not user.check_password(old_password):
            return JsonResponse({'error': 'Contraseña actual incorrecta'}, status=400)
        user.set_password(new_password)
        user.save()
        return JsonResponse({'ok': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def setup_usuarios(request):
    """Endpoint temporal para configurar usuarios en producción"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    try:
        # Crear usuario admin si no existe
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@admin.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()
        
        # Crear usuario federico_sorianox si no existe
        federico_user, created = User.objects.get_or_create(
            username='federico_sorianox',
            defaults={
                'email': 'federico@example.com'
            }
        )
        federico_user.set_password('evRWh0Z7')
        federico_user.save()
        
        return JsonResponse({
            'ok': True,
            'message': 'Usuarios configurados exitosamente',
            'admin_created': created,
            'federico_created': created
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def update_item_cloudinary_url(request):
    """Endpoint para actualizar un item específico con URL de Cloudinary"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    # Verificar autenticación básica
    if not request.META.get('HTTP_AUTHORIZATION'):
        return JsonResponse({'error': 'No autenticado'}, status=401)
    
    auth = request.META['HTTP_AUTHORIZATION']
    if not auth.startswith('Basic '):
        return JsonResponse({'error': 'Tipo de autenticación no soportado'}, status=401)
    
    try:
        userpass = base64.b64decode(auth.split(' ')[1]).decode('utf-8')
        username, password = userpass.split(':', 1)
        user = authenticate(username=username, password=password)
        if not user:
            return JsonResponse({'error': 'Credenciales inválidas'}, status=401)
    except Exception as e:
        return JsonResponse({'error': 'Error en autenticación'}, status=401)
    
    try:
        data = json.loads(request.body)
        item_id = data.get('item_id')
        cloudinary_url = data.get('cloudinary_url')
        
        if not item_id or not cloudinary_url:
            return JsonResponse({'error': 'Faltan campos requeridos'}, status=400)
        
        # Buscar el item
        try:
            item = GaleriaItem.objects.get(id=item_id)
        except GaleriaItem.DoesNotExist:
            return JsonResponse({'error': f'Item {item_id} no encontrado'}, status=404)
        
        # Actualizar con la URL de Cloudinary
        item.archivo = cloudinary_url
        item.save()
        
        print(f'✅ Item {item_id} actualizado con URL: {cloudinary_url}')
        
        return JsonResponse({
            'success': True,
            'message': f'Item {item_id} actualizado exitosamente',
            'item_id': item_id,
            'cloudinary_url': cloudinary_url
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error actualizando item: {str(e)}'}, status=500)

class FrontendAppView(View):
    def get(self, request):
        # Buscar el archivo index.html en diferentes ubicaciones
        possible_paths = [
            os.path.join(settings.BASE_DIR, 'frontend_build', 'index.html'),
            os.path.join(settings.STATIC_ROOT, 'index.html'),
            os.path.join(settings.BASE_DIR, 'staticfiles', 'index.html'),
        ]
        
        for index_path in possible_paths:
            if os.path.exists(index_path):
                return FileResponse(open(index_path, 'rb'), content_type='text/html')
        
        # Si no se encuentra, devolver un error 404
        from django.http import HttpResponse
        return HttpResponse("Frontend build not found. Please run 'npm run build' in the frontend directory.", status=404)

@csrf_exempt
def debug_cloudinary(request):
    """
    Endpoint de diagnóstico para verificar configuración de Cloudinary
    Solo accesible en desarrollo o con autenticación de admin
    """
    import os
    from django.conf import settings
    from core.models import GaleriaItem
    
    # Verificar si es desarrollo o admin autenticado
    if not settings.DEBUG:
        # En producción, requerir autenticación de admin
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Token '):
            return JsonResponse({'error': 'Token requerido en producción'}, status=401)
        
        try:
            from rest_framework.authtoken.models import Token
            token_key = auth_header.split(' ')[1]
            token = Token.objects.get(key=token_key)
            user = token.user
            if not (user.is_staff or user.is_superuser):
                return JsonResponse({'error': 'Permisos de admin requeridos'}, status=403)
        except:
            return JsonResponse({'error': 'Token inválido'}, status=401)
    
    try:
        # 1. Variables de entorno
        cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
        api_key = os.environ.get('CLOUDINARY_API_KEY')
        api_secret = os.environ.get('CLOUDINARY_API_SECRET')
        
        env_status = {
            'CLOUDINARY_CLOUD_NAME': bool(cloud_name),
            'CLOUDINARY_API_KEY': bool(api_key),
            'CLOUDINARY_API_SECRET': bool(api_secret),
            'cloud_name_value': cloud_name,
            'api_key_preview': api_key[:8] + '...' if api_key else None
        }
        
        # 2. Configuración de Django
        django_config = {
            'CLOUDINARY_CONFIGURED': getattr(settings, 'CLOUDINARY_CONFIGURED', False),
            'DEFAULT_FILE_STORAGE': getattr(settings, 'DEFAULT_FILE_STORAGE', None),
            'MEDIA_ROOT': getattr(settings, 'MEDIA_ROOT', None),
            'DEBUG': settings.DEBUG
        }
        
        # 3. Items en la base de datos
        items = GaleriaItem.objects.all().order_by('-fecha_subida')[:5]
        db_items = []
        for item in items:
            db_items.append({
                'id': item.id,
                'nombre': item.nombre,
                'has_local_file': bool(item.archivo),
                'has_cloudinary_url': bool(item.archivo_url),
                'final_url': item.url,
                'fecha': item.fecha_subida.isoformat() if item.fecha_subida else None
            })
        
        # 4. Test de Cloudinary
        cloudinary_test = {'success': False, 'error': None}
        if all([cloud_name, api_key, api_secret]):
            try:
                import cloudinary
                cloudinary.config(
                    cloud_name=cloud_name,
                    api_key=api_key,
                    api_secret=api_secret
                )
                result = cloudinary.api.resources(max_results=1)
                cloudinary_test = {
                    'success': True,
                    'total_resources': result.get('total_count', 0)
                }
            except Exception as e:
                cloudinary_test = {'success': False, 'error': str(e)}
        
        return JsonResponse({
            'status': 'success',
            'environment_variables': env_status,
            'django_configuration': django_config,
            'database_items': db_items,
            'cloudinary_test': cloudinary_test,
            'total_items_in_db': GaleriaItem.objects.count()
        })
        
    except Exception as e:
        import traceback
        return JsonResponse({
            'status': 'error',
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)

@csrf_exempt
def productos_proxy(request):
    """
    Proxy para el endpoint de productos externo para evitar errores de CORS
    """
    if request.method == 'GET':
        try:
            # URL del sistema externo de productos
            external_url = 'https://thebadgersadmin.onrender.com/api/productos/'
            
            # Hacer la petición al sistema externo
            response = requests.get(external_url, timeout=30)
            
            # Verificar que la respuesta sea exitosa
            if response.status_code == 200:
                # Devolver los datos con headers CORS apropiados
                return JsonResponse(response.json(), safe=False)
            else:
                return JsonResponse(
                    {'error': f'Error del servidor externo: {response.status_code}'}, 
                    status=response.status_code
                )
                
        except requests.RequestException as e:
            return JsonResponse(
                {'error': f'Error conectando con el servidor de productos: {str(e)}'}, 
                status=503
            )
        except Exception as e:
            return JsonResponse(
                {'error': f'Error interno: {str(e)}'}, 
                status=500
            )
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)

# ============= API VIEWS PARA SISTEMA DE TORNEO BJJ =============



class CategoriaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar categorías"""
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]  # TEMPORAL: Permitir acceso completo para debug
    
    def get_queryset(self):
        """Obtener todas las categorías"""
        return Categoria.objects.all()
    
    @action(detail=True, methods=['post'])
    def cerrar_inscripciones(self, request, pk=None):
        """Cerrar inscripciones de una categoría"""
        categoria = self.get_object()
        categoria.estado = 'cerrada'
        categoria.save()
        return Response({'status': 'Inscripciones cerradas'})

class ParticipanteViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar participantes"""
    queryset = Participante.objects.all()
    serializer_class = ParticipanteSerializer
    permission_classes = [AllowAny]  # TEMPORAL: Permitir acceso completo para debug
    
    def get_queryset(self):
        """Filtrar participantes por categoría si se especifica"""
        queryset = Participante.objects.filter(activo=True)
        categoria_id = self.request.query_params.get('categoria', None)
        
        if categoria_id is not None:
            try:
                categoria = Categoria.objects.get(id=categoria_id)
                
                # SOLUCIÓN DEL BUG: Incluir tanto participantes asignados manualmente 
                # como aquellos que califican automáticamente
                
                # 1. Participantes asignados manualmente a esta categoría
                asignados_manualmente = queryset.filter(categoria_asignada=categoria)
                
                # 2. Participantes que califican automáticamente (sin asignación manual)
                automaticos = queryset.none()  # Inicializar QuerySet vacío
                
                if categoria.tipo_categoria in ['blanca', 'azul', 'violeta', 'marron', 'negro']:
                    # Es una categoría por cinturón - aplicar lógica automática
                    cinturon_map = {
                        'blanca': 'blanca',
                        'azul': 'azul', 
                        'violeta': 'violeta',
                        'marron': 'marron',
                        'negro': 'negro'
                    }
                    cinturon = cinturon_map.get(categoria.tipo_categoria)
                    
                    if cinturon:
                        automaticos = queryset.filter(
                            cinturon=cinturon,
                            categoria_asignada__isnull=True  # Solo los no asignados manualmente
                        )
                        
                        # Aplicar filtros de peso si están definidos
                        if categoria.peso_minimo is not None:
                            automaticos = automaticos.filter(peso__gte=categoria.peso_minimo)
                        if categoria.peso_maximo is not None:
                            automaticos = automaticos.filter(peso__lte=categoria.peso_maximo)
                
                # Combinar ambos querysets (asignados manualmente + automáticos)
                queryset = asignados_manualmente.union(automaticos)
                
            except Categoria.DoesNotExist:
                queryset = queryset.none()
        
        # Log para debugging
        print(f"[ParticipanteViewSet] Categoria ID: {categoria_id}")
        print(f"[ParticipanteViewSet] Queryset count: {queryset.count()}")
        
        return queryset

    def perform_create(self, serializer):
        data = self.request.data or {}
        atleta = None
        atleta_id = data.get('atleta')
        nombre = (data.get('nombre') or '').strip()
        academia = (data.get('academia') or '').strip()
        cinturon = data.get('cinturon')
        if atleta_id:
            try:
                atleta = Atleta.objects.get(id=atleta_id)
            except Atleta.DoesNotExist:
                atleta = None
        if not atleta and nombre:
            atleta, _ = Atleta.objects.get_or_create(
                nombre=nombre,
                academia=academia,
                defaults={'cinturon_actual': cinturon}
            )
        serializer.save(atleta=atleta)

    def perform_update(self, serializer):
        data = self.request.data or {}
        atleta = None
        atleta_id = data.get('atleta')
        nombre = (data.get('nombre') or '').strip()
        academia = (data.get('academia') or '').strip()
        cinturon = data.get('cinturon')
        if atleta_id:
            try:
                atleta = Atleta.objects.get(id=atleta_id)
            except Atleta.DoesNotExist:
                atleta = None
        if not atleta and nombre:
            atleta, _ = Atleta.objects.get_or_create(
                nombre=nombre,
                academia=academia,
                defaults={'cinturon_actual': cinturon}
            )
        serializer.save(atleta=atleta)
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """Desactivar un participante"""
        participante = self.get_object()
        participante.activo = False
        participante.save()
        return Response({'status': 'Participante desactivado'})

class LlaveViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar llaves de torneo"""
    queryset = Llave.objects.all()
    serializer_class = LlaveSerializer
    permission_classes = [AllowAny]  # TEMPORAL: Permitir acceso completo para debug
    
    def get_queryset(self):
        """Filtrar llaves por categoría si se especifica"""
        queryset = Llave.objects.all()
        categoria_id = self.request.query_params.get('categoria', None)
        
        if categoria_id is not None:
            queryset = queryset.filter(categoria_id=categoria_id)
            
        return queryset
    
    @action(detail=False, methods=['post'])
    def crear_para_categoria(self, request):
        """Crear llave para una categoría específica"""
        categoria_id = request.data.get('categoria_id')
        if not categoria_id:
            return Response(
                {'error': 'categoria_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            categoria = Categoria.objects.get(id=categoria_id)
        except Categoria.DoesNotExist:
            return Response(
                {'error': 'Categoría no encontrada'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar si ya existe una llave para esta categoría
        llave, created = Llave.objects.get_or_create(
            categoria=categoria,
            defaults={
                'tipo_eliminacion': 'simple',
                'estructura': {}
            }
        )
        
        if not created and llave.bloqueada:
            return Response(
                {'error': 'La llave ya está bloqueada y no se puede regenerar'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generar la llave automáticamente
        participantes = llave.obtener_participantes()
        
        if len(participantes) < 2:
            return Response(
                {'error': f'Se necesitan al menos 2 participantes. Actualmente hay {len(participantes)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        llave.generar_llave_simple()
        llave.save()
        
        serializer = self.get_serializer(llave)
        return Response({
            'message': f'Llave generada exitosamente para {len(participantes)} participantes',
            'llave': serializer.data
        })
    
    @action(detail=False, methods=['post'], url_path='generar/(?P<categoria_id>[^/.]+)')
    def generar(self, request, categoria_id=None):
        """Generar llave para una categoría específica (endpoint personalizado)"""
        if not categoria_id:
            return Response(
                {'error': 'categoria_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Obtener la categoría usando categoria_id
            categoria = Categoria.objects.get(id=categoria_id)
        except Categoria.DoesNotExist:
            return Response(
                {'error': 'Categoría no encontrada'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar si ya existe una llave para esta categoría
        llave, created = Llave.objects.get_or_create(
            categoria=categoria,
            defaults={
                'tipo_eliminacion': 'simple',
                'estructura': {}
            }
        )
        
        if not created and llave.bloqueada:
            return Response(
                {'error': 'La llave ya está bloqueada y no se puede regenerar'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener participantes de la categoría
        participantes = llave.obtener_participantes()
        
        if len(participantes) < 2:
            return Response(
                {'error': f'Se necesitan al menos 2 participantes. Actualmente hay {len(participantes)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Si la llave ya existía, eliminar luchas previas antes de regenerar
        if not created:
            Lucha.objects.filter(categoria=llave.categoria).delete()
        
        # Generar la llave automáticamente
        llave.generar_llave_simple()
        llave.save()
        
        serializer = self.get_serializer(llave)
        return Response({
            'message': f'Llave generada exitosamente para {len(participantes)} participantes',
            'created': created,
            'llave': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def regenerar(self, request, pk=None):
        """Regenerar llave (solo si no está bloqueada)"""
        llave = self.get_object()
        
        if llave.bloqueada:
            return Response(
                {'error': 'La llave está bloqueada y no se puede regenerar'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participantes = llave.obtener_participantes()
        
        if len(participantes) < 2:
            return Response(
                {'error': f'Se necesitan al menos 2 participantes. Actualmente hay {len(participantes)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Eliminar luchas existentes de esta categoría
        Lucha.objects.filter(categoria=llave.categoria).delete()
        
        # Regenerar la llave
        llave.generar_llave_simple()
        llave.save()
        
        return Response({'message': 'Llave regenerada exitosamente'})
    
    @action(detail=False, methods=['post'], url_path='regenerar/(?P<categoria_id>[^/.]+)')
    def regenerar_por_categoria(self, request, categoria_id=None):
        """Regenerar llave usando ID de categoría (para compatibilidad frontend)"""
        if not categoria_id:
            return Response(
                {'error': 'categoria_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            categoria = Categoria.objects.get(id=categoria_id)
        except Categoria.DoesNotExist:
            return Response(
                {'error': 'Categoría no encontrada'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            llave = categoria.llave
        except Llave.DoesNotExist:
            return Response(
                {'error': 'No hay llave creada para esta categoría'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if llave.bloqueada:
            return Response(
                {'error': 'La llave está bloqueada y no se puede regenerar'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participantes = llave.obtener_participantes()
        
        if len(participantes) < 2:
            return Response(
                {'error': f'Se necesitan al menos 2 participantes. Actualmente hay {len(participantes)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Eliminar luchas existentes de esta categoría
        Lucha.objects.filter(categoria=llave.categoria).delete()
        
        # Regenerar la llave
        llave.generar_llave_simple()
        llave.save()
        
        return Response({
            'message': 'Llave regenerada exitosamente',
            'llave_id': llave.id,
            'categoria_id': categoria.id
        })
    
    @action(detail=True, methods=['post'])
    def bloquear(self, request, pk=None):
        """Bloquear la edición de la llave"""
        llave = self.get_object()
        llave.bloqueada = True
        llave.save()
        return Response({'status': 'Llave bloqueada - no se puede editar'})
    
    @action(detail=True, methods=['post'])
    def desbloquear(self, request, pk=None):
        """Desbloquear la edición de la llave"""
        llave = self.get_object()
        llave.bloqueada = False
        llave.save()
        return Response({'status': 'Llave desbloqueada - se puede editar'})
    
    @action(detail=True, methods=['get'])
    def luchas(self, request, pk=None):
        """Obtener todas las luchas de esta llave"""
        llave = self.get_object()
        luchas = Lucha.objects.filter(categoria=llave.categoria).order_by('posicion_llave', 'ronda')
        
        from .serializers import LuchaSerializer
        serializer = LuchaSerializer(luchas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def verificar_promociones(self, request, pk=None):
        """Verificar y crear automáticamente las luchas pendientes por promociones"""
        llave = self.get_object()
        
        try:
            llave.verificar_promociones_automaticas()
            llave.save()
            
            # Obtener luchas actualizadas
            luchas = Lucha.objects.filter(categoria=llave.categoria).order_by('ronda', 'posicion_llave')
            luchas_count = luchas.count()
            
            return Response({
                'message': 'Promociones verificadas exitosamente',
                'luchas_totales': luchas_count,
                'estructura_actualizada': llave.estructura
            })
        except Exception as e:
            return Response(
                {'error': f'Error verificando promociones: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def sincronizar_luchas_finalizadas(self, request, pk=None):
        """TEMPORAL: Sincronizar todas las luchas finalizadas con la estructura de la llave"""
        llave = self.get_object()
        
        try:
            # Obtener todas las luchas finalizadas de esta categoría
            luchas_finalizadas = Lucha.objects.filter(
                categoria=llave.categoria,
                estado='finalizada'
            )
            
            sincronizadas = 0
            for lucha in luchas_finalizadas:
                # Forzar actualización de la llave con cada lucha finalizada
                llave.actualizar_llave_con_resultado(lucha)
                sincronizadas += 1
            
            # Verificar promociones después de sincronizar
            llave.verificar_promociones_automaticas()
            llave.save()
            
            # Contar luchas totales después de sincronización
            luchas_totales = Lucha.objects.filter(categoria=llave.categoria).count()
            
            return Response({
                'message': f'Sincronización completada: {sincronizadas} luchas sincronizadas',
                'luchas_sincronizadas': sincronizadas,
                'luchas_totales': luchas_totales,
                'estructura_actualizada': llave.estructura
            })
        except Exception as e:
            return Response(
                {'error': f'Error sincronizando luchas: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
class LuchaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar luchas con sistema de puntuación BJJ"""
    queryset = Lucha.objects.all()
    serializer_class = LuchaSerializer
    permission_classes = [AllowAny]  # TEMPORAL: Permitir acceso completo para debug
    
    def get_queryset(self):
        """Filtrar luchas por categoría si se especifica"""
        queryset = Lucha.objects.all()
        categoria_id = self.request.query_params.get('categoria', None)
        
        if categoria_id is not None:
            queryset = queryset.filter(categoria_id=categoria_id)
            
        return queryset.order_by('ronda', 'posicion_llave', '-fecha_creacion')
    
    @action(detail=True, methods=['post'])
    def iniciar(self, request, pk=None):
        """Iniciar una lucha"""
        lucha = self.get_object()
        
        if lucha.estado != 'pendiente':
            return Response(
                {'error': 'Solo se pueden iniciar luchas pendientes'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lucha.estado = 'en_progreso'
        lucha.fecha_inicio = timezone.now()
        lucha.cronometro_activo = True
        lucha.save()

        # Otorgar puntos por ganar una final
        try:
            if lucha.ganador and lucha.ronda and 'final' in (lucha.ronda or '').lower():
                atleta = getattr(lucha.ganador, 'atleta', None)
                if atleta:
                    AtletaPunto.objects.create(
                        atleta=atleta,
                        torneo=lucha.categoria.torneo,
                        categoria=lucha.categoria,
                        origen='categoria',
                        puntos=10,
                        detalle='Ganador de la Final'
                    )
        except Exception:
            pass
        
        return Response({'message': 'Lucha iniciada'})
    
    @action(detail=True, methods=['post'])
    def pausar(self, request, pk=None):
        """Pausar una lucha"""
        lucha = self.get_object()
        
        if lucha.estado != 'en_progreso':
            return Response(
                {'error': 'Solo se pueden pausar luchas en progreso'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lucha.estado = 'pausada'
        lucha.cronometro_activo = False
        lucha.save()
        
        return Response({'message': 'Lucha pausada'})
    
    @action(detail=True, methods=['post'])
    def reanudar(self, request, pk=None):
        """Reanudar una lucha pausada"""
        lucha = self.get_object()
        
        if lucha.estado != 'pausada':
            return Response(
                {'error': 'Solo se pueden reanudar luchas pausadas'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lucha.estado = 'en_progreso'
        lucha.cronometro_activo = True
        lucha.save()
        
        return Response({'message': 'Lucha reanudada'})
    
    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """Finalizar una lucha"""
        lucha = self.get_object()
        
        if lucha.estado not in ['en_progreso', 'pausada', 'pendiente']:
            return Response(
                {'error': 'Solo se pueden finalizar luchas en progreso, pausadas o pendientes'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener datos del request
        tipo_victoria = request.data.get('tipo_victoria', 'puntos')
        ganador_id = request.data.get('ganador_id')
        resultado_detalle = request.data.get('resultado_detalle', '')
        
        lucha.estado = 'finalizada'
        lucha.fecha_fin = timezone.now()
        lucha.cronometro_activo = False
        lucha.tipo_victoria = tipo_victoria
        lucha.resultado_detalle = resultado_detalle
        
        # Si se especifica ganador manualmente (por sumisión, etc.)
        if ganador_id:
            try:
                ganador = Participante.objects.get(id=int(ganador_id))
                if ganador not in [lucha.participante1, lucha.participante2]:
                    return Response(
                        {'error': 'El ganador debe ser uno de los participantes de la lucha'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                lucha.ganador = ganador
            except Participante.DoesNotExist:
                return Response(
                    {'error': 'Participante no encontrado'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Determinar ganador automáticamente
            lucha.ganador = lucha.determinar_ganador()
        
        lucha.save()
        
        # Actualizar la llave si existe
        try:
            llave = lucha.categoria.llave
            llave.actualizar_llave_con_resultado(lucha)
            
            # CRÍTICO: Verificar y crear automáticamente luchas de siguientes rondas
            llave.verificar_promociones_automaticas()
            llave.save()
            
            print(f"DEBUG: Llave actualizada para lucha {lucha.id}, ganador: {lucha.ganador}")
            print(f"DEBUG: Promociones automáticas verificadas y luchas creadas")
        except Llave.DoesNotExist:
            print(f"DEBUG: No hay llave generada para categoría {lucha.categoria.id}")
            pass  # No hay llave generada
        except Exception as e:
            print(f"ERROR: Error actualizando llave: {e}")
        
        return Response({
            'message': 'Lucha finalizada',
            'ganador': lucha.ganador.nombre if lucha.ganador else 'Empate',
            'ganador_id': lucha.ganador.id if lucha.ganador else None
        })
    
    @action(detail=True, methods=['post'])
    def toggle_cronometro(self, request, pk=None):
        """Pausar/reanudar cronómetro"""
        lucha = self.get_object()
        
        if lucha.estado not in ['en_progreso', 'pausada']:
            return Response(
                {'error': 'Solo se puede controlar el cronómetro en luchas activas'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lucha.cronometro_activo = not lucha.cronometro_activo
        lucha.save()
        
        return Response({
            'message': 'Cronómetro pausado' if not lucha.cronometro_activo else 'Cronómetro reanudado',
            'cronometro_activo': lucha.cronometro_activo
        })

class AtletaViewSet(viewsets.ModelViewSet):
    queryset = Atleta.objects.all()
    serializer_class = AtletaSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Atleta.objects.all()
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(nombre__icontains=q)
        return qs
class AtletaPuntoViewSet(viewsets.ModelViewSet):
    queryset = AtletaPunto.objects.all()
    serializer_class = AtletaPuntoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = AtletaPunto.objects.all()
        atleta_id = self.request.query_params.get('atleta')
        if atleta_id:
            qs = qs.filter(atleta_id=atleta_id)
        return qs

# Vista adicional para obtener luchas disponibles para judging
@csrf_exempt
def luchas_disponibles(request):
    """Obtener luchas disponibles para el sistema de judging"""
    if request.method == 'GET':
        categoria_id = request.GET.get('categoria')
        
        luchas = Lucha.objects.filter(estado='pendiente')
        if categoria_id:
            luchas = luchas.filter(categoria_id=categoria_id)
        
        serializer = LuchaSimpleSerializer(luchas, many=True)
        return JsonResponse(serializer.data, safe=False)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    """Endpoint para login con token authentication"""
    # Verificar que Token esté disponible
    if Token is None:
        return Response(
            {'error': 'Token authentication not available'}, 
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    if user and user.is_active:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            }
        })
    else:
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    """Endpoint para logout"""
    # Verificar que Token esté disponible
    if Token is None:
        return Response(
            {'error': 'Token authentication not available'}, 
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    try:
        # Eliminar el token del usuario
        Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """Endpoint para obtener información del usuario autenticado"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth_status(request):
    """Endpoint para verificar el estado de autenticación"""
    if request.user.is_authenticated:
        return Response({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser,
            }
        })
    else:
        return Response({'authenticated': False})

# Endpoint para crear usuarios en producción
@csrf_exempt
def create_user(request):
    """Endpoint para crear usuarios (solo para superusuarios)"""
    if request.method == 'POST' and request.user.is_superuser:
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            email = data.get('email', '')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            
            if not username or not password:
                return JsonResponse({'error': 'Username y password son requeridos'}, status=400)
            
            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'El usuario ya existe'}, status=400)
            
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            
            return JsonResponse({
                'message': 'Usuario creado exitosamente',
                'user_id': user.id,
                'username': user.username
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'No autorizado'}, status=403)

@csrf_exempt
def galeria_delete(request, item_id):
    """Eliminar un item de la galería"""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    # Verificar autenticación
    if settings.DEBUG:
        # En desarrollo, permitir acceso sin autenticación
        from django.contrib.auth.models import User
        user, created = User.objects.get_or_create(
            username='dev',
            defaults={
                'email': 'dev@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            user.set_password('dev123')
            user.save()
            print("DEBUG: Usuario dev creado")
    else:
        # Verificar autenticación para todos los métodos en producción
        if not request.META.get('HTTP_AUTHORIZATION'):
            return JsonResponse({'error': 'No autenticado'}, status=401)

        auth = request.META['HTTP_AUTHORIZATION']
        user = None

        # Intentar autenticación con Token primero
        if auth.startswith('Token '):
            token_key = auth.split(' ')[1]
            try:
                from rest_framework.authtoken.models import Token
                token = Token.objects.get(key=token_key)
                user = token.user
                print(f"DEBUG: Usuario autenticado por Token: {user.username}")
            except Token.DoesNotExist:
                return JsonResponse({'error': 'Token inválido'}, status=401)
            except Exception as e:
                print(f"DEBUG: Error con Token auth: {e}")
                return JsonResponse({'error': 'Error de autenticación'}, status=401)

        # Fallback a autenticación Basic si no es Token
        elif auth.startswith('Basic '):
            try:
                userpass = base64.b64decode(auth.split(' ')[1]).decode('utf-8')
                username, password = userpass.split(':', 1)
                print(f"DEBUG: Intentando autenticar usuario: {username}")
                user = authenticate(username=username, password=password)
                if not user:
                    print(f"DEBUG: Autenticación fallida para usuario: {username}")
                    return JsonResponse({'error': 'Credenciales inválidas'}, status=401)
            except Exception as e:
                print(f"DEBUG: Error con Basic auth: {e}")
                return JsonResponse({'error': 'Error de autenticación'}, status=401)
        else:
            return JsonResponse({'error': 'Tipo de autenticación no soportado'}, status=401)

        # Verificar permisos de admin
        if not (user.is_staff or user.is_superuser):
            print(f"DEBUG: Usuario sin permisos de admin: {user.username}")
            return JsonResponse({'error': 'Permisos insuficientes'}, status=403)

    try:
        # Buscar el item
        item = GaleriaItem.objects.get(id=item_id)

        # Eliminar archivos físicos si existen
        if item.archivo:
            try:
                if item.archivo.path and os.path.exists(item.archivo.path):
                    os.remove(item.archivo.path)
                    print(f"DEBUG: Archivo local eliminado: {item.archivo.path}")
            except Exception as e:
                print(f"DEBUG: Error eliminando archivo local: {e}")

        # Si hay URL de Cloudinary, intentar eliminar de Cloudinary
        if item.archivo_url and 'cloudinary' in item.archivo_url:
            try:
                # Extraer public_id de la URL de Cloudinary
                import re
                match = re.search(r'/v\d+/(.*?)\.\w+$', item.archivo_url)
                if match:
                    public_id = match.group(1)
                    cloudinary.uploader.destroy(public_id)
                    print(f"DEBUG: Archivo de Cloudinary eliminado: {public_id}")
            except Exception as e:
                print(f"DEBUG: Error eliminando de Cloudinary: {e}")

        # Eliminar el registro de la base de datos
        item.delete()

        return JsonResponse({
            'ok': True,
            'message': 'Foto eliminada exitosamente',
            'id': item_id
        })

    except GaleriaItem.DoesNotExist:
        return JsonResponse({'error': f'Foto con ID {item_id} no encontrada'}, status=404)
    except Exception as e:
        print(f"DEBUG: Error eliminando foto: {e}")
        return JsonResponse({'error': f'Error eliminando foto: {str(e)}'}, status=500)