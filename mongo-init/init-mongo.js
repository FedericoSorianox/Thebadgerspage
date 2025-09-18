// Script de inicialización para MongoDB - The Badgers Torneos

// Crear usuario para la aplicación
db.createUser({
  user: 'thebadgers_user',
  pwd: 'badgers_password_2025',
  roles: [
    {
      role: 'readWrite',
      db: 'thebadgers_torneos'
    }
  ]
});

// Cambiar a la base de datos de torneos
db = db.getSiblingDB('thebadgers_torneos');

// Crear colecciones
db.createCollection('torneos');
db.createCollection('participantes');
db.createCollection('luchas');

// Crear índices para mejor rendimiento
db.torneos.createIndex({ "fecha": 1 });
db.torneos.createIndex({ "estado": 1 });
db.participantes.createIndex({ "torneo_id": 1 });
db.participantes.createIndex({ "cinturon": 1 });
db.luchas.createIndex({ "torneo_id": 1 });
db.luchas.createIndex({ "categoria": 1 });

// Insertar algunos datos de ejemplo
db.torneos.insertOne({
  nombre: "Torneo Invierno 2025",
  fecha: new Date("2025-07-15"),
  descripcion: "Primer torneo interno de Brazilian Jiu Jitsu",
  estado: "en_progreso",
  categorias: [
    {
      id: 1,
      nombre: "Blanca - Hasta 70kg",
      tipo_categoria: "blanca",
      peso_minimo: null,
      peso_maximo: 70
    },
    {
      id: 2,
      nombre: "Azul - Hasta 80kg",
      tipo_categoria: "azul",
      peso_minimo: null,
      peso_maximo: 80
    }
  ],
  fecha_creacion: new Date(),
  fecha_actualizacion: new Date()
});

print("✅ Base de datos MongoDB inicializada correctamente para The Badgers Torneos");
