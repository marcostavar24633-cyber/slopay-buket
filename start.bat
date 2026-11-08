@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo === npm install ===
call npm install

echo.
echo Запуск dev-сервера через 5 секунд...
timeout /t 5 /nobreak >nul

echo === npm run dev ===
call npm run dev

pause
