@echo off
cd /d "%~dp0"
if exist "%~dp0..\SoftwareEngineerPortfolio\OfflineStyleStudio\runtime\node.exe" (
  "%~dp0..\SoftwareEngineerPortfolio\OfflineStyleStudio\runtime\node.exe" "%~dp0server.cjs" --open
) else (
  node "%~dp0server.cjs" --open
)
if errorlevel 1 pause
