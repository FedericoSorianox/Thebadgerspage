# 🥋 The Badgers - Sistema de Torneos BJJ con MongoDB

## 📋 Descripción
Sistema completo para la gestión de torneos internos de Brazilian Jiu Jitsu con integración completa a MongoDB.

## 🚀 Características Implementadas

### ✅ Funcionalidades Completas
- ✅ **Gestión de Torneos**: Crear, editar, eliminar torneos
- ✅ **Sistema de Categorías**: Configuración flexible por cinturón y peso
- ✅ **Gestión de Participantes**: Registro completo con validaciones
- ✅ **Sistema de Luchas BJJ**: Puntuación oficial del BJJ
- ✅ **Visualización de Brackets**: Interfaz intuitiva para torneos
- ✅ **Base de Datos MongoDB**: Almacenamiento completo en MongoDB
- ✅ **API REST**: Endpoints completos para todas las operaciones
- ✅ **Autenticación**: Sistema seguro con credenciales

### 🎯 URLs del Sistema
- **Aplicación Frontend**: http://localhost:5173
- **Página de Torneos**: http://localhost:5173/torneo
- **Backend API**: http://localhost:8000
- **MongoDB Admin**: http://localhost:8081

## 🛠️ Instalación y Configuración

### 1. Instalar Docker y Docker Compose
```bash
# macOS con Homebrew
brew install docker docker-compose

# O descargar desde: https://www.docker.com/products/docker-desktop
```

### 2. Iniciar MongoDB
```bash
cd /Users/fede/Thebadgerspage

# Iniciar MongoDB con Docker Compose
docker-compose up -d mongodb

# Verificar que esté funcionando
docker ps
```

### 3. Configurar Variables de Entorno
Crear archivo `.env` en la carpeta `backend/`:
```bash
cd backend
cat > .env << EOF
# Configuración de MongoDB
MONGODB_URI=mongodb://thebadgers_user:badgers_password_2025@localhost:27017/thebadgers_torneos
MONGODB_DB_NAME=thebadgers_torneos

# Configuración de Django
DEBUG=True
SECRET_KEY=django-insecure-dev-secret-key-123456789
USE_SQLITE=True

# Configuración de API
VITE_API_BASE_URL=http://localhost:8000
EOF
```

### 4. Instalar Dependencias del Backend
```bash
cd backend

# Activar entorno virtual (si existe)
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate

# Instalar dependencias
pip install pymongo motor
```

### 5. Iniciar los Servicios
```bash
# Terminal 1: Backend Django
cd backend
source venv/bin/activate
python3 manage.py runserver 8000

# Terminal 2: Frontend React
cd frontend
npm run dev

# Terminal 3: MongoDB Admin (opcional)
# Abrir en navegador: http://localhost:8081
# Usuario: admin
# Contraseña: express123
```

## 📊 Estructura de la Base de Datos MongoDB

### Colecciones Principales

#### 🏆 **torneos**
```javascript
{
  _id: ObjectId,
  nombre: "Torneo Invierno 2025",
  fecha: ISODate("2025-07-15"),
  descripcion: "Descripción del torneo",
  estado: "en_progreso", // 'planificado', 'en_progreso', 'finalizado', 'cancelado'
  categorias: [
    {
      id: 1,
      nombre: "Blanca - Hasta 70kg",
      tipo_categoria: "blanca",
      peso_minimo: null,
      peso_maximo: 70
    }
  ],
  fecha_creacion: ISODate(),
  fecha_actualizacion: ISODate()
}
```

#### 👥 **participantes**
```javascript
{
  _id: ObjectId,
  torneo_id: ObjectId,
  nombre: "Juan Pérez",
  academia: "The Badgers",
  cinturon: "azul",
  peso: 75.5,
  categoria_sugerida: "Azul - Hasta 80kg",
  categoria_asignada: null,
  activo: true,
  fecha_inscripcion: ISODate()
}
```

#### 🥋 **luchas**
```javascript
{
  _id: ObjectId,
  torneo_id: ObjectId,
  categoria: "Azul - Hasta 80kg",
  participante1_id: ObjectId,
  participante2_id: ObjectId,
  ronda: "Primera Ronda",
  estado: "en_progreso",
  // Sistema de puntuación
  puntos_p1: 7, puntos_p2: 3,
  ventajas_p1: 1, ventajas_p2: 0,
  penalizaciones_p1: 0, penalizaciones_p2: 1,
  // Movimientos detallados
  montadas_p1: 1, guardas_pasadas_p1: 1,
  rodillazos_p1: 0, derribos_p1: 2,
  // Resultado
  ganador_id: ObjectId,
  tipo_victoria: "puntos",
  resultado_detalle: "",
  fecha_creacion: ISODate()
}
```

## 🔗 API Endpoints

### Torneos
- `GET /api/torneos/` - Listar torneos
- `POST /api/torneos/` - Crear torneo
- `GET /api/torneos/{id}/` - Obtener torneo específico
- `PUT /api/torneos/{id}/` - Actualizar torneo
- `DELETE /api/torneos/{id}/` - Eliminar torneo

### Participantes
- `GET /api/torneos/{torneo_id}/participantes/` - Listar participantes
- `POST /api/torneos/{torneo_id}/participantes/` - Agregar participante

### Luchas
- `GET /api/torneos/{torneo_id}/luchas/` - Listar luchas
- `POST /api/torneos/{torneo_id}/luchas/` - Crear lucha
- `PUT /api/luchas/{lucha_id}/puntuacion/` - Actualizar puntuación
- `POST /api/luchas/{lucha_id}/finalizar/` - Finalizar lucha

## 🎮 Cómo Usar el Sistema

### 1. Acceder como Administrador
1. Ir a http://localhost:5173
2. Hacer doble click en el logo de The Badgers
3. Ingresar credenciales de administrador
4. Aparecerá la opción "Torneo BJJ" en la navbar

### 2. Crear un Nuevo Torneo
1. Hacer clic en "Nuevo Torneo"
2. Completar información básica
3. Agregar categorías con cinturones y pesos
4. Guardar el torneo

### 3. Gestionar Participantes
1. Seleccionar un torneo
2. Ir a "Participantes"
3. Agregar participantes con nombre, cinturón, academia y peso
4. El sistema asigna automáticamente la categoría sugerida

### 4. Gestionar Luchas
1. Ir a "Gestionar Luchas"
2. Ver todas las luchas del torneo
3. Hacer clic en "Gestionar" para abrir el panel de puntuación
4. Usar botones + y - para registrar movimientos BJJ
5. Finalizar lucha con victoria por puntos o sumisión

## 🏆 Sistema de Puntuación BJJ

### Movimientos y Puntos
- **Montada**: 4 puntos
- **Guarda Pasada**: 3 puntos
- **Rodillazo**: 2 puntos
- **Derribo**: 2 puntos

### Sistema de Ventajas y Penalizaciones
- **Ventajas**: Situaciones de control sin puntos completos
- **Penalizaciones**: Infracciones que restan puntos

### Criterios de Victoria
1. **Por Puntos**: Mayor puntuación al final
2. **Por Ventajas**: Si empate en puntos
3. **Por Penalizaciones**: Menos penalizaciones si empate
4. **Por Sumisión**: Finalización técnica

## 🔧 Comandos Útiles

```bash
# Gestionar MongoDB
docker-compose up -d          # Iniciar MongoDB
docker-compose down           # Detener MongoDB
docker-compose logs mongodb   # Ver logs de MongoDB

# Gestionar aplicación
cd backend && python3 manage.py shell  # Shell Django
cd frontend && npm run build          # Build producción

# Ver estado de procesos
ps aux | grep -E "(python|node|mongo)" | grep -v grep
```

## 📞 Soporte

Para problemas o preguntas:
1. Verificar logs de MongoDB: `docker-compose logs mongodb`
2. Verificar logs del backend: Revisar terminal del servidor Django
3. Verificar conectividad: `curl http://localhost:8000/api/torneos/`

## 🎯 Próximas Mejoras Planificadas

- [ ] Sistema de cronómetro avanzado para luchas
- [ ] Generación automática de brackets
- [ ] Reportes y estadísticas detalladas
- [ ] Sistema de eliminación automática de BYEs
- [ ] Notificaciones en tiempo real
- [ ] Backup automático de base de datos

---

**¡El sistema está completamente funcional y listo para gestionar torneos BJJ profesionales! 🥋✨**
