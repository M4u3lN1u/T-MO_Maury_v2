from django.conf import settings
from django.db import models

class Proyecto(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='proyectos_tmo')
    fecha_registro = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.nombre

class Funcion(models.Model):
    nombre = models.CharField(max_length=60, unique=True)
    color = models.CharField(max_length=7, default='#244CA5')
    def __str__(self): return self.nombre

class Equipo(models.Model):
    nombre = models.CharField(max_length=100)
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='equipos')
    fecha_registro = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=['proyecto', 'nombre'], name='unico_equipo_proyecto')]
    def __str__(self): return self.nombre

class Integrante(models.Model):
    equipo = models.ForeignKey(Equipo, on_delete=models.CASCADE, related_name='integrantes')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='integraciones_tmo')
    funcion = models.ForeignKey(Funcion, on_delete=models.PROTECT)
    class Meta:
        constraints = [models.UniqueConstraint(fields=['equipo', 'usuario'], name='unico_integrante_equipo')]
