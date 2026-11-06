@echo off
setlocal
cd /d "%~dp0"
echo =========================================
echo      T-MO - Tres modulos del SRS
echo      Actividades, Equipos, Minutas
echo =========================================
where py >nul 2>nul
if errorlevel 1 (
    echo ERROR: Instala Python 3.12 o superior.
    pause
    exit /b 1
)
py iniciar_proyecto.py
if errorlevel 1 (
    echo.
    echo El proyecto no pudo iniciar. Revisa el error indicado arriba.
    pause
    exit /b 1
)
pause
