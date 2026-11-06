from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from nucleo.api import LiderEscribe

User = get_user_model()

def presentar(usuario):
    return {'id': usuario.id, 'correo': usuario.email, 'nombre_pila': usuario.first_name,
            'pri_ape': usuario.last_name, 'seg_ape': '', 'foto': None,
            'nombre_completo': f'{usuario.first_name} {usuario.last_name}'.strip(),
            'rol': 'lider' if usuario.is_staff else 'miembro',
            'estado': 'activo' if usuario.is_active else 'inactivo'}

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    correo = str(request.data.get('correo', '')).strip().lower()
    password = request.data.get('password', '')
    usuario = authenticate(request, username=correo, password=password)
    if not usuario or not usuario.is_active:
        return Response({'detail': 'Correo o contraseña incorrectos.'}, status=401)
    token = RefreshToken.for_user(usuario)
    return Response({'access': str(token.access_token), 'refresh': str(token), 'usuario': presentar(usuario)})

@api_view(['GET'])
def yo(request):
    return Response(presentar(request.user))

class UsuarioSerializer(serializers.ModelSerializer):
    nombre_pila = serializers.CharField(source='first_name')
    pri_ape = serializers.CharField(source='last_name')
    correo = serializers.EmailField(source='email')
    rol = serializers.SerializerMethodField()
    nombre_completo = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    class Meta:
        model = User
        fields = ['id', 'nombre_pila', 'pri_ape', 'correo', 'rol', 'nombre_completo', 'is_active', 'password']
        read_only_fields = ['id', 'rol', 'nombre_completo']
    def get_rol(self, obj): return 'lider' if obj.is_staff else 'miembro'
    def get_nombre_completo(self, obj): return obj.get_full_name()
    def validate_correo(self, value):
        if User.objects.filter(username__iexact=value).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError('Ya existe una cuenta con ese correo.')
        return value.lower()
    def create(self, validated_data):
        correo = validated_data.pop('email')
        password = validated_data.pop('password', '')
        if not password:
            raise serializers.ValidationError({'password': 'Introduce una contraseña.'})
        return User.objects.create_user(username=correo, email=correo, password=password, **validated_data)
    def update(self, instance, validated_data):
        if 'email' in validated_data:
            instance.username = validated_data['email']
        password = validated_data.pop('password', None)
        for field, value in validated_data.items(): setattr(instance, field, value)
        if password: instance.set_password(password)
        instance.save()
        return instance

class UsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer
    permission_classes = [LiderEscribe]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']
    def get_queryset(self):
        return User.objects.order_by('first_name', 'last_name')
