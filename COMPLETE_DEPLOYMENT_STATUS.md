# Complete Deployment Status & Fix Guide

## ✅ What's Working

1. **Firebase Hosting Deployed Successfully**
   - URL: https://testdrive-17e53.web.app
   - Build: ✅ Completed
   - Deployment: ✅ Live
   - Firebase Config: ✅ Correct (with real API keys)

2. **Car Dropdown Working**
   - Fetches directly from Firebase Realtime Database
   - No API dependency for loading cars
   - Real-time updates enabled

3. **Code Ready**
   - CORS configuration: ✅ Enhanced in `apps/api/src/server.js`
   - Firebase integration: ✅ Working in `apps/web/src/lib/firebase.js`
   - render.yaml: ✅ Correct configuration

## ❌ What's NOT Working

**Render API**: https://queuingsystembyd-api.onrender.com
- Status: **404 Not Found**
- Reason: **Root Directory not configured in Render dashboard**
- Impact: Registration form cannot submit

## The Error You're Seeing

```
Access to fetch at 'https://queuingsystembyd-api.onrender.com/api/register' 
from origin 'https://testdrive-17e53.web.app' has been blocked by CORS policy
```

This happens because:
1. Render API returns 404 (not deployed correctly)
2. 404 response has no CORS headers
3. Browser blocks the request

## Why Render API Returns 404

Your `render.yaml` file has:
```yaml
rootDir: apps/api
```

But Render dashboard might not be using this file, or the Root Directory setting is blank.

## How to Fix (Must Do in Render Dashboard)

### Option A: Use Render Dashboard (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Find your API service** (look for "queuingsystembyd-api" or similar)

3. **Settings Tab**:
   - Set **Root Directory**: `apps/api`
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start`
   - Click **Save Changes**

4. **Environment Tab** - Add these variables:
   ```
   NODE_ENV = production
   PORT = 8080
   TZ = Asia/Manila
   STAFF_PIN = 1234
   FIREBASE_DATABASE_URL = https://testdrive-17e53-default-rtdb.asia-southeast1.firebasedatabase.app
   CORS_ORIGIN = https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com,https://queuingsystembyd-web.vercel.app,http://localhost:5173
   ```

5. **Secret Files** (in Environment tab):
   - Click "Add Secret File"
   - Filename: `firebase-service-account.json`
   - Content: Copy from `apps/api/firebase-service-account.json`
   - Save

6. **Manual Deploy**:
   - Click "Deploy latest commit"
   - Wait 2-5 minutes

### Option B: Use Blueprint (render.yaml)

If Render is not reading your `render.yaml`:

1. Delete the existing service
2. Create new service → "Blueprint"
3. Connect your GitHub repo
4. Render will read `apps/api/render.yaml` automatically
5. Add the secret environment variables manually (FIREBASE_DATABASE_URL, STAFF_PIN)
6. Upload firebase-service-account.json as secret file

## After Deployment - Test These URLs

### 1. Health Check
```
https://queuingsystembyd-api.onrender.com/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T...",
  "uptime": 123.45,
  "environment": "production",
  "timezone": "Asia/Manila",
  "firebase": "connected"
}
```

### 2. Root Endpoint
```
https://queuingsystembyd-api.onrender.com/
```
Expected: API info with endpoints list

### 3. Cars Endpoint
```
https://queuingsystembyd-api.onrender.com/api/cars?branch=MAIN
```
Expected: Array of car objects

## After API is Fixed - Test Registration

1. Open: https://testdrive-17e53.web.app
2. Fill in the form:
   - Full Name: Test User
   - Mobile: 09123456789
   - Select a car
   - Select a sales consultant
   - Select purpose (CIS, Test Drive, or Reservation)
3. Submit
4. Should see success screen with queue number

## Current File Status

### Local Files (Your Computer)
- ✅ `apps/api/src/server.js` - CORS configured correctly
- ✅ `apps/api/render.yaml` - Deployment config ready
- ✅ `apps/api/.env` - Local environment variables
- ✅ `apps/web/src/lib/firebase.js` - Firebase config with real keys
- ✅ `apps/web/build/` - Production build ready

### Deployed Files
- ✅ Firebase Hosting - Latest build deployed
- ❌ Render API - Not deployed correctly (404)

## What You Need to Do NOW

**You must configure Render dashboard manually**. The code is ready, but Render needs:

1. ✅ Root Directory set to `apps/api`
2. ✅ Environment variables added
3. ✅ Firebase service account uploaded
4. ✅ Manual redeploy triggered

**This cannot be done from your local machine** - you must use the Render web dashboard.

## Troubleshooting

### "I set Root Directory but still getting 404"
- Make sure you clicked "Save Changes"
- Trigger a manual redeploy
- Check Render Logs for build errors

### "CORS error after fixing 404"
- Check the exact origin in the error message
- Add that origin to CORS_ORIGIN environment variable
- Redeploy

### "Firebase initialization failed"
- Check FIREBASE_DATABASE_URL is set correctly
- Check firebase-service-account.json is uploaded
- Check Render Logs for specific error

### "API is slow to respond"
- Render free tier sleeps after 15 min inactivity
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast

## Summary

**What works**: Firebase Hosting, car dropdown, frontend
**What doesn't work**: Render API (returns 404)
**Why**: Root Directory not set in Render dashboard
**Fix**: Configure Render dashboard → Set Root Directory → Redeploy
**Time needed**: 5-10 minutes

Once you fix Render, everything will work end-to-end!

## Quick Links

- **Firebase Hosting**: https://testdrive-17e53.web.app
- **Render Dashboard**: https://dashboard.render.com
- **Render API**: https://queuingsystembyd-api.onrender.com
- **Firebase Console**: https://console.firebase.google.com/project/testdrive-17e53

---

**Next Step**: Go to Render dashboard and set Root Directory to `apps/api`, then redeploy!
