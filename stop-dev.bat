@echo off
setlocal

echo Cerrando servidores de desarrollo de AlfaEditorScan...

for %%P in (5173 3001) do (
  for /f "tokens=5" %%I in ('netstat -aon ^| findstr /R /C:":%%P .*LISTENING"') do (
    echo Deteniendo PID %%I en puerto %%P
    taskkill /PID %%I /F >nul 2>&1
  )
)

echo Listo.
endlocal
