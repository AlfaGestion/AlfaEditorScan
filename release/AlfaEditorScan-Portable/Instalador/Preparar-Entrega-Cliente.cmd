@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%.." >nul
set "ROOT_DIR=%CD%"
set "SOURCE_DIR=%ROOT_DIR%\release\AlfaEditorScan-Portable"
set "TARGET_DIR=%ROOT_DIR%\Instalador\Entrega-Cliente\AlfaEditorScan-Portable"

if not exist "%SOURCE_DIR%\dist\index.html" (
  echo Falta el release portable en "%SOURCE_DIR%".
  echo Genera el release primero con make-release.bat.
  popd >nul
  pause
  exit /b 1
)

if exist "%ROOT_DIR%\Instalador\Entrega-Cliente" (
  rmdir /s /q "%ROOT_DIR%\Instalador\Entrega-Cliente"
)

mkdir "%TARGET_DIR%" >nul 2>nul

robocopy "%SOURCE_DIR%" "%TARGET_DIR%" /E /NFL /NDL /NJH /NJS /NP >nul
set "ROBOCOPY_EXIT=%errorlevel%"
if %ROBOCOPY_EXIT% GEQ 8 (
  echo No se pudo preparar la entrega al cliente.
  popd >nul
  pause
  exit /b 1
)

copy /y "%SCRIPT_DIR%LEEME-CLIENTE.txt" "%ROOT_DIR%\Instalador\Entrega-Cliente\" >nul

echo Entrega del cliente preparada en:
echo %ROOT_DIR%\Instalador\Entrega-Cliente
popd >nul
exit /b 0
