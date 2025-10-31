from django.http import JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django.shortcuts import get_object_or_404
from datetime import datetime
from rest_framework.authtoken.models import Token
from .permissions import IsAdminOrReadOnly
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.db import models

import os
import base64
import json
from django.conf import settings
from .models import GaleriaItem
from django.contrib.auth.models import User
from django.http import Http404
from django.views import View
import tempfile

try:
    import cloudinary
    import cloudinary.uploader
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False

# ============= API ROOT =============
@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API Root endpoint que lista todas las APIs disponibles"""
    return Response({
        'message': 'The Badgers Page API - Sistema simplificado (Torneo BJJ temporalmente deshabilitado)',
        'version': '2.0.0',
        'endpoints': {
            'auth': {
                'login': '/api/auth/login/',
                'logout': '/api/auth/logout/',
                'user': '/api/auth/user/',
                'status': '/api/auth/status/',
            },
            'galeria': {
                'list': '/api/galeria/',
                'items': '/api/galeria/items/',
                'upload': '/api/galeria/upload/',
                'delete': '/api/galeria/delete/{id}/',
            },
            'admin': '/admin/',
        }
    })

# ============= FRONTEND SERVE =============
class FrontendAppView(View):
    """Vista para servir la aplicación frontend"""
    def get(self, request, *args, **kwargs):
        try:
            from django.http import FileResponse
            import os
            
            # Buscar el archivo index.html en diferentes ubicaciones
            possible_paths = [
                os.path.join(settings.BASE_DIR, 'frontend_build', 'index.html'),
                os.path.join(settings.BASE_DIR, 'static', 'index.html'),
                os.path.join(settings.BASE_DIR, 'build', 'index.html'),
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    return FileResponse(open(path, 'rb'), content_type='text/html')
            
            # Si no se encuentra el archivo, devolver un mensaje de error
            return JsonResponse({
                'error': 'Frontend no encontrado',
                'message': 'El frontend de React no está disponible. Asegúrate de hacer build del frontend.',
                'searched_paths': possible_paths
            }, status=404)
            
        except Exception as e:
            return JsonResponse({
                'error': 'Error interno',
                'message': str(e)
            }, status=500)

# ============= GALERÍA =============
@csrf_exempt
def galeria_list(request):
    """Endpoint para listar items de galería"""
    print(f"DEBUG galeria_list: Método {request.method}")
    
    try:
        # Verificar si la tabla tiene la columna usuario_id
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("PRAGMA table_info(core_galeriaitem)")
        columns = [column[1] for column in cursor.fetchall()]
        has_usuario_column = 'usuario_id' in columns
        
        if has_usuario_column:
            items = GaleriaItem.objects.select_related('usuario').order_by('-fecha_subida')[:8]
        else:
            items = GaleriaItem.objects.order_by('-fecha_subida')[:8]
            
        print(f"DEBUG galeria_list: Encontrados {items.count()} items en la base de datos")
        
        data = []
        for item in items:
            print(f"DEBUG galeria_list: Procesando item {item.id} - {item.nombre}")
            
            # Obtener valor del campo archivo
            archivo_value = str(item.archivo) if item.archivo else ""
            print(f"DEBUG galeria_list: Valor real del campo archivo: {archivo_value}")
            
            # Si es una URL de Unsplash, saltar (son datos de ejemplo)
            if 'unsplash.com' in archivo_value:
                print(f"DEBUG galeria_list: Saltando imagen de Unsplash: {archivo_value}")
                continue
            
            # Determinar URL final
            if archivo_value.startswith('https://res.cloudinary.com'):
                # URL directa de Cloudinary
                file_url = archivo_value
                print(f"DEBUG galeria_list: URL directa de Cloudinary encontrada: {file_url}")
            elif hasattr(item.archivo, 'url') and item.archivo.url.startswith('https://res.cloudinary.com'):
                # URL de Cloudinary desde storage
                file_url = item.archivo.url
                print(f"DEBUG galeria_list: URL de Cloudinary desde storage encontrada: {file_url}")
            elif hasattr(item.archivo, 'url'):
                # URL local, construir URL absoluta
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
                'usuario': getattr(item, 'usuario', None).username if getattr(item, 'usuario', None) else 'Anónimo',
            })
        
        print(f"DEBUG galeria_list: Respuesta final: {data}")
        return JsonResponse(data, safe=False)
        
    except Exception as e:
        print(f"DEBUG galeria_list: Error: {e}")
        return JsonResponse({'error': str(e)}, status=500)

# ============= GALERÍA ITEMS (CON PAGINACIÓN) =============
@csrf_exempt  
def galeria_items(request):
    """Endpoint para listar items de galería con paginación"""
    print(f"DEBUG galeria_items: Método {request.method}")
    
    try:
        # Verificar si la tabla tiene la columna usuario_id
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("PRAGMA table_info(core_galeriaitem)")
        columns = [column[1] for column in cursor.fetchall()]
        has_usuario_column = 'usuario_id' in columns
        
        # Parámetros de paginación
        cursor = request.GET.get('cursor')
        limit = int(request.GET.get('limit', 24))
        
        # Obtener items ordenados por fecha
        if has_usuario_column:
            queryset = GaleriaItem.objects.select_related('usuario').order_by('-fecha_subida', '-id')
        else:
            queryset = GaleriaItem.objects.order_by('-fecha_subida', '-id')
        
        # Aplicar cursor si existe
        if cursor:
            try:
                cursor_date, cursor_id = cursor.split('_')
                from django.utils.dateparse import parse_datetime
                cursor_datetime = parse_datetime(cursor_date)
                queryset = queryset.filter(
                    models.Q(fecha_subida__lt=cursor_datetime) |
                    models.Q(fecha_subida=cursor_datetime, id__lt=int(cursor_id))
                )
            except (ValueError, TypeError):
                pass  # Ignorar cursor inválido
        
        # Obtener items con límite + 1 para saber si hay más
        items = list(queryset[:limit + 1])
        has_more = len(items) > limit
        if has_more:
            items = items[:limit]  # Remover el item extra
        
        print(f"DEBUG galeria_items: Procesando {len(items)} items")
        
        # Construir respuesta
        results = []
        for item in items:
            # Determinar URL del archivo
            archivo_value = str(item.archivo) if item.archivo else ""
            
            # Saltar URLs de Unsplash (datos de ejemplo)
            if 'unsplash.com' in archivo_value:
                continue
                
            # Determinar URL final
            if archivo_value.startswith('https://res.cloudinary.com'):
                file_url = archivo_value
            elif hasattr(item.archivo, 'url') and item.archivo.url.startswith('https://res.cloudinary.com'):
                file_url = item.archivo.url  
            elif hasattr(item.archivo, 'url'):
                file_url = item.archivo.url
                if not file_url.startswith('http'):
                    file_url = f"https://thebadgerspage.onrender.com{file_url}"
            else:
                continue  # Saltar si no hay URL válida
            
            results.append({
                'id': item.id,
                'url': file_url, 
                'nombre': item.nombre,
                'fecha': item.fecha_subida.isoformat(),
                'tipo': item.tipo,
                'usuario': getattr(item, 'usuario', None).username if getattr(item, 'usuario', None) else 'Anónimo',
            })
        
        # Calcular next_cursor
        next_cursor = None
        if has_more and results:
            last_item = items[-1]  # El último item procesado
            next_cursor = f"{last_item.fecha_subida.isoformat()}_{last_item.id}"
        
        response_data = {
            'results': results,
            'next_cursor': next_cursor,
            'has_more': has_more
        }
        
        print(f"DEBUG galeria_items: Respuesta con {len(results)} items, has_more: {has_more}")
        return JsonResponse(response_data)
        
    except Exception as e:
        print(f"DEBUG galeria_items: Error: {e}")
        return JsonResponse({'error': str(e)}, status=500)

# ============= GALERÍA UPLOAD =============
@csrf_exempt
def galeria_upload(request):
    """Endpoint para subir archivos a la galería"""
    print(f"DEBUG: Método de la petición: {request.method}")
    
    # Verificar autenticación
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
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    # Verificar campos requeridos
    nombre = request.POST.get('nombre')
    archivo = request.FILES.get('archivo')
    
    if not nombre or not archivo:
        return JsonResponse({'error': 'Nombre y archivo son requeridos'}, status=400)
    
    if archivo.size == 0:
        return JsonResponse({'error': 'El archivo está vacío'}, status=400)
    
    try:
        # Intentar subir a Cloudinary
        if CLOUDINARY_AVAILABLE and all([
            os.environ.get('CLOUDINARY_CLOUD_NAME'),
            os.environ.get('CLOUDINARY_API_KEY'),
            os.environ.get('CLOUDINARY_API_SECRET')
        ]):
            cloudinary.config(
                cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
                api_key=os.environ.get('CLOUDINARY_API_KEY'),
                api_secret=os.environ.get('CLOUDINARY_API_SECRET')
            )
            
            result = cloudinary.uploader.upload(
                archivo,
                public_id=f"galeria/{nombre}_{user.username}",
                resource_type="auto"
            )
            
            item = GaleriaItem.objects.create(
                nombre=nombre,
                archivo=result['secure_url'],
                usuario=user
            )
            
            file_url = result['secure_url']
        else:
            # Fallback a almacenamiento local
            item = GaleriaItem.objects.create(
                nombre=nombre,
                archivo=archivo,
                usuario=user
            )
            
            file_url = request.build_absolute_uri(item.archivo.url).replace('http://', 'https://')
        
        return JsonResponse({
            'id': item.id,
            'url': file_url,
            'nombre': item.nombre,
            'message': 'Archivo subido exitosamente'
        })
        
    except Exception as e:
        print(f"DEBUG: Error subiendo archivo: {e}")
        return JsonResponse({'error': f'Error subiendo archivo: {str(e)}'}, status=500)

# ============= GALERÍA DELETE =============
@csrf_exempt
def galeria_delete(request, item_id):
    """Endpoint para eliminar items de la galería"""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    # Verificar autenticación
    if not request.META.get('HTTP_AUTHORIZATION'):
        return JsonResponse({'error': 'No autenticado'}, status=401)
    
    auth = request.META['HTTP_AUTHORIZATION']
    if not auth.startswith('Token '):
        return JsonResponse({'error': 'Token requerido'}, status=401)
    
    try:
        token_key = auth.split(' ')[1]
        token = Token.objects.get(key=token_key)
        user = token.user
    except Token.DoesNotExist:
        return JsonResponse({'error': 'Token inválido'}, status=401)
    
    # Verificar permisos de admin
    if not (user.is_staff or user.is_superuser):
        return JsonResponse({'error': 'Permisos insuficientes'}, status=403)
    
    try:
        item = GaleriaItem.objects.get(id=item_id)
        
        # Eliminar de Cloudinary si es necesario
        archivo_value = str(item.archivo)
        if 'cloudinary.com' in archivo_value:
            try:
                # Extraer public_id de la URL de Cloudinary
                parts = archivo_value.split('/')
                if 'upload' in parts:
                    idx = parts.index('upload') + 2  # Saltar version
                    public_id = '/'.join(parts[idx:]).split('.')[0]
                    cloudinary.uploader.destroy(public_id)
            except Exception as e:
                print(f"Warning: No se pudo eliminar de Cloudinary: {e}")
        
        item.delete()
        return JsonResponse({'message': 'Item eliminado exitosamente'})
        
    except GaleriaItem.DoesNotExist:
        return JsonResponse({'error': 'Item no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# ============= AUTENTICACIÓN =============
@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    """Endpoint para login con token authentication"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    
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
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    """Endpoint para logout"""
    try:
        Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser,
            }
        })
    else:
        return Response({'authenticated': False})

# ============= UTILIDADES =============
@csrf_exempt
def debug_cloudinary(request):
    """Endpoint para debug de configuración de Cloudinary"""
    return JsonResponse({
        'cloudinary_available': CLOUDINARY_AVAILABLE,
        'cloudinary_configured': all([
            os.environ.get('CLOUDINARY_CLOUD_NAME'),
            os.environ.get('CLOUDINARY_API_KEY'),
            os.environ.get('CLOUDINARY_API_SECRET')
        ]),
        'cloud_name': os.environ.get('CLOUDINARY_CLOUD_NAME', 'No configurado'),
        'has_api_key': bool(os.environ.get('CLOUDINARY_API_KEY')),
        'has_api_secret': bool(os.environ.get('CLOUDINARY_API_SECRET')),
    })

@csrf_exempt
def cloudinary_status(request):
    """Status de configuración de Cloudinary"""
    if not CLOUDINARY_AVAILABLE:
        return JsonResponse({'status': 'Cloudinary no instalado'})
    
    configured = all([
        os.environ.get('CLOUDINARY_CLOUD_NAME'),
        os.environ.get('CLOUDINARY_API_KEY'),
        os.environ.get('CLOUDINARY_API_SECRET')
    ])
    
    return JsonResponse({
        'status': 'Configurado' if configured else 'No configurado',
        'configured': configured
    })

@csrf_exempt  
def productos_proxy(request):
    """Proxy simple para productos (placeholder)"""
    # Retornar array vacío directamente para compatibilidad con frontend
    return JsonResponse([], safe=False)

# ============= TORNEO BJJ (DESHABILITADO) =============
# TODO: Las siguientes funciones están deshabilitadas temporalmente
# para evitar errores de importación durante el deploy

# def luchas_disponibles(request):
#     pass

# class TorneoViewSet, CategoriaViewSet, ParticipanteViewSet, etc:
#     pass
