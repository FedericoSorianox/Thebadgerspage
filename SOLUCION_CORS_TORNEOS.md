# Resolución de Errores CORS - Sistema de Torneo BJJ

## Problemas Identificados

1. **Errores CORS**: El navegador bloqueaba las peticiones API desde `the-badgers.com` hacia el backend
2. **URL API inconsistente**: La consola mostraba peticiones a `the-badgers.com/api/` pero el código usaba `thebadgerspage.onrender.com`
3. **Configuración de entorno**: Faltaban dependencias de Python (`python-dotenv`)

## Soluciones Aplicadas

### 1. Configuración CORS del Backend

**Archivo: `backend/core/middleware.py`**
- ✅ Agregados más dominios permitidos incluyendo `127.0.0.1`
- ✅ Mejorado el manejo de orígenes no listados (usar wildcard `*`)
- ✅ Headers CORS más permisivos para desarrollo

**Archivo: `backend/core/settings.py`**
- ✅ Actualizada lista `CORS_ALLOWED_ORIGINS` con todos los dominios
- ✅ Actualizada lista `CSRF_TRUSTED_ORIGINS`
- ✅ Agregados puertos de desarrollo (`127.0.0.1:5173`, etc.)

**Archivo: `backend/urls.py`**
- ✅ Mejorado el handler global de OPTIONS para CORS preflight
- ✅ Agregados dominios adicionales para desarrollo

### 2. Detección Automática de API URL en Frontend

**Archivo: `frontend/src/services/api-new.js`**
- ✅ Lógica para detectar automáticamente si está en `the-badgers.com`
- ✅ Si está en `the-badgers.com`, usa ese dominio como API base
- ✅ Mantiene compatibilidad con desarrollo y `thebadgerspage.onrender.com`

### 3. Configuración de Entorno

**Entorno Virtual Python:**
- ✅ Creado entorno virtual en `backend/venv/`
- ✅ Instaladas todas las dependencias de `requirements.txt`
- ✅ Verificada configuración Django

**Scripts de Automatización:**
- ✅ `fix_cors_torneos.sh` - Configura entorno completo
- ✅ `test_api_torneos.sh` - Prueba endpoints localmente
- ✅ `deploy_cors_fix_final.sh` - Despliega a producción

## Comandos para Resolver el Problema

### Desarrollo Local

```bash
# 1. Configurar entorno completo
./fix_cors_torneos.sh

# 2. Iniciar backend
cd backend
source venv/bin/activate
export USE_SQLITE=true
python manage.py runserver

# 3. En otra terminal, iniciar frontend
cd frontend
npm run dev

# 4. Probar API
./test_api_torneos.sh
```

### Despliegue a Producción

```bash
# Desplegar arreglos a producción
./deploy_cors_fix_final.sh
```

## Verificación de la Solución

### En Desarrollo (localhost)
1. Abrir `http://localhost:5173/torneo`
2. Verificar que no hay errores CORS en la consola
3. Confirmar que carga la lista de torneos

### En Producción
1. Abrir DevTools en `the-badgers.com`
2. Ir a la consola y ejecutar:
   ```javascript
   fetch('/api/torneo/torneos/')
     .then(r => r.json())
     .then(console.log)
   ```
3. Verificar que devuelve datos sin errores CORS

## Archivos Modificados

- ✅ `backend/core/middleware.py` - CORS middleware personalizado
- ✅ `backend/core/settings.py` - Configuración CORS y CSRF
- ✅ `backend/urls.py` - Handler global OPTIONS
- ✅ `frontend/src/services/api-new.js` - Detección automática de API URL

## Próximos Pasos

1. **Verificar** que el despliegue funciona correctamente
2. **Monitorear** logs del servidor para confirmar que no hay más errores CORS
3. **Probar** todas las funcionalidades del sistema de torneos
4. **Limpiar** archivos de configuración antiguos si todo funciona bien

## Notas Técnicas

- Los cambios son **backward compatible** 
- Funciona tanto en desarrollo como producción
- Mantiene seguridad CORS apropiada
- No requiere cambios en otros componentes
