# FINAL INSTRUCTIONS - Configure Render Now

## Current Status

✅ **Frontend**: Working perfectly
- Car dropdown loads 25 cars from Firebase
- Correctly trying to connect to production API
- Deployed at: https://testdrive-17e53.web.app

❌ **Backend API**: Not configured on Render
- Returns error without CORS headers
- Needs configuration in Render dashboard

## The ONLY Thing Left To Do

**Go to Render Dashboard and configure it.** Your code is 100% ready.

### Step 1: Open Render
https://dashboard.render.com

### Step 2: Find Your API Service
Look for "queuingsystembyd-api" or similar name

### Step 3: Settings Tab
1. Click **"Settings"** in left sidebar
2. Find **"Root Directory"** field
3. Type: `apps/api`
4. Click **"Save Changes"**

### Step 4: Environment Tab
1. Click **"Environment"** in left sidebar
2. Add these variables (click "Add Environment Variable" for each):

```
NODE_ENV = production
PORT = 8080
TZ = Asia/Manila
STAFF_PIN = 1234
FIREBASE_DATABASE_URL = https://testdrive-17e53-default-rtdb.asia-southeast1.firebasedatabase.app
CORS_ORIGIN = https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com,https://queuingsystembyd-web.vercel.app,http://localhost:5173
```

**CRITICAL**: The `CORS_ORIGIN` must include `https://testdrive-17e53.web.app`

### Step 5: Secret Files (in Environment tab)
1. Scroll to **"Secret Files"** section
2. Click **"Add Secret File"**
3. Filename: `firebase-service-account.json`
4. Content: Open `apps/api/firebase-service-account.json` on your computer and copy ALL content
5. Click **"Save"**

### Step 6: Deploy
1. Find **"Manual Deploy"** section (top right)
2. Click **"Deploy latest commit"**
3. Wait 2-5 minutes

### Step 7: Test
After deployment completes, open in browser:
```
https://queuingsystembyd-api.onrender.com/health
```

Should see:
```json
{
  "status": "ok",
  "firebase": "connected"
}
```

### Step 8: Test Your App
1. Open: https://testdrive-17e53.web.app
2. Fill registration form
3. Click Submit
4. Should see success screen with queue number

## Why This Is Necessary

Render needs to know:
1. **Where your code is**: Root Directory = `apps/api`
2. **What origins to allow**: CORS_ORIGIN includes your Firebase Hosting URL
3. **How to connect to Firebase**: Service account file uploaded

Without these, Render returns errors without CORS headers, causing the browser to block requests.

## What Happens After Configuration

Once Render is configured:
- `/health` endpoint returns JSON ✅
- CORS headers are sent ✅
- Registration form works ✅
- Queue numbers are generated ✅
- Real-time updates work ✅

## If You Get Stuck

Share screenshots of:
1. Render Settings tab (Root Directory field)
2. Render Environment tab (list of variables)
3. Render Logs tab (after deployment)

## Important Notes

- **Render free tier sleeps** after 15 min inactivity
- **First request takes 30-60 seconds** to wake up
- **This is normal** - just wait and retry

## Summary

Your code is perfect. Your frontend is deployed. Everything is ready.

**The ONLY thing blocking you is Render configuration.**

Go to Render dashboard → Configure → Deploy → Done!

---

**Next action**: Open https://dashboard.render.com and follow steps 1-8 above.
