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
from .models import Torneo, Categoria, Participante, Llave, Lucha
from .serializers import (
    TorneoSerializer, CategoriaSerializer, ParticipanteSerializer,
    LlaveSerializer, LuchaSerializer, LuchaSimpleSerializer
)
from datetime import datetime
from rest_framework.authtoken.models import Token
from .permissions import IsAdminOrReadOnly
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator

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
        
        # Verificar si el campo archivo contiene una URL completa de Cloudinary
        archivo_value = str(item.archivo)
        print(f"DEBUG galeria_list: Valor real del campo archivo: {archivo_value}")
        
        # FILTRAR IMÁGENES DE UNSPLASH - NO MOSTRARLAS
        if 'unsplash.com' in archivo_value:
            print(f"DEBUG galeria_list: Saltando imagen de Unsplash: {archivo_value}")
            continue
        
        if archivo_value.startswith('http') and 'cloudinary.com' in archivo_value:
            # Es una URL directa de Cloudinary, usarla sin procesar
            file_url = archivo_value
            print(f"DEBUG galeria_list: URL directa de Cloudinary encontrada: {file_url}")
        elif hasattr(item.archivo, 'url') and 'cloudinary.com' in item.archivo.url:
            # Si la URL contiene cloudinary.com a través del storage, usarla directamente
            file_url = item.archivo.url
            print(f"DEBUG galeria_list: URL de Cloudinary desde storage encontrada: {file_url}")
        elif hasattr(item.archivo, 'url'):
            # Para otros tipos de storage, construir URL absoluta
            file_url = item.archivo.url
            if not file_url.startswith('http'):
                file_url = f"https://thebadgerspage.onrender.com{file_url}"
            print(f"DEBUG galeria_list: URL construida: {file_url}")
        else:
            # Si no hay URL válida, saltar este item
            print(f"DEBUG galeria_list: Item {item.id} no tiene URL válida, saltando...")
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

def galeria_list_temp(request):
    """Endpoint temporal que devuelve URLs de Unsplash directamente"""
    # URLs de ejemplo de Unsplash (imágenes de artes marciales)
    unsplash_urls = [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
    ]
    
    # Nombres de ejemplo
    nombres = [
        'Academia The Badgers',
        'Clase de Muay Thai',
        'Tatami de entrenamiento',
        'Academia vista general',
        'Academia',
        'Test Cloudinary',
        'Tatami',
        'BJJ Gi'
    ]
    
    data = []
    for i in range(8):
        data.append({
            'id': 76 + i,  # IDs secuenciales
            'url': unsplash_urls[i],
            'nombre': nombres[i],
            'fecha': '2025-07-18',
            'tipo': 'img',
            'usuario': 'federico_soriano',
        })
    
    print(f"DEBUG galeria_list_temp: Respuesta con URLs de Unsplash: {data}")
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
    
    # Verificar autenticación para todos los métodos
    if not request.META.get('HTTP_AUTHORIZATION'):
        return JsonResponse({'error': 'No autenticado'}, status=401)
    
    auth = request.META['HTTP_AUTHORIZATION']
    if not auth.startswith('Basic '):
        return JsonResponse({'error': 'Tipo de autenticación no soportado'}, status=401)
    
    try:
        userpass = base64.b64decode(auth.split(' ')[1]).decode('utf-8')
        username, password = userpass.split(':', 1)
        print(f"DEBUG: Intentando autenticar usuario: {username}")
        user = authenticate(username=username, password=password)
        if not user:
            print(f"DEBUG: Autenticación fallida para usuario: {username}")
            return JsonResponse({'error': 'Credenciales inválidas'}, status=401)
        print(f"DEBUG: Usuario autenticado exitosamente: {username}")
    except Exception as e:
        print(f"DEBUG: Error en autenticación: {e}")
        return JsonResponse({'error': 'Error en autenticación'}, status=401)
    
    # Si es un GET request, solo verificar credenciales y devolver OK
    if request.method == 'GET':
        return JsonResponse({'ok': True, 'message': 'Credenciales válidas', 'user': username})
    
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
    
    # Verificar tamaño del archivo (máximo 10MB)
    if archivo.size > 10 * 1024 * 1024:
        return JsonResponse({'error': 'El archivo es demasiado grande (máximo 10MB)'}, status=400)
    
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
            result = cloudinary.uploader.upload(
                archivo,
                public_id=f"galeria/{nombre}_{user.username}",
                resource_type="auto"
            )
            
            print(f"DEBUG: ✅ Archivo subido a Cloudinary: {result['secure_url']}")
            
            # Crear el item con la URL de Cloudinary
            item = GaleriaItem.objects.create(
                nombre=nombre, 
                archivo=result['secure_url'],  # Guardar la URL completa de Cloudinary
                usuario=user
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
            
            item = GaleriaItem.objects.create(nombre=nombre, archivo=archivo, usuario=user)
            
            # Para almacenamiento local, construir URL absoluta
            file_url = request.build_absolute_uri(item.archivo.url).replace('http://', 'https://')
            print(f"DEBUG: Usando URL local: {file_url}")
        
        print(f"DEBUG: GaleriaItem creado exitosamente con ID: {item.id}")
        
        # Verificar que el archivo se guardó correctamente
        if item.archivo:
            print(f"DEBUG: Archivo guardado en: {item.archivo.path}")
            print(f"DEBUG: URL del archivo: {item.archivo.url}")
            print(f"DEBUG: Nombre del archivo en Cloudinary: {item.archivo.name}")
            print(f"DEBUG: Tipo de archivo: {type(item.archivo)}")
            print(f"DEBUG: Storage del archivo: {item.archivo.storage}")
        else:
            print(f"DEBUG: ADVERTENCIA: El archivo no se guardó correctamente")
        
        # Mantener solo los últimos 8 elementos
        items = GaleriaItem.objects.order_by('-fecha_subida')
        if items.count() > 8:
            for old in items[8:]:
                old.delete()
        
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
def migrate_to_cloudinary_endpoint(request):
    """Endpoint temporal para migrar archivos a Cloudinary"""
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
        # Configurar Cloudinary
        cloudinary.config(
            cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
            api_key=os.environ.get('CLOUDINARY_API_KEY'),
            api_secret=os.environ.get('CLOUDINARY_API_SECRET')
        )
        
        # Verificar configuración
        if not all([os.environ.get('CLOUDINARY_CLOUD_NAME'), 
                   os.environ.get('CLOUDINARY_API_KEY'), 
                   os.environ.get('CLOUDINARY_API_SECRET')]):
            return JsonResponse({'error': 'Cloudinary no está configurado correctamente'}, status=500)
        
        # Obtener todos los items de la galería
        items = GaleriaItem.objects.all()
        migrated_count = 0
        errors = []
        
        for item in items:
            try:
                # Verificar si el archivo existe localmente
                if item.archivo and hasattr(item.archivo, 'path'):
                    local_path = item.archivo.path
                    if os.path.exists(local_path):
                        # Subir a Cloudinary
                        with open(local_path, 'rb') as f:
                            result = cloudinary.uploader.upload(
                                f,
                                public_id=f"galeria/{item.nombre}_{item.id}",
                                resource_type="auto"
                            )
                        
                        # Actualizar el modelo con la nueva URL
                        item.archivo.name = f"galeria/{item.nombre}_{item.id}"
                        item.save()
                        
                        migrated_count += 1
                    else:
                        errors.append(f"Archivo no encontrado para item {item.id}: {local_path}")
                else:
                    errors.append(f"Item {item.id} no tiene archivo válido")
                    
            except Exception as e:
                errors.append(f"Error migrando item {item.id}: {str(e)}")
        
        return JsonResponse({
            'success': True,
            'message': f'Migración completada. {migrated_count} archivos migrados.',
            'migrated_count': migrated_count,
            'total_items': items.count(),
            'errors': errors
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error en migración: {str(e)}'}, status=500)

@csrf_exempt
def migrate_existing_images_endpoint(request):
    """Endpoint temporal para migrar imágenes existentes a Cloudinary"""
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
        # Configurar Cloudinary
        cloudinary.config(
            cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
            api_key=os.environ.get('CLOUDINARY_API_KEY'),
            api_secret=os.environ.get('CLOUDINARY_API_SECRET')
        )
        
        # Verificar configuración
        if not all([os.environ.get('CLOUDINARY_CLOUD_NAME'), 
                   os.environ.get('CLOUDINARY_API_KEY'), 
                   os.environ.get('CLOUDINARY_API_SECRET')]):
            return JsonResponse({'error': 'Cloudinary no está configurado correctamente'}, status=500)
        
        # Obtener todos los items de la galería
        items = GaleriaItem.objects.all()
        migrated_count = 0
        errors = []
        
        for item in items:
            try:
                print(f'Procesando item {item.id}: {item.nombre}')
                
                # Verificar si ya es una URL de Cloudinary
                if item.archivo.url.startswith('http'):
                    print(f'  Item {item.id} ya es una URL de Cloudinary, saltando...')
                    continue
                
                # Verificar si el archivo existe localmente
                if item.archivo and hasattr(item.archivo, 'path'):
                    local_path = item.archivo.path
                    if os.path.exists(local_path):
                        print(f'  Subiendo archivo local: {local_path}')
                        
                        # Subir a Cloudinary
                        with open(local_path, 'rb') as f:
                            result = cloudinary.uploader.upload(
                                f,
                                public_id=f"galeria/{item.nombre}_{item.id}",
                                resource_type="auto"
                            )
                        
                        # Actualizar el modelo con la nueva URL
                        item.archivo = result['secure_url']
                        item.save()
                        
                        migrated_count += 1
                        print(f'  ✅ Migrado exitosamente: {result["secure_url"]}')
                    else:
                        error_msg = f"Archivo no encontrado para item {item.id}: {local_path}"
                        print(f'  ⚠️ {error_msg}')
                        errors.append(error_msg)
                else:
                    error_msg = f"Item {item.id} no tiene archivo válido"
                    print(f'  ⚠️ {error_msg}')
                    errors.append(error_msg)
                    
            except Exception as e:
                error_msg = f"Error migrando item {item.id}: {str(e)}"
                print(f'  ❌ {error_msg}')
                errors.append(error_msg)
        
        return JsonResponse({
            'success': True,
            'message': f'Migración completada. {migrated_count} archivos migrados.',
            'migrated_count': migrated_count,
            'total_items': items.count(),
            'errors': errors
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error en migración: {str(e)}'}, status=500)

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

# Agregar este endpoint temporal para probar Cloudinary
@csrf_exempt
def test_cloudinary(request):
    """Endpoint para probar la configuración de Cloudinary"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    try:
        # Configurar Cloudinary
        cloudinary.config(
            cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
            api_key=os.environ.get('CLOUDINARY_API_KEY'),
            api_secret=os.environ.get('CLOUDINARY_API_SECRET')
        )
        
        # Verificar configuración
        config_status = {
            'cloud_name': bool(os.environ.get('CLOUDINARY_CLOUD_NAME')),
            'api_key': bool(os.environ.get('CLOUDINARY_API_KEY')),
            'api_secret': bool(os.environ.get('CLOUDINARY_API_SECRET'))
        }
        
        if not all(config_status.values()):
            return JsonResponse({
                'success': False,
                'error': 'Cloudinary no está configurado correctamente',
                'config_status': config_status
            }, status=500)
        
        # Test básico de API
        result = cloudinary.api.ping()
        
        return JsonResponse({
            'success': True,
            'message': 'Cloudinary configurado correctamente',
            'config_status': config_status,
            'api_test': result
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error probando Cloudinary: {str(e)}',
            'config_status': config_status if 'config_status' in locals() else None
        }, status=500)

@csrf_exempt 
def cleanup_unsplash_images(request):
    """Eliminar imágenes con URLs de Unsplash de la base de datos"""
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
        # Eliminar items que tengan URLs de Unsplash en el campo archivo
        deleted_items = []
        items_to_delete = GaleriaItem.objects.filter(archivo__icontains='unsplash.com')
        
        for item in items_to_delete:
            deleted_items.append({
                'id': item.id,
                'nombre': item.nombre,
                'url': str(item.archivo)
            })
        
        deleted_count = items_to_delete.delete()[0]
        
        return JsonResponse({
            'success': True,
            'message': f'Se eliminaron {deleted_count} imágenes de Unsplash',
            'deleted_count': deleted_count,
            'deleted_items': deleted_items
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error eliminando imágenes: {str(e)}'
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

class TorneoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar torneos"""
    queryset = Torneo.objects.all()
    serializer_class = TorneoSerializer
    permission_classes = [IsAdminOrReadOnly]  # Solo admins pueden modificar, lectura pública
    
    def perform_create(self, serializer):
        """Asignar el usuario actual como creador del torneo"""
        serializer.save(usuario_creador=self.request.user)
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """Activar un torneo"""
        torneo = self.get_object()
        torneo.estado = 'activo'
        torneo.save()
        return Response({'status': 'Torneo activado'})
    
    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """Finalizar un torneo"""
        torneo = self.get_object()
        torneo.estado = 'finalizado'
        torneo.save()
        return Response({'status': 'Torneo finalizado'})

class CategoriaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar categorías"""
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAdminOrReadOnly]  # Solo admins pueden modificar, lectura pública
    
    def get_queryset(self):
        """Filtrar categorías por torneo si se especifica"""
        queryset = Categoria.objects.all()
        torneo_id = self.request.query_params.get('torneo', None)
        if torneo_id is not None:
            queryset = queryset.filter(torneo_id=torneo_id)
        return queryset
    
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
    permission_classes = [IsAdminOrReadOnly]  # Solo admins pueden escribir; lectura pública
    
    def get_queryset(self):
        """Filtrar participantes por categoría si se especifica"""
        queryset = Participante.objects.filter(activo=True)
        categoria_id = self.request.query_params.get('categoria', None)
        if categoria_id is not None:
            queryset = queryset.filter(categoria_id=categoria_id)
        return queryset
    
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
    permission_classes = [IsAdminOrReadOnly]  # Solo admins pueden escribir; lectura pública
    
    def get_queryset(self):
        """Filtrar llaves por categoría si se especifica"""
        queryset = Llave.objects.all()
        categoria_id = self.request.query_params.get('categoria', None)
        if categoria_id is not None:
            queryset = queryset.filter(categoria_id=categoria_id)
        return queryset
    
    @action(detail=True, methods=['post'])
    def generar_automatica(self, request, pk=None):
        """Generar llave automáticamente basada en los participantes"""
        llave = self.get_object()
        participantes = list(llave.categoria.participantes.filter(activo=True))
        
        if len(participantes) < 2:
            return Response(
                {'error': 'Se necesitan al menos 2 participantes'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generar estructura de llave simple
        import random
        random.shuffle(participantes)
        
        estructura = {
            'participantes': [
                {'id': p.id, 'nombre': p.nombre_completo, 'academia': p.academia}
                for p in participantes
            ],
            'rondas': [],
            'tipo': 'eliminacion_simple'
        }
        
        llave.estructura = estructura
        llave.save()
        
        return Response({'status': 'Llave generada automáticamente'})
    
    @action(detail=True, methods=['post'])
    def bloquear(self, request, pk=None):
        """Bloquear la edición de la llave"""
        llave = self.get_object()
        llave.bloqueada = True
        llave.save()
        return Response({'status': 'Llave bloqueada'})
    
    @action(detail=True, methods=['post'])
    def desbloquear(self, request, pk=None):
        """Desbloquear la edición de la llave"""
        llave = self.get_object()
        llave.bloqueada = False
        llave.save()
        return Response({'status': 'Llave desbloqueada'})

class LuchaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar luchas"""
    queryset = Lucha.objects.all()
    serializer_class = LuchaSerializer
    permission_classes = [IsAdminOrReadOnly]  # Solo admins pueden escribir; lectura pública
    
    def get_queryset(self):
        """Filtrar luchas por categoría si se especifica"""
        queryset = Lucha.objects.all()
        categoria_id = self.request.query_params.get('categoria', None)
        if categoria_id is not None:
            queryset = queryset.filter(categoria_id=categoria_id)
        return queryset
    
    @action(detail=True, methods=['post'])
    def iniciar(self, request, pk=None):
        """Iniciar una lucha"""
        lucha = self.get_object()
        lucha.estado = 'en_progreso'
        lucha.fecha_inicio = datetime.now()
        lucha.save()
        return Response({'status': 'Lucha iniciada'})
    
    @action(detail=True, methods=['post'])
    def pausar(self, request, pk=None):
        """Pausar una lucha"""
        lucha = self.get_object()
        lucha.estado = 'pausada'
        lucha.save()
        return Response({'status': 'Lucha pausada'})
    
    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """Finalizar una lucha"""
        lucha = self.get_object()
        data = request.data
        
        lucha.estado = 'finalizada'
        lucha.fecha_fin = datetime.now()
        
        # Actualizar puntuación final
        lucha.puntos_p1 = data.get('puntos_p1', lucha.puntos_p1)
        lucha.ventajas_p1 = data.get('ventajas_p1', lucha.ventajas_p1)
        lucha.penalizaciones_p1 = data.get('penalizaciones_p1', lucha.penalizaciones_p1)
        
        lucha.puntos_p2 = data.get('puntos_p2', lucha.puntos_p2)
        lucha.ventajas_p2 = data.get('ventajas_p2', lucha.ventajas_p2)
        lucha.penalizaciones_p2 = data.get('penalizaciones_p2', lucha.penalizaciones_p2)
        
        lucha.tiempo_transcurrido = data.get('tiempo_transcurrido', lucha.tiempo_transcurrido)
        
        # Determinar ganador
        if lucha.puntos_p1 > lucha.puntos_p2:
            lucha.ganador = lucha.participante1
            lucha.resultado = 'Por puntos'
        elif lucha.puntos_p2 > lucha.puntos_p1:
            lucha.ganador = lucha.participante2
            lucha.resultado = 'Por puntos'
        else:
            # En caso de empate, revisar ventajas
            if lucha.ventajas_p1 > lucha.ventajas_p2:
                lucha.ganador = lucha.participante1
                lucha.resultado = 'Por ventajas'
            elif lucha.ventajas_p2 > lucha.ventajas_p1:
                lucha.ganador = lucha.participante2
                lucha.resultado = 'Por ventajas'
            else:
                lucha.resultado = 'Empate'
        
        lucha.save()
        return Response({'status': 'Lucha finalizada', 'ganador': lucha.ganador.nombre_completo if lucha.ganador else None})
    
    @action(detail=True, methods=['post'])
    def actualizar_puntuacion(self, request, pk=None):
        """Actualizar puntuación en tiempo real durante la lucha"""
        lucha = self.get_object()
        data = request.data
        
        # Actualizar puntuación
        if 'puntos_p1' in data:
            lucha.puntos_p1 = max(0, data['puntos_p1'])
        if 'ventajas_p1' in data:
            lucha.ventajas_p1 = max(0, data['ventajas_p1'])
        if 'penalizaciones_p1' in data:
            lucha.penalizaciones_p1 = max(0, data['penalizaciones_p1'])
            
        if 'puntos_p2' in data:
            lucha.puntos_p2 = max(0, data['puntos_p2'])
        if 'ventajas_p2' in data:
            lucha.ventajas_p2 = max(0, data['ventajas_p2'])
        if 'penalizaciones_p2' in data:
            lucha.penalizaciones_p2 = max(0, data['penalizaciones_p2'])
        
        if 'tiempo_transcurrido' in data:
            lucha.tiempo_transcurrido = data['tiempo_transcurrido']
        
        lucha.save()
        
        serializer = self.get_serializer(lucha)
        return Response(serializer.data)

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