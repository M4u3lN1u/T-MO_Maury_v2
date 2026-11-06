# Cómo abrir T-MO en tu PC (Windows)

## Primera ejecución

1. Descarga el ZIP y elige **Extraer todo**.
2. Abre la carpeta **TMO-Actividades-Equipos-Minutas**. Debes ver `Backend`, `Frontend`, `Database` e `INICIAR_WINDOWS.bat`.
3. Confirma que tengas Python y Node.js. En CMD: `py --version` y `node --version`.
4. Haz **doble clic en `INICIAR_WINDOWS.bat`**. También puedes hacer clic en la barra de direcciones del Explorador, escribir `cmd`, presionar Enter y poner `py iniciar_proyecto.py`.
5. En la primera ejecución, la terminal instala dependencias por Internet, prepara la base local y muestra los mensajes de los servidores. **No cierres esa terminal**.
6. Entra a **http://localhost:5173** en Chrome o Edge.
7. Inicia sesión con `elias@ut-tijuana.edu.mx` y `Demo1234`.

## Siguientes ejecuciones

Abre la misma carpeta y ejecuta de nuevo `INICIAR_WINDOWS.bat`. No es necesario reinstalar nada (el iniciador comprueba el entorno).

## Si aparece un error

- **`py` no se reconoce:** instala Python 3.12+ y reinicia CMD.
- **`npm` no se reconoce:** instala Node.js 22 LTS y reinicia CMD.
- **`Connection refused` o la web muestra error API:** confirma que la consola siga abierta y que `http://localhost:8000/api/docs/` responda.
- **Puerto 8000 o 5173 ocupado:** cierra el otro proceso que utiliza ese puerto, o cambia los puertos de manera coordinada en el script, Django y Vite.
- **Las dependencias no descargan:** conecta Internet y vuelve a ejecutar.
- **No se ve la página:** prueba `http://localhost:5173` exactamente; `localhost:8000` es la API, no la interfaz.

Para detener T-MO, presiona **Ctrl+C** en la terminal.

## Qué puedes probar

- **Actividades:** entra, abre una tarjeta, cambia estado o publica un comentario.
- **Equipos y miembros:** crea un equipo o incorpora usuarios y funciones con la cuenta líder.
- **Minutas:** abre una minuta, crea otra, edita texto o importa un `.docx`; también puedes gestionar plantillas.

**Nota:** la cuenta de demostración y SQLite son solo para pruebas locales.
