from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0008_populate_default_categories'),
    ]

    operations = [
        migrations.CreateModel(
            name='Atleta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=200)),
                ('academia', models.CharField(blank=True, max_length=200)),
                ('cinturon_actual', models.CharField(blank=True, choices=[('blanca', 'Blanca'), ('azul', 'Azul'), ('violeta', 'Violeta'), ('marron', 'Marrón'), ('negro', 'Negro')], max_length=20)),
                ('activo', models.BooleanField(default=True)),
                ('fecha_alta', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['-fecha_alta']},
        ),
        migrations.AddField(
            model_name='participante',
            name='atleta',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='participaciones', to='core.atleta'),
        ),
        migrations.CreateModel(
            name='AtletaPunto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('origen', models.CharField(choices=[('categoria', 'Ganador de categoría'), ('lucha', 'Ganador de lucha'), ('bonus', 'Bonus manual')], max_length=20)),
                ('puntos', models.IntegerField(default=0)),
                ('detalle', models.CharField(blank=True, max_length=200)),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('atleta', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='puntos', to='core.atleta')),
                ('categoria', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='puntos', to='core.categoria')),
                ('torneo', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='puntos', to='core.torneo')),
            ],
            options={'ordering': ['-fecha']},
        ),
    ]


