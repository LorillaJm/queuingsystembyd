# Build Downloadable Apps Guide

This guide shows how to convert your web app into downloadable desktop and mobile applications.

## Options Overview

### 1. Desktop Apps (Windows, Mac, Linux)
- **Electron** - Most popular, full Node.js access
- **Tauri** - Smaller size, more secure, Rust-based

### 2. Mobile Apps (Android, iOS)
- **Capacitor** - Official Ionic framework, easy to use
- **Cordova** - Older but stable

### 3. Progressive Web App (PWA)
- Installable from browser
- Works offline
- No app store needed

## Recommended Approach: Capacitor + Electron

We'll use:
- **Capacitor** for mobile (Android/iOS)
- **Electron** for desktop (Windows/Mac/Linux)
- Both use your existing SvelteKit build

---

## Part 1: Mobile Apps with Capacitor

### Step 1: Install Capacitor

```bash
cd apps/web
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

### Step 2: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- App name: `BYD Queue System`
- App ID: `com.byd.queuesystem`
- Web asset directory: `build`

### Step 3: Update package.json

Add these scripts:

```json
"scripts": {
  "build:mobile": "vite build && npx cap sync",
  "android": "npx cap open android",
  "ios": "npx cap open ios"
}
```

### Step 4: Add Platforms

```bash
# For Android
npx cap add android

# For iOS (Mac only)
npx cap add ios
```

### Step 5: Build and Run

```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync

# Open in Android Studio
npm run android

# Open in Xcode (Mac only)
npm run ios
```

### Step 6: Build APK/IPA

**Android:**
1. Open in Android Studio: `npm run android`
2. Build > Generate Signed Bundle/APK
3. Follow wizard to create release APK

**iOS:**
1. Open in Xcode: `npm run ios`
2. Product > Archive
3. Distribute to App Store or export IPA

---

## Part 2: Desktop Apps with Electron

### Step 1: Install Electron

```bash
cd apps/web
npm install --save-dev electron electron-builder
```

### Step 2: Create Electron Main File

Create `electron/main.js`:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../build/favicon.png')
  });

  // Load the built SvelteKit app
  win.loadFile(path.join(__dirname, '../build/index.html'));
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Step 3: Update package.json

Add these configurations:

```json
{
  "main": "electron/main.js",
  "scripts": {
    "electron": "electron .",
    "electron:dev": "npm run build && electron .",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.byd.queuesystem",
    "productName": "BYD Queue System",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "build/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/favicon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "build/favicon.icns"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "build/favicon.png"
    }
  }
}
```

### Step 4: Build Desktop Apps

```bash
# Build for current platform
npm run electron:build

# Build for specific platforms
npx electron-builder --win
npx electron-builder --mac
npx electron-builder --linux
```

Output will be in `dist-electron/` folder.

---

## Part 3: Progressive Web App (PWA)

### Step 1: Install PWA Plugin

```bash
npm install @vite-pwa/sveltekit -D
```

### Step 2: Configure Vite

Update `vite.config.js`:

```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default {
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BYD Queue System',
        short_name: 'BYD Queue',
        description: 'Queue management system for BYD dealership',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
};
```

### Step 3: Build PWA

```bash
npm run build
```

Users can now install your app from the browser!

---

## Quick Start Commands

### Mobile (Android)
```bash
cd apps/web
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "BYD Queue System" "com.byd.queuesystem" --web-dir=build
npm run build
npx cap add android
npx cap sync
npx cap open android
```

### Desktop (Windows/Mac/Linux)
```bash
cd apps/web
npm install --save-dev electron electron-builder
# Create electron/main.js (see above)
npm run build
npm run electron:build
```

---

## Distribution

### Android
- **Google Play Store**: Requires developer account ($25 one-time)
- **Direct APK**: Share the APK file directly

### iOS
- **App Store**: Requires Apple Developer account ($99/year)
- **TestFlight**: For beta testing

### Desktop
- **Windows**: Distribute .exe installer
- **Mac**: Distribute .dmg file
- **Linux**: Distribute .AppImage or .deb

### Web
- Already deployed on Firebase Hosting and Vercel!

---

## File Sizes (Approximate)

- **Android APK**: 10-20 MB
- **iOS IPA**: 15-25 MB
- **Windows Installer**: 50-80 MB
- **Mac DMG**: 60-90 MB
- **Linux AppImage**: 70-100 MB

---

## Next Steps

1. Choose your target platforms
2. Follow the setup for each platform
3. Test thoroughly on each platform
4. Build release versions
5. Distribute to users or app stores

Would you like me to set up any specific platform first?
