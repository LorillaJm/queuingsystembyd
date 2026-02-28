# 🚀 Production Deployment Checklist

## Current Issue
Your production site shows data but WebSocket isn't connecting for real-time updates.

## ✅ What Needs to be Done

### 1. Deploy Backend Changes to Render
The CORS fixes need to be pushed to production.

```bash
# Commit all changes
git add .
git commit -m "Fix CORS headers and WebSocket configuration"
git push origin main
```

Render will automatically detect the push and redeploy (takes 2-3 minutes).

**Verify Render Deployment:**
1. Go to https://dashboard.render.com/
2. Click "queuingsystembyd" service
3. Check "Events" tab - should see "Deploy started"
4. Wait for "Deploy live" message

### 2. Rebuild and Deploy Frontend to Firebase
The frontend needs to be rebuilt with production environment variables.

**Option A - Using Script (Windows):**
```bash
deploy-production.bat
```

**Option B - Manual Commands:**
```bash
cd apps/web
npm run build
firebase deploy --only hosting
```

**What this does:**
- Uses `.env.production` file (correct URLs)
- Builds optimized production bundle
- Deploys to Firebase Hosting
- Takes 2-3 minutes

### 3. Verify Deployment

**Check Backend:**
```bash
curl https://queuingsystembyd.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production"
}
```

**Check Frontend:**
1. Open: https://testdrive-17e53.web.app/screen
2. Open browser DevTools → Console
3. Should see:
   - ✅ No CORS errors
   - ✅ Socket connecting to `queuingsystembyd.onrender.com`
   - ✅ "Socket connected" message
   - ✅ Real-time updates working

**Test Real-Time Updates:**
1. Open screen page: https://testdrive-17e53.web.app/screen
2. Open staff page in another tab: https://testdrive-17e53.web.app/staff
3. Login with PIN: 1234
4. Call next customer
5. Screen should update immediately (without refresh)

---

## 📋 Complete Deployment Steps

### Step 1: Commit Backend Changes
```bash
git status
git add .
git commit -m "Fix CORS and WebSocket configuration"
git push
```

### Step 2: Wait for Render
- Go to https://dashboard.render.com/
- Watch "queuingsystembyd" service
- Wait for "Deploy live" (2-3 minutes)

### Step 3: Deploy Frontend
```bash
cd apps/web
npm run build
firebase deploy --only hosting
```

### Step 4: Clear Browser Cache
```
Chrome: Ctrl+Shift+Delete → Clear cached images and files
Or: Hard refresh with Ctrl+F5
```

### Step 5: Test
Open: https://testdrive-17e53.web.app/screen

---

## 🔍 Troubleshooting

### Issue: Socket still connecting to localhost
**Cause:** Browser cached old build
**Fix:** 
1. Hard refresh (Ctrl+F5)
2. Clear browser cache
3. Try incognito/private window

### Issue: CORS errors still appearing
**Cause:** Render hasn't deployed yet
**Fix:** 
1. Check Render dashboard for deployment status
2. Wait for "Deploy live" message
3. Check logs for errors

### Issue: "Service Unavailable" on Render
**Cause:** Render free tier sleeps after inactivity
**Fix:** 
1. Wait 30 seconds for service to wake up
2. Refresh page
3. First request after sleep is slow

### Issue: Data shows but doesn't update
**Cause:** WebSocket not connected
**Fix:**
1. Check browser console for socket errors
2. Verify socket URL in network tab
3. Check Render logs for WebSocket errors

---

## 🎯 Expected Result After Deployment

### Backend (Render)
- ✅ CORS allows all production origins
- ✅ WebSocket connections accepted
- ✅ All endpoints responding
- ✅ Real-time events broadcasting

### Frontend (Firebase)
- ✅ Connects to production API
- ✅ WebSocket connects successfully
- ✅ Real-time updates working
- ✅ No console errors

### User Experience
- ✅ Screen updates automatically when staff calls customer
- ✅ No page refresh needed
- ✅ Multiple screens stay in sync
- ✅ Smooth, real-time experience

---

## 📝 Files Changed

### Backend
- `apps/api/src/server.js` - CORS configuration
- `apps/api/src/middleware/auth.js` - OPTIONS bypass
- `apps/api/src/routes/staff.js` - Preflight handler
- `apps/api/.env` - Added localhost:5174

### Frontend
- `apps/web/.env.production` - Production URLs
- `apps/web/.env` - Development URLs

---

## 🚨 Important Notes

1. **Always rebuild frontend after changing .env files**
2. **Render auto-deploys on git push** (no manual trigger needed)
3. **Firebase requires manual deployment** (npm run build + firebase deploy)
4. **Clear browser cache** after deployment to see changes
5. **First Render request after sleep takes ~30 seconds**

---

## ⚡ Quick Deploy Commands

```bash
# Full deployment (run from project root)
git add .
git commit -m "Deploy production updates"
git push

# Wait 2-3 minutes for Render, then:
cd apps/web
npm run build
firebase deploy --only hosting
```

Done! Your app should be fully live with real-time updates.
