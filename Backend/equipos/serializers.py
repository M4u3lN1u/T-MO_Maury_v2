from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Proyecto, Equipo, Funcion, Integrante

class ProyectoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proyecto
        fields = ['id', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'creado_por']
        read_only_fields = ['id', 'creado_por']
    def validate(self, data):
        ini = data.get('fecha_inicio', getattr(self.instance, 'fecha_inicio', None))
        fin = data.get('fecha_fin', getattr(self.instance, 'fecha_fin', None))
        if ini and fin and fin < ini:
            raise serializers.ValidationError({'fecha_fin': 'Debe ser posterior al inicio.'})
        return data

class FuncionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Funcion
        fields = ['id', 'nombre', 'color']

class IntegranteSerializer(serializers.ModelSerializer):
    usuario_id = serializers.IntegerField(source='usuario.id', read_only=True)
    usuario = serializers.CharField(source='usuario.get_full_name', read_only=True)
    correo = serializers.CharField(source='usuario.email', read_only=True)
    funcion = serializers.CharField(source='funcion.nombre', read_only=True)
    funcion_id = serializers.IntegerField(source='funcion.id', read_only=True)
    funcion_color = serializers.CharField(source='funcion.color', read_only=True)
    class Meta:
        model = Integrante
        fields = ['usuario_id', 'usuario', 'correo', 'funcion', 'funcion_id', 'funcion_color']

class EquipoSerializer(serializers.ModelSerializer):
    integrantes = IntegranteSerializer(many=True, read_only=True)
    class Meta:
        model = Equipo
        fields = ['id', 'nombre', 'proyecto', 'fecha_registro', 'integrantes']
        read_only_fields = ['id', 'fecha_registro']

class AgregarIntegranteSerializer(serializers.Serializer):
    usuario = serializers.PrimaryKeyRelatedField(queryset=get_user_model().objects.filter(is_active=True))
    funcion = serializers.PrimaryKeyRelatedField(queryset=Funcion.objects.all())
