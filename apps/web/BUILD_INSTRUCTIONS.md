# Build Instructions for Downloadable Apps

## Setup Complete! ✅

Your project is now configured to build:
- 📱 Android APK
- 🖥️ Windows Desktop App (.exe)
- 🍎 Mac Desktop App (.dmg)
- 🐧 Linux Desktop App (.AppImage)

---

## 📱 Build Android App

### Prerequisites
- Install [Android Studio](https://developer.android.com/studio)
- Install Java JDK 17 or higher

### Steps

1. **Build the web app and add Android platform:**
```bash
cd apps/web
npm run build
npx cap add android
```

2. **Open in Android Studio:**
```bash
npm run android
```

3. **Build APK in Android Studio:**
   - Click "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"
   - APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

4. **For Release APK:**
   - Build > Generate Signed Bundle/APK
   - Select APK
   - Create or select keystore
   - Build release APK

### Quick Commands
```bash
# Sync changes after modifying web app
npm run build:mobile

# Open Android Studio
npm run android
```

---

## 🖥️ Build Windows Desktop App

### Prerequisites
- Windows OS (for building Windows apps)

### Steps

1. **Build the desktop app:**
```bash
cd apps/web
npm run electron:build:win
```

2. **Output files will be in:**
   - `dist-electron/BYD Queue System Setup 1.0.0.exe` (Installer)
   - `dist-electron/BYD Queue System 1.0.0.exe` (Portable)

### Quick Commands
```bash
# Test in development
npm run electron:dev

# Build for Windows
npm run electron:build:win

# Build for all platforms
npm run electron:build
```

---

## 🍎 Build Mac Desktop App

### Prerequisites
- macOS (required for building Mac apps)

### Steps

1. **Build the desktop app:**
```bash
cd apps/web
npm run electron:build:mac
```

2. **Output files will be in:**
   - `dist-electron/BYD Queue System-1.0.0.dmg`
   - `dist-electron/BYD Queue System-1.0.0-mac.zip`

---

## 🐧 Build Linux Desktop App

### Steps

1. **Build the desktop app:**
```bash
cd apps/web
npm run electron:build:linux
```

2. **Output files will be in:**
   - `dist-electron/BYD Queue System-1.0.0.AppImage`
   - `dist-electron/byd-queue-system_1.0.0_amd64.deb`

---

## 📦 File Sizes (Approximate)

- Android APK: 10-20 MB
- Windows Installer: 60-80 MB
- Mac DMG: 70-90 MB
- Linux AppImage: 80-100 MB

---

## 🚀 Quick Start

### For Android:
```bash
cd apps/web
npm run build
npx cap add android
npm run android
```

### For Windows Desktop:
```bash
cd apps/web
npm run electron:build:win
```

The installer will be in `dist-electron/` folder!

---

## 🔧 Troubleshooting

### Android Issues

**"Android SDK not found"**
- Install Android Studio
- Open Android Studio > SDK Manager
- Install Android SDK Platform 34

**"Gradle build failed"**
- Open project in Android Studio
- Let it download dependencies
- Try building from Android Studio first

### Electron Issues

**"Cannot find module 'electron'"**
```bash
npm install
```

**Build fails on Windows**
- Run as Administrator
- Disable antivirus temporarily

**Build fails on Mac**
- Install Xcode Command Line Tools:
```bash
xcode-select --install
```

---

## 📝 Notes

- First build takes longer (downloads dependencies)
- Android builds require ~2GB of disk space
- Desktop builds require ~500MB of disk space
- Release builds are optimized and smaller than debug builds

---

## 🎯 Distribution

### Android
- Share APK file directly
- Or publish to Google Play Store

### Windows
- Share the .exe installer
- Users just double-click to install

### Mac
- Share the .dmg file
- Users drag to Applications folder

### Linux
- Share the .AppImage file
- Users make it executable and run

---

## ✅ Next Steps

1. Build for your target platform
2. Test the app thoroughly
3. Create app icons (512x512 PNG)
4. Update version number in package.json
5. Distribute to users!

Need help? Check BUILD_APPS_GUIDE.md for detailed information.
