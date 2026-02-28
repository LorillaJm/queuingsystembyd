# 🛠️ Local Development Setup

## Current Issue
You're running the frontend on `localhost:5174` but:
1. Backend CORS doesn't allow `localhost:5174`
2. Socket is trying to connect to wrong port

## ✅ Solution 1: Test with Local Backend

### Step 1: Update Backend CORS (Already Done)
Your `apps/api/.env` now includes `localhost:5174`

### Step 2: Start Local API
```bash
cd apps/api
npm start
```

Should see:
```
✓ Server running on port 8080
✓ Environment: development
✓ CORS Origin: http://localhost:5173,http://localhost:5174,...
```

### Step 3: Update Frontend .env (Already Done)
Your `apps/web/.env` now points to `localhost:8080`

### Step 4: Restart Frontend Dev Server
```bash
# Stop current server (Ctrl+C in terminal)
cd apps/web
npm run dev
```

### Step 5: Test
Open: http://localhost:5174/screen

Should work without CORS errors!

---

## ✅ Solution 2: Test Against Production API

If you don't want to run local backend:

### Step 1: Update Frontend .env
```env
PUBLIC_API_URL=https://queuingsystembyd.onrender.com
PUBLIC_SOCKET_URL=https://queuingsystembyd.onrender.com
```

### Step 2: Add localhost:5174 to Render
1. Go to https://dashboard.render.com/
2. Click "queuingsystembyd" service
3. Go to "Environment" tab
4. Edit `CORS_ORIGIN` to include:
```
http://localhost:5173,http://localhost:5174,https://queuingsystembyd-web.vercel.app,https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com
```
5. Save (will auto-redeploy)

### Step 3: Wait for Render to Redeploy
Takes 2-3 minutes

### Step 4: Restart Frontend
```bash
# Stop current server (Ctrl+C)
cd apps/web
npm run dev
```

---

## 🎯 Recommended: Use Solution 1 (Local Backend)

For development, it's better to run both frontend and backend locally:
- Faster responses (no network delay)
- Can see backend logs
- Can debug both sides
- No need to redeploy for testing

---

## 📝 Current Configuration

### Backend (apps/api/.env)
```env
PORT=8080
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://192.168.1.38:5173,https://queuingsystembyd-web.vercel.app,https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com
```

### Frontend (apps/web/.env)
```env
PUBLIC_API_URL=http://localhost:8080
PUBLIC_SOCKET_URL=http://localhost:8080
```

### Frontend Production (apps/web/.env.production)
```env
PUBLIC_API_URL=https://queuingsystembyd.onrender.com
PUBLIC_SOCKET_URL=https://queuingsystembyd.onrender.com
```

---

## 🔍 Verify Setup

### Check Backend is Running
```bash
curl http://localhost:8080/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "development"
}
```

### Check Frontend Environment
Open browser console on http://localhost:5174/screen and run:
```javascript
console.log(import.meta.env.PUBLIC_API_URL)
```

Should show: `http://localhost:8080`

---

## 🚨 Common Issues

### Issue: "Connection Refused" on localhost:3001
**Cause:** Old hardcoded port in socket.js
**Fix:** Restart dev server to pick up new .env

### Issue: CORS error on localhost:5174
**Cause:** Backend not allowing this origin
**Fix:** Already fixed in apps/api/.env, restart backend

### Issue: Socket connecting to wrong URL
**Cause:** .env not loaded
**Fix:** Restart dev server (Ctrl+C then npm run dev)

### Issue: Changes not reflecting
**Cause:** Browser cache
**Fix:** Hard refresh (Ctrl+F5 or Cmd+Shift+R)
