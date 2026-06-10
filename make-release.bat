@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

set "RELEASE_DIR=%~dp0release\AlfaEditorScan-Portable"

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

copy /y "package.json" "%RELEASE_DIR%\" >nul
copy /y "package-lock.json" "%RELEASE_DIR%\" >nul
copy /y ".env.production" "%RELEASE_DIR%\" >nul
copy /y "install-production.bat" "%RELEASE_DIR%\" >nul
copy /y "server\sql-api.mjs" "%RELEASE_DIR%\server\" >nul
xcopy /e /i /y "dist\*" "%RELEASE_DIR%\dist\" >nul

echo Release creada en:
echo %RELEASE_DIR%

endlocal
