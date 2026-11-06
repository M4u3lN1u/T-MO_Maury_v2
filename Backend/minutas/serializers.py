import bleach
from rest_framework import serializers
from .models import Plantilla, Minuta, ComentarioMinuta

ETIQUETAS = ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'div', 'span']
def limpiar(html):
    return bleach.clean(html or '', tags=ETIQUETAS, attributes={}, strip=True)

class PlantillaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plantilla
        fields = ['id', 'nombre', 'equipo', 'contenido_html', 'archivo', 'creado_por', 'fecha_registro']
        read_only_fields = ['id', 'creado_por', 'fecha_registro']
    def validate(self, attrs):
        contenido = attrs.get('contenido_html', getattr(self.instance, 'contenido_html', ''))
        archivo = attrs.get('archivo', getattr(self.instance, 'archivo', ''))
        if not contenido.strip() and not archivo: raise serializers.ValidationError({'contenido_html': 'Escribe contenido o sube un Word.'})
        if archivo and not archivo.startswith('/media/documentos/'):
            raise serializers.ValidationError({'archivo': 'Sube el archivo desde la aplicación.'})
        attrs['contenido_html'] = limpiar(contenido)
        return attrs

class MinutaSerializer(serializers.ModelSerializer):
    equipo_nombre = serializers.CharField(source='equipo.nombre', read_only=True)
    creado_por_nombre = serializers.CharField(source='creado_por.get_full_name', read_only=True)
    comentarios = serializers.IntegerField(source='comentarios.count', read_only=True)
    class Meta:
        model = Minuta
        fields = ['id', 'nombre', 'descripcion', 'equipo', 'equipo_nombre', 'plantilla', 'contenido_html',
                  'archivo', 'fecha_inicio', 'fecha_registro', 'creado_por', 'creado_por_nombre', 'comentarios']
        read_only_fields = ['id', 'fecha_registro', 'creado_por']
    def validate(self, attrs):
        contenido = attrs.get('contenido_html', getattr(self.instance, 'contenido_html', ''))
        archivo = attrs.get('archivo', getattr(self.instance, 'archivo', ''))
        if archivo and not archivo.startswith('/media/documentos/'):
            raise serializers.ValidationError({'archivo': 'Sube el Word desde el editor.'})
        attrs['contenido_html'] = limpiar(contenido)
        equipo = attrs.get('equipo', getattr(self.instance, 'equipo', None))
        plantilla = attrs.get('plantilla', getattr(self.instance, 'plantilla', None))
        if plantilla and plantilla.equipo_id and plantilla.equipo_id != equipo.id:
            raise serializers.ValidationError({'plantilla': 'La plantilla pertenece a otro equipo.'})
        return attrs

class ComentarioSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    class Meta:
        model = ComentarioMinuta
        fields = ['id', 'usuario', 'usuario_nombre', 'contenido', 'fecha_registro']
