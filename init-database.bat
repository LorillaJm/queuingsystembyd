@echo off
echo ========================================
echo BYD Test Drive Queue System
echo Database Initialization
echo ========================================
echo.

cd apps\api
node src\scripts\init-database.js

echo.
echo ========================================
echo Press any key to exit...
pause > nul
