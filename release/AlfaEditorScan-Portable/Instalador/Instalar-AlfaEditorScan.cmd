@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%.." >nul
set "ROOT_DIR=%CD%"
set "RELEASE_DIR=%ROOT_DIR%\release\AlfaEditorScan-Portable"

set "NEEDS_INSTALL=0"
if not exist "%RELEASE_DIR%\dist\index.html" set "NEEDS_INSTALL=1"
if not exist "%RELEASE_DIR%\node-runtime\node.exe" set "NEEDS_INSTALL=1"
if not exist "%RELEASE_DIR%\node_modules\" set "NEEDS_INSTALL=1"
if not exist "%RELEASE_DIR%\.env.production" set "NEEDS_INSTALL=1"
if not exist "%RELEASE_DIR%\server\sql-api.mjs" set "NEEDS_INSTALL=1"

if "%NEEDS_INSTALL%"=="0" (
  echo AlfaEditorScan ya esta instalado.
  popd >nul
  exit /b 0
)

echo Instalando AlfaEditorScan...
call "%ROOT_DIR%\make-release.bat"
if errorlevel 1 (
  echo.
  echo No se pudo completar la instalacion.
  popd >nul
  pause
  exit /b 1
)

echo.
echo Instalacion completada.
popd >nul
exit /b 0
