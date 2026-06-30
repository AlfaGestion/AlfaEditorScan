@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

set "RELEASE_DIR=%~dp0release\AlfaEditorScan-Portable"
set "NODE_RUNTIME_DIR=%RELEASE_DIR%\node-runtime"

if not exist "dist\index.html" (
  echo Generando build de produccion...
  call npm run build
  if errorlevel 1 (
    echo No se pudo generar el build.
    exit /b 1
  )
)

if exist "%RELEASE_DIR%" (
  rmdir /s /q "%RELEASE_DIR%"
)

mkdir "%RELEASE_DIR%" >nul 2>nul
mkdir "%RELEASE_DIR%\dist" >nul 2>nul
mkdir "%RELEASE_DIR%\server" >nul 2>nul
mkdir "%NODE_RUNTIME_DIR%" >nul 2>nul
mkdir "%RELEASE_DIR%\Instalador" >nul 2>nul

copy /y "package.json" "%RELEASE_DIR%\" >nul
copy /y "package-lock.json" "%RELEASE_DIR%\" >nul
copy /y ".env.production" "%RELEASE_DIR%\" >nul
if exist "sql-connection.json" copy /y "sql-connection.json" "%RELEASE_DIR%\" >nul
copy /y "install-production.bat" "%RELEASE_DIR%\" >nul
copy /y "Instalador\LEEME-CLIENTE.txt" "%RELEASE_DIR%\" >nul
copy /y "Instalador\*.cmd" "%RELEASE_DIR%\Instalador\" >nul
copy /y "server\sql-api.mjs" "%RELEASE_DIR%\server\" >nul
xcopy /e /i /y "dist\*" "%RELEASE_DIR%\dist\" >nul

echo Instalando dependencias de produccion en el release...
pushd "%RELEASE_DIR%"
call npm ci --omit=dev --no-audit --no-fund >nul
if errorlevel 1 (
  echo No se pudieron instalar las dependencias de produccion.
  popd
  exit /b 1
)
popd

echo Copiando runtime de Node...
set "NODE_EXE="
for /f "delims=" %%I in ('node -p "process.execPath" 2^>nul') do (
  set "NODE_EXE=%%I"
  goto :node_found
)

:node_found
if not defined NODE_EXE (
  echo No se pudo detectar la instalacion local de Node.
  exit /b 1
)

for %%I in ("%NODE_EXE%") do set "NODE_SOURCE_DIR=%%~dpI"
copy /y "%NODE_EXE%" "%NODE_RUNTIME_DIR%\node.exe" >nul
if errorlevel 1 (
  echo No se pudo copiar el runtime de Node.
  exit /b 1
)

echo Release creada en:
echo %RELEASE_DIR%

endlocal
