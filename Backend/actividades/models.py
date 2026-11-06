from django.conf import settings
from django.db import models
from django.db.models import F, Q

class Actividad(models.Model):
    ESTADOS = [('pendiente', 'Pendiente'), ('en_proceso', 'En proceso'), ('terminada', 'Terminada')]
    PRIORIDADES = [('baja', 'Baja'), ('media', 'Media'), ('alta', 'Alta'), ('urgente', 'Urgente')]
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    proyecto = models.ForeignKey('equipos.Proyecto', on_delete=models.CASCADE, related_name='actividades')
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='actividades_tmo')
    funcion = models.ForeignKey('equipos.Funcion', on_delete=models.PROTECT, null=True, blank=True)
    fecha_inicio = models.DateField()
    fecha_limite = models.DateField()
    fecha_terminada = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=12, choices=ESTADOS, default='pendiente')
    prioridad = models.CharField(max_length=8, choices=PRIORIDADES, default='media')
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='actividades_creadas_tmo')
    fecha_registro = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.CheckConstraint(condition=Q(fecha_limite__gte=F('fecha_inicio')), name='actividad_fechas_validas')]
    def __str__(self): return self.titulo

class Entregable(models.Model):
    actividad = models.ForeignKey(Actividad, on_delete=models.CASCADE, related_name='entregables')
    nombre = models.CharField(max_length=200)
    url = models.URLField(max_length=600, blank=True)
    archivo = models.FileField(upload_to='entregables/', blank=True, null=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    fecha_registro = models.DateTimeField(auto_now_add=True)

class ComentarioActividad(models.Model):
    actividad = models.ForeignKey(Actividad, on_delete=models.CASCADE, related_name='comentarios')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    contenido = models.TextField(max_length=3000)
    fecha_registro = models.DateTimeField(auto_now_add=True)
