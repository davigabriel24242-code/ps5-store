@echo off
setlocal
cd /d "%~dp0"
if not exist .checks mkdir .checks
call npx --yes esbuild apps/pipow-store/index.jsx --bundle --platform=neutral --external:react --external:@ps5-react/core --outfile=.checks/syntax.js
exit /b %ERRORLEVEL%
