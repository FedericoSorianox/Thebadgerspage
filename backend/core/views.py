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

def api_root(request):
    return JsonResponse({"mensaje": "¡API funcionando correctamente!"})

def galeria_list(request):
    items = GaleriaItem.objects.order_by('-fecha_subida')[:8]
    data = [
        {
            'id': item.id,
            'url': request.build_absolute_uri(item.archivo.url),
            'nombre': item.nombre,
            'fecha': item.fecha_subida.strftime('%Y-%m-%d'),
            'tipo': item.tipo,
            'usuario': item.usuario.username if item.usuario else 'Anónimo',
        }
        for item in items
    ]
    return JsonResponse(data, safe=False)

@csrf_exempt
def galeria_upload(request):
    print(f"DEBUG: Método de la petición: {request.method}")
    print(f"DEBUG: Content-Type: {request.META.get('CONTENT_TYPE', 'No especificado')}")
    print(f"DEBUG: Content-Length: {request.META.get('CONTENT_LENGTH', 'No especificado')}")
    print(f"DEBUG: POST data: {dict(request.POST)}")
    print(f"DEBUG: FILES: {dict(request.FILES)}")
    print(f"DEBUG: Número de archivos: {len(request.FILES)}")
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    # Verificar autenticación
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
    
    # Verificar campos requeridos
    nombre = request.POST.get('nombre')
    archivo = request.FILES.get('archivo')
    
    print(f"DEBUG: Nombre recibido: {nombre}")
    print(f"DEBUG: Archivo recibido: {archivo}")
    if archivo:
        print(f"DEBUG: Tamaño del archivo: {archivo.size}")
        print(f"DEBUG: Tipo del archivo: {archivo.content_type}")
        print(f"DEBUG: Nombre del archivo: {archivo.name}")
        print(f"DEBUG: Archivo es válido: {archivo.name and archivo.size > 0}")
    else:
        print(f"DEBUG: No se recibió archivo en request.FILES")
        print(f"DEBUG: Claves disponibles en FILES: {list(request.FILES.keys())}")
    
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
        item = GaleriaItem.objects.create(nombre=nombre, archivo=archivo, usuario=user)
        
        # Mantener solo los últimos 8 elementos
        items = GaleriaItem.objects.order_by('-fecha_subida')
        if items.count() > 8:
            for old in items[8:]:
                old.delete()
        
        return JsonResponse({
            'ok': True,
            'message': 'Archivo subido exitosamente',
            'id': item.id,
            'url': request.build_absolute_uri(item.archivo.url)
        })
    except Exception as e:
        print(f"DEBUG: Error al guardar el archivo: {e}")
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