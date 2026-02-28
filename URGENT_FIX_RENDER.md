# 🚨 URGENT: Fix Render API Now

## The Problem
Your Render API is returning **404 Not Found** because the Root Directory is not configured.

## Quick Fix (5 minutes)

### Step 1: Go to Render Dashboard
Open: https://dashboard.render.com

### Step 2: Select Your API Service
Click on: **queuingsystembyd-api** (or whatever your API service is named)

### Step 3: Update Settings
1. Click **"Settings"** tab (left sidebar)
2. Scroll to **"Build & Deploy"** section
3. Find **"Root Directory"** field
4. Change it from blank to: `apps/api`
5. Click **"Save Changes"** button

### Step 4: Set Environment Variables
1. Click **"Environment"** tab (left sidebar)
2. Click **"Add Environment Variable"** button
3. Add these one by one:

```
CORS_ORIGIN
https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com,https://queuingsystembyd-web.vercel.app,http://localhost:5173
```

```
FIREBASE_DATABASE_URL
https://testdrive-17e53-default-rtdb.asia-southeast1.firebasedatabase.app
```

```
NODE_ENV
production
```

```
PORT
8080
```

```
STAFF_PIN
1234
```

```
TZ
Asia/Manila
```

4. Click **"Save Changes"**

### Step 5: Add Firebase Service Account (Important!)
1. Still in **"Environment"** tab
2. Scroll to **"Secret Files"** section
3. Click **"Add Secret File"**
4. Fill in:
   - **Filename**: `firebase-service-account.json`
   - **Contents**: Open `apps/api/firebase-service-account.json` on your computer and copy ALL the content
5. Click **"Save"**

### Step 6: Manual Deploy
1. Go to **"Manual Deploy"** section (top right)
2. Click **"Deploy latest commit"** button
3. Wait 2-5 minutes for deployment

### Step 7: Test
After deployment completes, open in browser:
```
https://queuingsystembyd-api.onrender.com/health
```

Should see:
```json
{
  "status": "ok",
  "timestamp": "...",
  "firebase": "connected"
}
```

### Step 8: Test Your App
Open: https://testdrive-17e53.web.app

Try to register - should work now!

## Why This Happened

Render needs to know:
1. **Where your code is** → Root Directory: `apps/api`
2. **What origins to allow** → CORS_ORIGIN environment variable
3. **How to connect to Firebase** → Service account file

Without these, the API returns 404 and blocks CORS requests.

## If Still Not Working

### Check Render Logs
1. In Render dashboard, click **"Logs"** tab
2. Look for errors like:
   - "FIREBASE_DATABASE_URL is not set"
   - "Cannot find module"
   - "ENOENT: no such file"

### Common Issues
- **Still 404**: Root Directory not saved - check Settings tab
- **CORS error**: Origin not in CORS_ORIGIN - add it and redeploy
- **Firebase error**: Service account file not uploaded correctly

## Alternative: Use render.yaml

Your project already has `apps/api/render.yaml` with correct settings. Make sure Render is reading it:

1. In Render dashboard → Settings
2. Check **"Build Command"** should be: `npm install`
3. Check **"Start Command"** should be: `npm start`

## Need Help?

If you're stuck, share:
1. Screenshot of Render Settings tab (Root Directory field)
2. Screenshot of Render Environment tab (list of variables)
3. Error message from Render Logs tab

---

**Bottom line**: Set Root Directory to `apps/api` and add environment variables, then redeploy!
