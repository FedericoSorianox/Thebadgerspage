# Generated manually to remove tournament system

from django.db import migrations, models
import django.db.models.deletion


def create_default_categories(apps, schema_editor):
    """Crear categorías por defecto al eliminar el sistema de torneos"""
    Categoria = apps.get_model('core', 'Categoria')
    
    # Definir las categorías fijas
    categorias_fijas = [
        # Principiante GI
        ('Principiante GI - Hasta 70kg', 'principiante_gi', None, 70.0),
        ('Principiante GI - Hasta 80kg', 'principiante_gi', 70.1, 80.0),
        ('Principiante GI - Más de 80kg', 'principiante_gi', 80.1, None),
        
        # Intermedio GI
        ('Intermedio GI - Hasta 70kg', 'intermedio_gi', None, 70.0),
        ('Intermedio GI - Hasta 80kg', 'intermedio_gi', 70.1, 80.0),
        ('Intermedio GI - Más de 80kg', 'intermedio_gi', 80.1, None),
        
        # Avanzado GI
        ('Avanzado GI - Hasta 70kg', 'avanzado_gi', None, 70.0),
        ('Avanzado GI - Hasta 80kg', 'avanzado_gi', 70.1, 80.0),
        ('Avanzado GI - Más de 80kg', 'avanzado_gi', 80.1, None),
        
        # Principiante No GI
        ('Principiante No GI - Hasta 70kg', 'principiante_nogi', None, 70.0),
        ('Principiante No GI - Hasta 80kg', 'principiante_nogi', 70.1, 80.0),
        ('Principiante No GI - Más de 80kg', 'principiante_nogi', 80.1, None),
        
        # Intermedio No GI
        ('Intermedio No GI - Hasta 70kg', 'intermedio_nogi', None, 70.0),
        ('Intermedio No GI - Hasta 80kg', 'intermedio_nogi', 70.1, 80.0),
        ('Intermedio No GI - Más de 80kg', 'intermedio_nogi', 80.1, None),
        
        # Avanzado No GI
        ('Avanzado No GI - Hasta 70kg', 'avanzado_nogi', None, 70.0),
        ('Avanzado No GI - Hasta 80kg', 'avanzado_nogi', 70.1, 80.0),
        ('Avanzado No GI - Más de 80kg', 'avanzado_nogi', 80.1, None),
        
        # Por cinturones
        ('Blanca - Hasta 70kg', 'blanca', None, 70.0),
        ('Blanca - Hasta 80kg', 'blanca', 70.1, 80.0),
        ('Blanca - Más de 80kg', 'blanca', 80.1, None),
        
        ('Azul - Hasta 70kg', 'azul', None, 70.0),
        ('Azul - Hasta 80kg', 'azul', 70.1, 80.0),
        ('Azul - Más de 80kg', 'azul', 80.1, None),
        
        ('Violeta - Hasta 70kg', 'violeta', None, 70.0),
        ('Violeta - Hasta 80kg', 'violeta', 70.1, 80.0),
        ('Violeta - Más de 80kg', 'violeta', 80.1, None),
        
        ('Marrón - Hasta 70kg', 'marron', None, 70.0),
        ('Marrón - Hasta 80kg', 'marron', 70.1, 80.0),
        ('Marrón - Más de 80kg', 'marron', 80.1, None),
        
        ('Negro - Hasta 70kg', 'negro', None, 70.0),
        ('Negro - Hasta 80kg', 'negro', 70.1, 80.0),
        ('Negro - Más de 80kg', 'negro', 80.1, None),
    ]
    
    for nombre, tipo_categoria, peso_min, peso_max in categorias_fijas:
        Categoria.objects.get_or_create(
            nombre=nombre,
            defaults={
                'tipo_categoria': tipo_categoria,
                'peso_minimo': peso_min,
                'peso_maximo': peso_max,
                'estado': 'abierta'
            }
        )


def migrate_participants_to_categories(apps, schema_editor):
    """Migrar participantes existentes a categorías apropiadas"""
    Participante = apps.get_model('core', 'Participante')
    Categoria = apps.get_model('core', 'Categoria')
    
    # Para cada participante existente, asignarlo a una categoría apropiada
    for participante in Participante.objects.all():
        if participante.peso:
            # Determinar rango de peso
            if participante.peso <= 70.0:
                sufijo_peso = " - Hasta 70kg"
            elif participante.peso <= 80.0:
                sufijo_peso = " - Hasta 80kg" 
            else:
                sufijo_peso = " - Más de 80kg"
            
            # Buscar categoría por cinturón
            nombre_categoria = f"{participante.get_cinturon_display()}{sufijo_peso}"
            
            try:
                categoria = Categoria.objects.get(nombre=nombre_categoria)
                participante.categoria_asignada = categoria
                participante.save()
            except Categoria.DoesNotExist:
                # Si no existe la categoría, crear una genérica
                categoria, _ = Categoria.objects.get_or_create(
                    nombre=f"{participante.get_cinturon_display()} - Libre",
                    defaults={
                        'tipo_categoria': participante.cinturon,
                        'estado': 'abierta'
                    }
                )
                participante.categoria_asignada = categoria
                participante.save()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_link_existing_participants_to_atleta'),
    ]

    operations = [
        # 1. Primero migrar datos existentes
        migrations.RunPython(migrate_participants_to_categories),
        
        # 2. Eliminar campos relacionados con torneo de AtletaPunto
        migrations.RemoveField(
            model_name='atletapunto',
            name='torneo',
        ),
        
        # 3. Eliminar campo torneo de Participante
        migrations.RemoveField(
            model_name='participante',
            name='torneo',
        ),
        
        # 4. Eliminar campo torneo de Categoria
        migrations.RemoveField(
            model_name='categoria',
            name='torneo',
        ),
        
        # 5. Eliminar el modelo Torneo completamente
        migrations.DeleteModel(
            name='Torneo',
        ),
        
        # 6. Crear categorías por defecto
        migrations.RunPython(create_default_categories),
    ]
