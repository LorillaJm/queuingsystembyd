@echo off
echo 🚀 Deploying BYD Queue System to Production
echo ============================================
echo.

REM Navigate to web app directory
cd apps\web

echo 📦 Installing dependencies...
call npm install

echo.
echo 🏗️  Building for production...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ✅ Build successful!
    echo.
    echo 🔥 Deploying to Firebase Hosting...
    call firebase deploy --only hosting
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Deployment successful!
        echo.
        echo 🌐 Your app is live at:
        echo    https://testdrive-17e53.web.app
        echo    https://testdrive-17e53.firebaseapp.com
        echo.
    ) else (
        echo.
        echo ❌ Firebase deployment failed!
        exit /b 1
    )
) else (
    echo.
    echo ❌ Build failed!
    exit /b 1
)
