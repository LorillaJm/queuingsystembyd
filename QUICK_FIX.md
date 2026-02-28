# 🔥 QUICK FIX - WebSocket Connection Issue

## Problem
Production site still trying to connect to `localhost:3001` instead of `queuingsystembyd.onrender.com`

## Why?
The current deployed version on Firebase was built BEFORE we fixed the `.env.production` file.

## ✅ Solution (Run These Commands)

### Step 1: Navigate to Web App
```bash
cd apps/web
```

### Step 2: Build with Production Environment
```bash
npm run build
```

This will:
- Use `.env.production` file (which has correct URLs)
- Create optimized production bundle
- Take 1-2 minutes

### Step 3: Deploy to Firebase
```bash
firebase deploy --only hosting
```

This will:
- Upload new build to Firebase
- Take 1-2 minutes
- Show deployment URL when done

### Step 4: Clear Browser Cache & Test
1. **Hard Refresh:** Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. **Or Clear Cache:** `Ctrl+Shift+Delete` → Clear cached images and files
3. **Or Use Incognito:** Open in private/incognito window

### Step 5: Verify
Open: https://testdrive-17e53.web.app/screen

In browser console, you should see:
- ✅ Socket connecting to `queuingsystembyd.onrender.com` (NOT localhost)
- ✅ No connection refused errors
- ✅ Real-time updates working

---

## 🎯 One-Line Command (From Project Root)

```bash
cd apps/web && npm run build && firebase deploy --only hosting
```

---

## 🔍 How to Verify It Worked

### Before Fix (Current State)
```
❌ GET http://localhost:3001/socket.io/?EIO=4&transport=polling
   net::ERR_CONNECTION_REFUSED
```

### After Fix (Expected)
```
✅ GET https://queuingsystembyd.onrender.com/socket.io/?EIO=4&transport=polling
   Status: 200 OK
```

---

## ⚡ If Still Not Working

### 1. Check Build Output
When you run `npm run build`, verify it says:
```
Using environment: production
```

### 2. Check Firebase Deploy Output
Should show:
```
✔  Deploy complete!
Project Console: https://console.firebase.google.com/project/testdrive-17e53/overview
Hosting URL: https://testdrive-17e53.web.app
```

### 3. Force Clear Everything
```bash
# Clear browser completely
Ctrl+Shift+Delete → All time → Everything

# Or test in incognito
Ctrl+Shift+N (Chrome)
Ctrl+Shift+P (Firefox)
```

### 4. Check Network Tab
1. Open DevTools → Network tab
2. Filter by "socket.io"
3. Should see requests to `queuingsystembyd.onrender.com`
4. NOT to `localhost`

---

## 📝 What's Happening

1. **Old Build:** Has hardcoded `localhost:3001` from development
2. **New Build:** Will use `.env.production` → `queuingsystembyd.onrender.com`
3. **Browser Cache:** Keeps serving old build until cleared
4. **Firebase CDN:** Caches old build until new one deployed

That's why you MUST:
1. Rebuild with production env
2. Deploy new build
3. Clear browser cache

---

## 🚀 Do This Now

```bash
cd apps/web
npm run build
firebase deploy --only hosting
```

Then hard refresh the page (Ctrl+F5) and it will work!
