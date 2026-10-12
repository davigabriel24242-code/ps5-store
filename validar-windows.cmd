@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale Node.js e execute novamente.
  exit /b 1
)
call node tools\refresh-catalog.mjs
if errorlevel 1 exit /b 1
call node tools\check-project.mjs %*
set "RESULT=%ERRORLEVEL%"
echo.
echo Validacao de arquivos concluida. Build nativo PS5 nao executado.
exit /b %RESULT%