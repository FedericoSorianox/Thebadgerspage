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

def api_root(request):
    return JsonResponse({"mensaje": "¡API funcionando correctamente!"})

def galeria_list(request):
    items = GaleriaItem.objects.order_by('-fecha_subida')[:8]
    data = []
    
    # Debug de configuración
    print(f"DEBUG galeria_list: DEFAULT_FILE_STORAGE = {getattr(settings, 'DEFAULT_FILE_STORAGE', 'No definido')}")
    print(f"DEBUG galeria_list: CLOUDINARY_CONFIGURED = {getattr(settings, 'CLOUDINARY_CONFIGURED', 'No definido')}")
    
    for item in items:
        print(f"DEBUG galeria_list: Procesando item {item.id} - {item.nombre}")
        print(f"DEBUG galeria_list: item.archivo.url = {item.archivo.url}")
        print(f"DEBUG galeria_list: item.archivo.name = {item.archivo.name}")
        print(f"DEBUG galeria_list: item.archivo.storage = {item.archivo.storage}")
        
        # Verificar si estamos usando Cloudinary
        is_cloudinary = (
            hasattr(settings, 'DEFAULT_FILE_STORAGE') and 
            'cloudinary' in str(settings.DEFAULT_FILE_STORAGE).lower()
        )
        
        print(f"DEBUG galeria_list: is_cloudinary = {is_cloudinary}")
        
        # Verificar si el archivo está en Cloudinary o en almacenamiento local
        is_file_in_cloudinary = (
            is_cloudinary and 
            hasattr(item.archivo.storage, '__class__') and
            'cloudinary' in str(item.archivo.storage.__class__).lower()
        )
        
        print(f"DEBUG galeria_list: is_file_in_cloudinary = {is_file_in_cloudinary}")
        
        if is_file_in_cloudinary:
            # El archivo está en Cloudinary, usar URL directa
            file_url = item.archivo.url
            print(f"DEBUG galeria_list: Archivo en Cloudinary, URL: {file_url}")
        elif is_cloudinary:
            # Estamos usando Cloudinary pero el archivo está en almacenamiento local
            # Intentar construir URL de Cloudinary basada en el nombre del archivo
            cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
            if cloud_name:
                # Asumir que el archivo existe en Cloudinary con el mismo nombre
                file_url = f"https://res.cloudinary.com/{cloud_name}/image/upload/v1/media/{item.archivo.name}"
                print(f"DEBUG galeria_list: Construyendo URL de Cloudinary: {file_url}")
            else:
                # Fallback a URL local
                file_url = request.build_absolute_uri(item.archivo.url).replace('http://', 'https://')
                print(f"DEBUG galeria_list: Fallback a URL local: {file_url}")
        else:
            # Usando almacenamiento local
            file_url = request.build_absolute_uri(item.archivo.url).replace('http://', 'https://')
            print(f"DEBUG galeria_list: Usando URL local: {file_url}")
        
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
        
        # En producción, siempre usar Cloudinary
        is_cloudinary = not settings.DEBUG
        print(f"DEBUG: is_cloudinary en upload: {is_cloudinary} (DEBUG: {settings.DEBUG})")
        
        if is_cloudinary:
            # Si usamos Cloudinary, subir directamente a Cloudinary
            print(f"DEBUG: Subiendo directamente a Cloudinary")
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
                
                print(f"DEBUG: Archivo subido a Cloudinary: {result['secure_url']}")
                
                # Crear el item con la URL de Cloudinary
                item = GaleriaItem.objects.create(
                    nombre=nombre, 
                    archivo=f"galeria/{nombre}_{user.username}", 
                    usuario=user
                )
                
            except Exception as e:
                print(f"DEBUG: Error subiendo a Cloudinary: {e}")
                # Fallback a almacenamiento local
                item = GaleriaItem.objects.create(nombre=nombre, archivo=archivo, usuario=user)
        else:
            # Usar almacenamiento local
            print(f"DEBUG: Usando almacenamiento local")
            # Verificar que el directorio media existe
            media_dir = os.path.join(settings.MEDIA_ROOT, 'galeria')
            if not os.path.exists(media_dir):
                os.makedirs(media_dir, exist_ok=True)
                print(f"DEBUG: Creado directorio: {media_dir}")
            
            item = GaleriaItem.objects.create(nombre=nombre, archivo=archivo, usuario=user)
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
        
        # Generar la URL correcta según el storage configurado
        print(f"DEBUG: DEFAULT_FILE_STORAGE: {getattr(settings, 'DEFAULT_FILE_STORAGE', 'No definido')}")
        print(f"DEBUG: CLOUDINARY_CONFIGURED: {getattr(settings, 'CLOUDINARY_CONFIGURED', 'No definido')}")
        print(f"DEBUG: DEBUG setting: {settings.DEBUG}")
        
        # Verificar si estamos usando Cloudinary
        is_cloudinary = (
            hasattr(settings, 'DEFAULT_FILE_STORAGE') and 
            'cloudinary' in str(settings.DEFAULT_FILE_STORAGE).lower()
        )
        print(f"DEBUG: is_cloudinary: {is_cloudinary}")
        
        if is_cloudinary:
            # Si usamos Cloudinary, la URL ya es completa
            file_url = item.archivo.url
            print(f"DEBUG: Usando URL de Cloudinary: {file_url}")
        else:
            # Si usamos almacenamiento local, construir URL absoluta
            file_url = request.build_absolute_uri(item.archivo.url).replace('http://', 'https://')
            print(f"DEBUG: Usando URL local: {file_url}")
        
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