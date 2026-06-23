@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

if not exist "dist\index.html" (
  echo Falta el build de produccion.
  echo Ejecuta make-release.bat en la PC de armado o copia la carpeta dist junto con este instalador.
  goto :fail
)

if not exist ".env.production" (
  echo Falta el archivo .env.production.
  echo Completa .env.production antes de continuar.
  goto :fail
)

if not exist "node-runtime\node.exe" (
  echo Falta el runtime portable de Node.
  echo Volve a generar el release con make-release.bat.
  goto :fail
)

if not exist "node_modules\" (
  echo Falta la carpeta node_modules.
  echo El release no esta completo.
  goto :fail
)

echo Iniciando AlfaEditorScan en modo produccion...
set "NODE_ENV=production"
echo Abrir en el navegador: http://127.0.0.1:%SQL_API_PORT%/
echo.
node-runtime\node.exe server\sql-api.mjs
set "EXIT_CODE=%errorlevel%"
echo.
if not "%EXIT_CODE%"=="0" (
  echo El servidor termino con codigo %EXIT_CODE%.
  echo Revisa el mensaje anterior para ver la causa.
  goto :fail
)

pause
exit /b 0

endlocal

:fail
echo.
pause
exit /b 1
