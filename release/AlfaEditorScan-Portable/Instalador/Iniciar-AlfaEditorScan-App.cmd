@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%.." >nul
set "ROOT_DIR=%CD%"
set "RELEASE_DIR=%ROOT_DIR%\release\AlfaEditorScan-Portable"

call "%SCRIPT_DIR%Instalar-AlfaEditorScan.cmd"
if errorlevel 1 (
  popd >nul
  exit /b 1
)

if not exist "%RELEASE_DIR%\dist\index.html" (
  echo No se encontro el build instalado en "%RELEASE_DIR%".
  popd >nul
  pause
  exit /b 1
)

set "SQL_API_PORT=3001"
if exist "%RELEASE_DIR%\.env.production" (
  for /f "usebackq tokens=1,* delims==" %%A in ("%RELEASE_DIR%\.env.production") do (
    if /I "%%A"=="SQL_API_PORT" set "SQL_API_PORT=%%B"
  )
)

set "APP_URL=http://127.0.0.1:%SQL_API_PORT%/"
set "HEALTH_URL=http://127.0.0.1:%SQL_API_PORT%/api/health"
set "NODE_EXE=%RELEASE_DIR%\node-runtime\node.exe"
set "SERVER_ENTRY=%RELEASE_DIR%\server\sql-api.mjs"
set "APP_PROFILE_DIR=%LOCALAPPDATA%\AlfaEditorScan\AppProfile"
set "PS_HEALTH=try { $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 $env:HEALTH_URL; if ($r.StatusCode -ge 200) { Write-Output 1 } else { Write-Output 0 } } catch { Write-Output 0 }"

set "NODE_ENV=production"

for /f %%I in ('powershell -NoProfile -Command "%PS_HEALTH%"') do set "SERVER_ALREADY_RUNNING=%%I"

if not "%SERVER_ALREADY_RUNNING%"=="1" (
  if not exist "%NODE_EXE%" (
    echo Falta el runtime portable de Node en "%NODE_EXE%".
    popd >nul
    pause
    exit /b 1
  )

  echo Iniciando servidor en segundo plano...
  powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath '%NODE_EXE%' -ArgumentList 'server\sql-api.mjs' -WorkingDirectory '%RELEASE_DIR%' -WindowStyle Hidden"
)

echo Esperando que AlfaEditorScan responda...
set "READY=0"
for /l %%N in (1,1,60) do (
  for /f %%I in ('powershell -NoProfile -Command "%PS_HEALTH%"') do set "READY=%%I"
  if "!READY!"=="1" goto :launch_app
  timeout /t 1 /nobreak >nul
)

echo.
echo No se pudo validar que el servidor haya iniciado.
popd >nul
pause
exit /b 1

:launch_app
echo Abriendo en modo app...

set "EDGE_EXE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined EDGE_EXE if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined EDGE_EXE if exist "%LocalAppData%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%LocalAppData%\Microsoft\Edge\Application\msedge.exe"

set "CHROME_EXE="
if not defined EDGE_EXE if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined EDGE_EXE if not defined CHROME_EXE if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined EDGE_EXE if not defined CHROME_EXE if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if defined EDGE_EXE (
  powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath '%EDGE_EXE%' -ArgumentList @('--app=%APP_URL%', '--user-data-dir=%APP_PROFILE_DIR%', '--no-first-run', '--no-default-browser-check')"
) else if defined CHROME_EXE (
  powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath '%CHROME_EXE%' -ArgumentList @('--app=%APP_URL%', '--user-data-dir=%APP_PROFILE_DIR%', '--no-first-run', '--no-default-browser-check')"
) else (
  echo No se encontro Edge ni Chrome. Se abrira el navegador por defecto.
  start "" "%APP_URL%"
)

popd >nul
exit /b 0
