from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from core.models import GaleriaItem
import json
import base64

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
        }
        for item in items[::-1]
    ]
    return JsonResponse(data, safe=False)

@csrf_exempt
def galeria_upload(request):
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
    nombre = request.POST.get('nombre')
    archivo = request.FILES.get('archivo')
    if not nombre or not archivo:
        return JsonResponse({'error': 'Faltan campos'}, status=400)
    item = GaleriaItem.objects.create(nombre=nombre, archivo=archivo)
    items = GaleriaItem.objects.order_by('-fecha_subida')
    if items.count() > 8:
        for old in items[8:]:
            old.archivo.delete(save=False)
            old.delete()
    return JsonResponse({'ok': True, 'id': item.id})

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
        User.objects.create_user(username=username, password=password)
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