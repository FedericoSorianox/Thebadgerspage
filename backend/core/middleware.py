from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse

class CustomCorsMiddleware(MiddlewareMixin):
    """
    Middleware CORS personalizado para manejar problemas específicos de producción
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.allowed_origins = [
            'https://the-badgers.com',
            'https://www.the-badgers.com',
            'https://thebadgerspage.onrender.com', 
            'https://www.thebadgerspage.onrender.com',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ]
        super().__init__(get_response)

    def __call__(self, request):
        # Obtener el origin del request
        origin = request.META.get('HTTP_ORIGIN', '')
        
        # Manejar preflight OPTIONS request
        if request.method == 'OPTIONS':
            response = JsonResponse({})
            self.add_cors_headers(response, origin)
            return response
            
        response = self.get_response(request)
        self.add_cors_headers(response, origin)
        return response

    def add_cors_headers(self, response, origin):
        """Añade headers CORS a la respuesta"""
        
        # TEMPORAL: Permitir todos los orígenes para debug CORS
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Credentials'] = 'false'  # No se puede usar credentials con *
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH'
        response['Access-Control-Allow-Headers'] = (
            'Accept, Accept-Encoding, Authorization, Content-Type, '
            'DNT, Origin, User-Agent, X-CSRFToken, X-Requested-With, '
            'Cache-Control, Pragma, Expires'
        )
        response['Access-Control-Max-Age'] = '86400'
        response['Access-Control-Expose-Headers'] = 'Content-Length, Content-Range, Authorization'
        
        # Headers adicionales para debug
        response['X-Custom-CORS'] = 'enabled-wildcard'
        response['X-Debug-Origin'] = origin
        
        return response
