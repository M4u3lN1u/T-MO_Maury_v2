# T-MO | Actividades · Equipos y Miembros · Minutas

Versión reducida basada en el proyecto T-MO original y el SRS (versión 1.0, 24 de septiembre de 2026). Conserva la estructura visual de React/Vite, la barra lateral, el diseño de tarjetas, los estilos y el login.

## Ejecutar en Windows — dos opciones

**A.** Doble clic en `INICIAR_WINDOWS.bat`.

**B.** Abre CMD dentro de la carpeta que contiene `iniciar_proyecto.py` y ejecuta:

```cmd
py iniciar_proyecto.py
```

**Requisitos:** Python 3.12+ y Node.js compatible con Vite (Node 22.12+ es apropiado). La primera ejecución requiere Internet para descargar dependencias.

El iniciador crea `Backend/.env`, configura el entorno virtual, instala paquetes de Python y npm, genera migraciones, prepara SQLite, carga los datos de demostración y arranca Django y React. Deja abierta la terminal durante el uso.

- **Frontend:** http://localhost:5173
- **Backend/API:** http://localhost:8000/api/
- **Swagger:** http://localhost:8000/api/docs/
- **Cerrar:** `Ctrl + C` en CMD.

**Demo de desarrollo:** correo `elias@ut-tijuana.edu.mx`, contraseña `Demo1234`. Esta cuenta no se debe usar en producción.

## Módulos incluidos

1. **Actividades:** tablero Pendiente / En proceso / Terminada, prioridades, fechas, responsable único miembro del proyecto, estado editable por responsable o líder, entregables mediante archivos o URL y comentarios integrados.
2. **Equipos y miembros:** equipos por proyecto, altas y bajas de integrantes, especialidades/etiquetas, asignación de usuarios a varios equipos/proyectos y funciones independientes. El líder puede crear los usuarios y un proyecto mínimo como contexto de los módulos.
3. **Minutas:** creación, edición, eliminación, filtrado, comentarios, biblioteca de plantillas propias, editor de texto enriquecido o edición de archivos Word `.docx` y salida por impresión/PDF.

Solo aparecen estos tres módulos de negocio en el menú. Se mantienen servicios **técnicos mínimos** para autenticación JWT, usuarios y referencia a proyecto: no es un módulo separado de Gestión de Proyectos.

## Estructura

```text
TMO-Actividades-Equipos-Minutas/
├── Backend/
│   ├── config/                  ajustes y rutas Django
│   ├── nucleo/                  login, usuarios y datos de demo
│   ├── equipos/                 proyecto mínimo, equipos, miembros y funciones
│   ├── actividades/             actividades, comentarios, entregables URL
│   ├── minutas/                 minutas, comentarios, plantillas y Word
│   ├── requirements.txt
│   └── manage.py
├── Database/                     notas de esquema
├── Frontend/                     React + Vite, estilo original T-MO
├── INICIAR_WINDOWS.bat
├── iniciar_proyecto.py
└── README_INICIO_WINDOWS.md
```

## Usar PostgreSQL 17 en vez de SQLite

Opcional para acercarse a la tecnología de producción del SRS. Para probar en Windows no es obligatorio.

1. Instala/inicia Docker Desktop.
2. Ejecuta una vez el iniciador para crear `Backend/.env` y detén `Ctrl+C`.
3. Cambia `DB_ENGINE=sqlite` a `DB_ENGINE=postgres` en `Backend/.env`.
4. Inicia otra vez `py iniciar_proyecto.py`. Se levantará el contenedor PostgreSQL en el puerto **5433** (puedes modificar `DB_PORT` si está ocupado).

No copies archivos de base de datos ni credenciales reales al ZIP. Los datos SQLite y PostgreSQL son independientes.

## Endpoints principales

- `POST /api/auth/login/` y `POST /api/auth/refresh/`
- `/api/usuarios/` (altas por líder) y `/api/proyectos/` (contexto mínimo)
- `/api/funciones/`, `/api/equipos/`, `/api/equipos/{id}/integrantes/`
- `/api/actividades/`, `/api/actividades/{id}/estado/`, `/api/actividades/{id}/entregables/` y `/api/actividades/{id}/comentarios/`
- `/api/plantillas/`, `/api/minutas/`, `/api/minutas/{id}/comentarios/` y `POST /api/archivos/`

Las rutas completas, métodos y cuerpos están descritos en `http://localhost:8000/api/docs/` cuando el backend se ejecuta.

## Alcance y límites

Esta es una versión de trabajo para entorno local, no un despliegue de producción. Los archivos adjuntos a actividades admiten PDF, DOCX, XLSX, imágenes, TXT o CSV de hasta 10 MB. El editor Word se basa en SuperDoc, dependiente de la instalación npm y compatible con `.docx`. El PDF se obtiene mediante imprimir/guardar como PDF del navegador. Se mantuvo el diseño del proyecto original, aunque su paleta visual difiere ligeramente de los códigos de color escritos en el SRS.

No se incluyen calendario, dashboard, reportes, presupuestos, incidentes, notificaciones, analítica ni agente inteligente.
