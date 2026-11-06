#!/usr/bin/env python3
"""Arranque sencillo para Windows/Linux, sin menú, sin Docker obligatorio."""
import os
import secrets
import shutil
import subprocess
import sys
import time
import venv
from pathlib import Path
ROOT = Path(__file__).resolve().parent
BACK = ROOT / 'Backend'
FRONT = ROOT / 'Frontend'
ENV = BACK / '.venv'
PYTHON = ENV / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')

def run(args, cwd):
    print('\n>', ' '.join(map(str, args)), flush=True)
    subprocess.run([str(x) for x in args], cwd=cwd, check=True)

def main():
    try:
        if not (BACK / '.env').exists():
            plantilla = (BACK / '.env.example').read_text(encoding='utf-8')
            plantilla = plantilla.replace('reemplazar-esta-clave-para-produccion', secrets.token_urlsafe(45))
            (BACK / '.env').write_text(plantilla, encoding='utf-8')
        if not ENV.exists():
            print('Creando entorno virtual...')
            venv.create(ENV, with_pip=True)
        run([PYTHON, '-m', 'pip', 'install', '-r', 'requirements.txt'], BACK)
        if not shutil.which('npm'):
            raise RuntimeError('No se encontró npm. Instala Node.js 22 LTS.')
        if not (FRONT / 'node_modules').exists():
            run([shutil.which('npm'), 'ci' if (FRONT / 'package-lock.json').exists() else 'install'], FRONT)
        if 'DB_ENGINE=postgres' in (BACK / '.env').read_text(encoding='utf-8'):
            if not shutil.which('docker'):
                raise RuntimeError('PostgreSQL requiere Docker Desktop abierto. O cambia DB_ENGINE=sqlite.')
            run(['docker', 'compose', 'up', '-d'], BACK)
        run([PYTHON, 'manage.py', 'makemigrations', 'equipos', 'actividades', 'minutas', '--noinput'], BACK)
        run([PYTHON, 'manage.py', 'migrate', '--noinput'], BACK)
        run([PYTHON, 'manage.py', 'check'], BACK)
        run([PYTHON, 'manage.py', 'cargar_demo'], BACK)
        print('\n' + '='*55 + '\n  T-MO listo: http://localhost:5173\n  API: http://localhost:8000/api/docs/\n  Usuario demo: elias@ut-tijuana.edu.mx / Demo1234\n  Ctrl+C para detener los servidores\n' + '='*55, flush=True)
        npm = shutil.which('npm')
        front_cmd = ['cmd', '/c', npm, 'run', 'dev', '--', '--host', '127.0.0.1'] if os.name == 'nt' else [npm, 'run', 'dev', '--', '--host', '127.0.0.1']
        servidores = [
            subprocess.Popen([str(PYTHON), 'manage.py', 'runserver', '127.0.0.1:8000', '--noreload'], cwd=BACK),
            subprocess.Popen(front_cmd, cwd=FRONT),
        ]
        try:
            while all(p.poll() is None for p in servidores):
                time.sleep(0.5)
            print('Uno de los servidores se cerró. Revisa los mensajes anteriores.', file=sys.stderr)
        except KeyboardInterrupt:
            print('\nDeteniendo T-MO...')
        finally:
            for proceso in servidores:
                if proceso.poll() is None:
                    proceso.terminate()
            for proceso in servidores:
                try: proceso.wait(timeout=5)
                except subprocess.TimeoutExpired: proceso.kill()
    except (subprocess.CalledProcessError, OSError, RuntimeError) as exc:
        print(f'\nERROR: {exc}\nCorrige el mensaje de arriba y vuelve a ejecutar.', file=sys.stderr)
        sys.exit(1)
if __name__ == '__main__': main()
