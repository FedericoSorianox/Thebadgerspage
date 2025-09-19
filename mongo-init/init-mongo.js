// Script de inicialización para MongoDB - The Badgers Page

// Crear usuario para la aplicación thebadgerspage
db.createUser({
  user: 'admin',
  pwd: 'password123',
  roles: [
    {
      role: 'readWrite',
      db: 'thebadgerspage_db'
    }
  ]
});

// Cambiar a la base de datos específica de thebadgerspage
db = db.getSiblingDB('thebadgerspage_db');

// Crear colecciones específicas para thebadgerspage
db.createCollection('galeria');
db.createCollection('categorias');
db.createCollection('participantes');
db.createCollection('torneos');
db.createCollection('atletas');
db.createCollection('auth_user');  // Para Django auth

// Crear índices para mejor rendimiento
db.galeria.createIndex({ "fecha_subida": 1 });
db.galeria.createIndex({ "categoria": 1 });
db.categorias.createIndex({ "nombre": 1 });
db.participantes.createIndex({ "categoria_id": 1 });
db.torneos.createIndex({ "fecha": 1 });
db.torneos.createIndex({ "estado": 1 });
db.atletas.createIndex({ "cinturon": 1 });
db.atletas.createIndex({ "genero": 1 });

// Insertar algunos datos de ejemplo para thebadgerspage
db.categorias.insertMany([
  {
    nombre: "Blanca",
    cinturon: "blanca",
    genero: "masculino",
    peso_minimo: null,
    peso_maximo: 70,
    descripcion: "Categoría blanca masculina hasta 70kg"
  },
  {
    nombre: "Azul",
    cinturon: "azul",
    genero: "femenino",
    peso_minimo: null,
    peso_maximo: 60,
    descripcion: "Categoría azul femenina hasta 60kg"
  }
]);

db.galeria.insertOne({
  titulo: "Foto de ejemplo",
  descripcion: "Primera foto de la galería de The Badgers",
  imagen_url: "/media/galeria/ejemplo.jpg",
  categoria: "torneos",
  fecha_subida: new Date(),
  es_publica: true
});

print("✅ Base de datos MongoDB inicializada correctamente para The Badgers Page (thebadgerspage_db)");
