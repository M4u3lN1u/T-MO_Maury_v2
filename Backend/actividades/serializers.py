from rest_framework import serializers
from equipos.models import Integrante
from .models import Actividad, Entregable, ComentarioActividad

class EntregableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entregable
        fields = ['id', 'nombre', 'url', 'archivo', 'usuario', 'fecha_registro']

class ComentarioSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    class Meta:
        model = ComentarioActividad
        fields = ['id', 'usuario', 'usuario_nombre', 'contenido', 'fecha_registro']

class ActividadSerializer(serializers.ModelSerializer):
    entregables = EntregableSerializer(many=True, read_only=True)
    comentarios = serializers.IntegerField(source='comentarios.count', read_only=True)
    responsable_nombre = serializers.CharField(source='responsable.get_full_name', read_only=True)
    class Meta:
        model = Actividad
        fields = ['id', 'titulo', 'descripcion', 'fecha_inicio', 'fecha_limite', 'fecha_terminada',
                  'fecha_registro', 'estado', 'prioridad', 'responsable', 'responsable_nombre',
                  'creado_por', 'proyecto', 'funcion', 'entregables', 'comentarios']
        read_only_fields = ['id', 'fecha_terminada', 'fecha_registro', 'creado_por', 'estado']
    def validate(self, attrs):
        proyecto = attrs.get('proyecto', getattr(self.instance, 'proyecto', None))
        responsable = attrs.get('responsable', getattr(self.instance, 'responsable', None))
        ini = attrs.get('fecha_inicio', getattr(self.instance, 'fecha_inicio', None))
        fin = attrs.get('fecha_limite', getattr(self.instance, 'fecha_limite', None))
        if ini and fin and fin < ini:
            raise serializers.ValidationError({'fecha_limite': 'La fecha límite debe ser posterior al inicio.'})
        if proyecto and responsable and not Integrante.objects.filter(equipo__proyecto=proyecto, usuario=responsable).exists():
            raise serializers.ValidationError({'responsable': 'Selecciona un integrante de este proyecto.'})
        if self.instance and proyecto != self.instance.proyecto:
            raise serializers.ValidationError({'proyecto': 'No se puede cambiar el proyecto.'})
        return attrs
