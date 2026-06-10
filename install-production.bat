@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

if not exist "dist\index.html" (
  echo Falta el build de produccion.
  echo Ejecuta make-release.bat en la PC de armado o copia la carpeta dist junto con este instalador.
  exit /b 1
)

if not exist ".env.production" (
  echo Falta el archivo .env.production.
  echo Completa .env.production antes de continuar.
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js no esta instalado.
  echo Instala Node.js 18 o superior y vuelve a ejecutar este archivo.
  exit /b 1
)

if not exist "node_modules\" (
  echo Instalando dependencias de produccion...
  call npm ci --omit=dev --no-audit --no-fund
  if errorlevel 1 (
    echo No se pudieron instalar las dependencias.
    exit /b 1
  )
)

echo Iniciando AlfaEditorScan en modo produccion...
set "NODE_ENV=production"
node server\sql-api.mjs

endlocal
