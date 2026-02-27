# Install Node.js on Windows

## Quick Install Steps

1. **Download Node.js**
   - Go to: https://nodejs.org/
   - Download the LTS version (recommended)
   - Choose Windows Installer (.msi) 64-bit

2. **Run the Installer**
   - Double-click the downloaded .msi file
   - Click "Next" through the installation wizard
   - Accept the license agreement
   - Keep default installation path: `C:\Program Files\nodejs\`
   - Make sure "Add to PATH" is checked
   - Click "Install"

3. **Verify Installation**
   - Open a NEW PowerShell window (important!)
   - Run: `node --version`
   - Run: `npm --version`
   - Both should show version numbers

4. **After Node.js is Installed**
   - Come back to this project folder
   - Run: `npm install` (installs dependencies for root)
   - Run: `cd apps/api && npm install` (installs API dependencies)
   - Run: `cd ../web && npm install` (installs web dependencies)
   - Then follow START_HERE.md to run the application

## Alternative: Using Chocolatey (if you have it)

```powershell
choco install nodejs-lts
```

## Alternative: Using Winget (Windows 10/11)

```powershell
winget install OpenJS.NodeJS.LTS
```

---

**After installation, close and reopen your terminal/PowerShell to refresh the PATH.**
