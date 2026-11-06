"""Configuración de T-MO reducido: Actividades, Equipos y Miembros, Minutas."""
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'solo-desarrollo-cambiar-en-produccion')
DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() == 'true'
ALLOWED_HOSTS = [s.strip() for s in os.getenv('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost').split(',') if s.strip()]
INSTALLED_APPS = [
    'django.contrib.auth', 'django.contrib.contenttypes', 'django.contrib.staticfiles',
    'rest_framework', 'corsheaders', 'drf_spectacular',
    'nucleo', 'equipos', 'actividades', 'minutas',
]
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'config.urls'
TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [],
              'APP_DIRS': True, 'OPTIONS': {'context_processors': ['django.template.context_processors.request']}}]
WSGI_APPLICATION = 'config.wsgi.application'
# SQLite facilita las pruebas en Windows sin Docker. Cambia DB_ENGINE=postgres para PostgreSQL 17.
if os.getenv('DB_ENGINE', 'sqlite') == 'postgres':
    DATABASES = {'default': {'ENGINE': 'django.db.backends.postgresql',
                             'NAME': os.getenv('DB_NAME', 'tmo_modulos'),
                             'USER': os.getenv('DB_USER', 'tmo'),
                             'PASSWORD': os.getenv('DB_PASSWORD', ''),
                             'HOST': os.getenv('DB_HOST', '127.0.0.1'),
                             'PORT': os.getenv('DB_PORT', '5433')}}
else:
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
]
PASSWORD_HASHERS = ['django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
                    'django.contrib.auth.hashers.PBKDF2PasswordHasher']
LANGUAGE_CODE = 'es-mx'
TIME_ZONE = 'America/Tijuana'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': None,
}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
SPECTACULAR_SETTINGS = {'TITLE': 'T-MO · Actividades, Equipos y Minutas', 'VERSION': '1.0.0',
                        'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny']}
CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
