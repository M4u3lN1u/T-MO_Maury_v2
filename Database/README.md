# Base de datos T-MO (tres módulos)

El esquema de **Equipos**, **Actividades** y **Minutas** es generado por las migraciones de Django en `Backend/`.

- **Prueba local fácil:** SQLite (`Backend/db.sqlite3`), por defecto. No requiere Docker.
- **PostgreSQL 17:** cambia `DB_ENGINE=postgres` en `Backend/.env` y utiliza `Backend/docker-compose.yml`.

No ejecutes los scripts SQL del repositorio completo anterior: incluían módulos ajenos a esta versión.
