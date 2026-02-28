# Render API Deployment Guide

## Current Status

✅ **Firebase Hosting Deployed**: https://testdrive-17e53.web.app
✅ **Firebase Config**: Correct config in `apps/web/src/lib/firebase.js`
✅ **CORS Code**: Enhanced CORS configuration in `apps/api/src/server.js`
❌ **Render API**: Returning 404 errors - needs configuration

## The Problem

Your Render API at `https://queuingsystembyd-api.onrender.com` is returning 404 errors because:
1. The "Root Directory" is not set to `apps/api` in Render dashboard
2. Environment variables may not be configured correctly

## Step-by-Step Fix

### 1. Configure Render Dashboard

Go to: https://dashboard.render.com

1. **Select your API service** (queuingsystembyd-api)

2. **Set Root Directory**:
   - Go to "Settings" tab
   - Find "Root Directory" field
   - Set it to: `apps/api`
   - Click "Save Changes"

3. **Configure Environment Variables**:
   - Go to "Environment" tab
   - Add/Update these variables:

   ```
   PORT=8080
   NODE_ENV=production
   FIREBASE_DATABASE_URL=https://testdrive-17e53-default-rtdb.asia-southeast1.firebasedatabase.app
   STAFF_PIN=1234
   CORS_ORIGIN=http://localhost:5173,https://queuingsystembyd-web.vercel.app,https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com
   TZ=Asia/Manila
   ```

   **CRITICAL**: Make sure `CORS_ORIGIN` includes ALL your frontend URLs:
   - `http://localhost:5173` (local development)
   - `https://queuingsystembyd-web.vercel.app` (Vercel deployment)
   - `https://testdrive-17e53.web.app` (Firebase Hosting)
   - `https://testdrive-17e53.firebaseapp.com` (Firebase alternate URL)

4. **Add Firebase Service Account**:
   - In "Environment" tab, click "Add Secret File"
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Path: `/etc/secrets/firebase-service-account.json`
   - Content: Copy from `apps/api/firebase-service-account.json`

5. **Manual Redeploy**:
   - Go to "Manual Deploy" section
   - Click "Deploy latest commit"
   - Wait 2-5 minutes for deployment to complete

### 2. Verify Deployment

After deployment completes, test these URLs in your browser:

1. **Health Check**:
   ```
   https://queuingsystembyd-api.onrender.com/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "uptime": 123,
     "environment": "production",
     "timezone": "Asia/Manila",
     "firebase": "connected"
   }
   ```

2. **Root Endpoint**:
   ```
   https://queuingsystembyd-api.onrender.com/
   ```
   Should return API info with available endpoints

3. **Cars Endpoint**:
   ```
   https://queuingsystembyd-api.onrender.com/api/cars?branch=MAIN
   ```
   Should return list of cars

### 3. Test from Frontend

Once API is working:

1. **Open Firebase Hosting**: https://testdrive-17e53.web.app
2. **Check Console**: Open browser DevTools (F12) → Console tab
3. **Look for**:
   - "Loaded cars from Firebase:" (should show cars)
   - No CORS errors
   - No 404 errors

### 4. If Still Getting CORS Errors

If you still see CORS errors after fixing Render:

1. **Check the exact error message** in browser console
2. **Verify the origin** being blocked
3. **Add that origin** to `CORS_ORIGIN` in Render environment variables
4. **Redeploy** on Render

## Important Notes

### Render Free Tier Behavior
- **Spins down** after 15 minutes of inactivity
- **Takes 30-60 seconds** to wake up on first request
- First request may timeout - just retry

### Firebase Direct Connection
Your app now loads cars directly from Firebase, so:
- Car dropdown works even if API is down
- Only registration submission needs API
- Better performance and reliability

### Git Push Not Required
The CORS code changes are already in your local files. You don't need to push to Git unless you want to. Render just needs the correct configuration in the dashboard.

## Troubleshooting

### "404 Not Found" on /health
- Root Directory not set to `apps/api`
- Go to Render Settings → Set Root Directory → Redeploy

### "CORS policy" errors
- Missing origin in CORS_ORIGIN environment variable
- Add the origin to CORS_ORIGIN → Redeploy

### "Firebase initialization failed"
- FIREBASE_DATABASE_URL not set
- Firebase service account file not uploaded
- Check Environment tab in Render

### API not responding
- Free tier may be sleeping
- Wait 60 seconds and retry
- Check Render logs for errors

## Quick Reference

**Firebase Hosting**: https://testdrive-17e53.web.app
**Vercel**: https://queuingsystembyd-web.vercel.app
**Render API**: https://queuingsystembyd-api.onrender.com
**Render Dashboard**: https://dashboard.render.com

## Next Steps

1. ✅ Configure Render dashboard (Root Directory + Environment Variables)
2. ✅ Manual redeploy on Render
3. ✅ Test /health endpoint
4. ✅ Test Firebase Hosting app
5. ✅ Verify no CORS errors

Once these steps are complete, your app will be fully functional!
