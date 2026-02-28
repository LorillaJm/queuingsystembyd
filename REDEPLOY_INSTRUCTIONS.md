# 🚀 Redeploy Instructions

## What Was Fixed

### 1. Backend (API) - CORS Headers
Added missing headers to CORS configuration:
- `cache-control`
- `pragma`
- `expires`

These headers are sent by browsers for caching control and were being blocked.

### 2. Frontend - Environment Variables
Fixed production URLs in:
- `apps/web/.env` → Changed to production URL
- `apps/web/.env.production` → Fixed wrong URL

**Old (wrong):** `https://queuingsystembyd-api.onrender.com`
**New (correct):** `https://queuingsystembyd.onrender.com`

---

## 🔄 How to Redeploy

### Step 1: Commit Changes
```bash
git add .
git commit -m "Fix CORS headers and production URLs"
git push
```

### Step 2: Redeploy Backend (Render)
Render will automatically redeploy when you push to GitHub.

**Or manually trigger:**
1. Go to https://dashboard.render.com/
2. Click on "queuingsystembyd" service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait 2-3 minutes for deployment

### Step 3: Redeploy Frontend (Firebase)
```bash
cd apps/web
npm run build
firebase deploy --only hosting
```

**Or if you're in the root directory:**
```bash
cd apps/web && npm run build && firebase deploy --only hosting
```

---

## ✅ Verify Deployment

### 1. Check Backend CORS
Open browser console and run:
```javascript
fetch('https://queuingsystembyd.onrender.com/health', {
  headers: { 'cache-control': 'no-cache' }
}).then(r => r.json()).then(console.log)
```

Should return health status without CORS error.

### 2. Check Frontend URLs
Open: https://testdrive-17e53.web.app/screen

In browser console, you should see:
- ✅ No CORS errors
- ✅ Socket connecting to `queuingsystembyd.onrender.com` (not localhost)
- ✅ Data loading successfully

### 3. Test Full Flow
1. **Register:** https://testdrive-17e53.web.app/
2. **View Screen:** https://testdrive-17e53.web.app/screen
3. **Staff Login:** https://testdrive-17e53.web.app/staff (PIN: 1234)

---

## 🐛 If Still Not Working

### Clear Browser Cache
```
Chrome: Ctrl+Shift+Delete → Clear cached images and files
Firefox: Ctrl+Shift+Delete → Cached Web Content
```

### Hard Refresh
```
Windows: Ctrl+F5
Mac: Cmd+Shift+R
```

### Check Render Logs
1. Go to https://dashboard.render.com/
2. Click "queuingsystembyd"
3. Click "Logs" tab
4. Look for CORS-related errors

### Verify Environment Variables
In Render dashboard, check that `CORS_ORIGIN` includes:
```
https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com,https://queuingsystembyd-web.vercel.app
```

---

## 📝 Summary of Changes

### Backend (`apps/api/src/server.js`)
```javascript
allowedHeaders: [
  'Content-Type', 
  'Authorization', 
  'x-staff-pin', 
  'cache-control',  // ← Added
  'pragma',         // ← Added
  'expires'         // ← Added
]
```

### Frontend (`apps/web/.env.production`)
```env
PUBLIC_API_URL=https://queuingsystembyd.onrender.com
PUBLIC_SOCKET_URL=https://queuingsystembyd.onrender.com
```

---

## 🎯 Expected Result

After redeployment:
- ✅ No CORS errors
- ✅ Screen page loads data
- ✅ Socket connects to production
- ✅ Real-time updates work
- ✅ All pages functional
