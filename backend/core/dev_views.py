"""
Endpoints de desarrollo que no requieren autenticación.
Solo disponibles cuando DEBUG=True
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import GaleriaItem
import json
import os

@csrf_exempt
def dev_galeria_upload(request):
    """
    Endpoint de desarrollo para subir archivos sin autenticación.
    Solo disponible cuando DEBUG=True
    """
    if not settings.DEBUG:
        return JsonResponse({'error': 'Endpoint no disponible en producción'}, status=403)
    
    print("DEBUG: Usando endpoint de desarrollo para galeria_upload")
    
    # Si es un GET request, devolver información del endpoint
    if request.method == 'GET':
        return JsonResponse({
            'ok': True, 
            'message': 'Endpoint de desarrollo activo - no requiere autenticación',
            'debug': True
        })
    
    # Solo POST está permitido para subir archivos
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    # Verificar campos requeridos
    nombre = request.POST.get('nombre')
    archivo = request.FILES.get('archivo')
    
    print(f"DEBUG: Nombre recibido: {nombre}")
    print(f"DEBUG: Archivo recibido: {archivo}")
    
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
    
    try:
        # Usar almacenamiento local en desarrollo
        media_dir = os.path.join(settings.MEDIA_ROOT, 'galeria')
        if not os.path.exists(media_dir):
            os.makedirs(media_dir, exist_ok=True)
        
        # Crear el item sin usuario (modo desarrollo)
        item = GaleriaItem.objects.create(
            nombre=nombre, 
            archivo=archivo, 
            usuario=None  # Sin usuario en desarrollo
        )
        
        # Construir URL absoluta
        file_url = request.build_absolute_uri(item.archivo.url)
        print(f"DEBUG: Usando URL local: {file_url}")
        
        response_data = {
            'ok': True,
            'message': 'Archivo subido exitosamente (modo desarrollo)',
            'id': item.id,
            'url': file_url,
            'debug': True
        }
        print(f"DEBUG: Respuesta exitosa: {response_data}")
        return JsonResponse(response_data)
        
    except Exception as e:
        import traceback
        print(f"DEBUG: Error al guardar el archivo: {e}")
        print(f"DEBUG: Traceback completo: {traceback.format_exc()}")
        return JsonResponse({'error': f'Error al guardar el archivo: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def dev_auth_status(request):
    """
    Endpoint de desarrollo para verificar estado de autenticación.
    Siempre devuelve que no está autenticado en desarrollo.
    """
    if not settings.DEBUG:
        return Response({'error': 'Endpoint no disponible en producción'}, status=403)
    
    return Response({
        'authenticated': False,
        'debug': True,
        'message': 'Modo desarrollo - sin autenticación requerida'
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def dev_login(request):
    """
    Endpoint de desarrollo que simula login exitoso.
    Solo disponible cuando DEBUG=True
    """
    if not settings.DEBUG:
        return Response({'error': 'Endpoint no disponible en producción'}, status=403)
    
    return Response({
        'token': 'dev-token-12345',
        'user': {
            'id': 1,
            'username': 'dev_user',
            'email': 'dev@example.com',
            'first_name': 'Dev',
            'last_name': 'User',
            'is_staff': True,
            'is_superuser': True,
        },
        'debug': True,
        'message': 'Login simulado en modo desarrollo'
    })
