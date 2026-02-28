#!/bin/bash

echo "🚀 Deploying BYD Queue System to Production"
echo "============================================"
echo ""

# Navigate to web app directory
cd apps/web

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️  Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🔥 Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment successful!"
        echo ""
        echo "🌐 Your app is live at:"
        echo "   https://testdrive-17e53.web.app"
        echo "   https://testdrive-17e53.firebaseapp.com"
        echo ""
    else
        echo ""
        echo "❌ Firebase deployment failed!"
        exit 1
    fi
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
