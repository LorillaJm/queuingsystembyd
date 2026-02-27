# How to Upload to GitHub

## Step 1: Install Git

1. Download Git for Windows from: https://git-scm.com/download/win
2. Run the installer
3. Use default settings (just keep clicking "Next")
4. Restart your terminal/PowerShell after installation

## Step 2: Configure Git (First Time Only)

Open PowerShell and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize and Push to GitHub

Navigate to your project folder and run these commands:

```bash
# Navigate to project
cd C:\Users\HUAWEI\Downloads\quingsystem

# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/LorillaJm/queuingsystembyd.git

# Or if remote already exists, update it:
git remote set-url origin https://github.com/LorillaJm/queuingsystembyd.git

# Add all files
git add .

# Commit with message
git commit -m "BYD Iloilo Queue System - Complete implementation with Firebase"

# Push to GitHub (main branch)
git push -u origin main

# If it asks for branch name, try:
git branch -M main
git push -u origin main
```

## Step 4: Authentication

When pushing, GitHub will ask for credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (NOT your GitHub password)

### How to Create Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "BYD Queue System"
4. Select scopes: Check "repo" (full control of private repositories)
5. Click "Generate token"
6. Copy the token and use it as your password

## Alternative: Use GitHub Desktop (Easier!)

1. Download: https://desktop.github.com/
2. Install and sign in
3. File → Add Local Repository → Select `C:\Users\HUAWEI\Downloads\quingsystem`
4. Click "Publish repository"
5. Uncheck "Keep this code private" if you want it public
6. Click "Publish repository"

## Important Notes

✅ Your `.gitignore` file is already configured to exclude:
- `node_modules/` (dependencies)
- `.env` (environment variables)
- `firebase-service-account.json` (Firebase credentials)

⚠️ **NEVER commit sensitive files like:**
- `.env` files with API keys
- `firebase-service-account.json` with Firebase credentials
- Database passwords

## Verify Upload

After pushing, visit: https://github.com/LorillaJm/queuingsystembyd

You should see all your files there!

## Future Updates

After making changes, run:

```bash
git add .
git commit -m "Description of changes"
git push
```

---

## Project Summary

This is a complete Queue Management System for BYD Iloilo with:
- ✅ Firebase Realtime Database
- ✅ Multi-queue system (one queue per car model)
- ✅ Real-time updates via WebSocket
- ✅ Staff control panel
- ✅ MC announcer view
- ✅ TV display screen
- ✅ Customer registration form
- ✅ Chinese New Year themed UI
- ✅ 12 BYD car models
- ✅ Auto-progression when marking done
