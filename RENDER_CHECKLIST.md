# Render Configuration Checklist

## 🎯 Goal
Fix the 404 error on https://queuingsystembyd-api.onrender.com

## 📋 Step-by-Step Checklist

### Step 1: Open Render Dashboard
- [ ] Go to https://dashboard.render.com
- [ ] Log in to your account
- [ ] Find your API service (queuingsystembyd-api)

### Step 2: Configure Settings Tab
- [ ] Click **"Settings"** in left sidebar
- [ ] Scroll to **"Build & Deploy"** section
- [ ] Find **"Root Directory"** field
- [ ] Type: `apps/api`
- [ ] Click **"Save Changes"** button at bottom
- [ ] Wait for "Settings saved" confirmation

### Step 3: Configure Environment Variables
- [ ] Click **"Environment"** in left sidebar
- [ ] Click **"Add Environment Variable"** button

Add each of these (click "Add" after each one):

- [ ] **Key**: `NODE_ENV` → **Value**: `production`
- [ ] **Key**: `PORT` → **Value**: `8080`
- [ ] **Key**: `TZ` → **Value**: `Asia/Manila`
- [ ] **Key**: `STAFF_PIN` → **Value**: `1234`
- [ ] **Key**: `FIREBASE_DATABASE_URL` → **Value**: `https://testdrive-17e53-default-rtdb.asia-southeast1.firebasedatabase.app`
- [ ] **Key**: `CORS_ORIGIN` → **Value**: `https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com,https://queuingsystembyd-web.vercel.app,http://localhost:5173`

### Step 4: Upload Firebase Service Account
- [ ] Still in **"Environment"** tab
- [ ] Scroll down to **"Secret Files"** section
- [ ] Click **"Add Secret File"** button
- [ ] **Filename**: `firebase-service-account.json`
- [ ] **Contents**: Open `apps/api/firebase-service-account.json` on your computer
- [ ] Copy ALL the JSON content (from `{` to `}`)
- [ ] Paste into the content field
- [ ] Click **"Save"**

### Step 5: Trigger Deployment
- [ ] Look for **"Manual Deploy"** section (usually top right)
- [ ] Click **"Deploy latest commit"** button
- [ ] Wait for deployment to start
- [ ] Watch the logs (should see "Building..." then "Deploying...")
- [ ] Wait 2-5 minutes for completion
- [ ] Look for "Live" status with green checkmark

### Step 6: Verify Deployment
- [ ] Open in browser: `https://queuingsystembyd-api.onrender.com/health`
- [ ] Should see JSON response with `"status": "ok"`
- [ ] Should see `"firebase": "connected"`
- [ ] Should NOT see "Not Found" or 404

### Step 7: Test Your App
- [ ] Open: https://testdrive-17e53.web.app
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Fill in registration form
- [ ] Click Submit
- [ ] Should see success screen with queue number
- [ ] Should NOT see CORS errors in console

## ✅ Success Criteria

You'll know it's working when:
1. ✅ `/health` endpoint returns JSON (not 404)
2. ✅ No CORS errors in browser console
3. ✅ Registration form submits successfully
4. ✅ Queue number is displayed

## ❌ Common Mistakes

### Mistake 1: Forgot to Save
- After setting Root Directory, you MUST click "Save Changes"
- After adding environment variables, they save automatically

### Mistake 2: Wrong Root Directory
- Must be exactly: `apps/api`
- NOT: `/apps/api` (no leading slash)
- NOT: `apps/api/` (no trailing slash)
- NOT: `api` (missing apps/)

### Mistake 3: Missing CORS Origins
- Must include ALL frontend URLs
- Comma-separated, no spaces
- Include both .web.app and .firebaseapp.com

### Mistake 4: Forgot to Redeploy
- After changing settings, you MUST manually redeploy
- Changes don't take effect until redeployment

### Mistake 5: Wrong Firebase Service Account
- Must be valid JSON
- Must include all fields (project_id, private_key, etc.)
- Must be from your Firebase project

## 🆘 If Something Goes Wrong

### Still Getting 404
1. Check Render Logs tab for errors
2. Verify Root Directory is saved
3. Try deleting and recreating the service

### Still Getting CORS Errors
1. Check the exact origin in error message
2. Add that origin to CORS_ORIGIN
3. Redeploy

### "Firebase initialization failed"
1. Check FIREBASE_DATABASE_URL is correct
2. Check firebase-service-account.json is uploaded
3. Check Render Logs for specific error

### Build Fails
1. Check package.json exists in apps/api
2. Check Build Command is `npm install`
3. Check Start Command is `npm start`

## 📞 Need Help?

If stuck, share:
1. Screenshot of Settings tab (Root Directory field)
2. Screenshot of Environment tab (list of variables)
3. Screenshot of Logs tab (error messages)
4. Screenshot of browser console (CORS error)

## 🎉 After Success

Once working:
- Your app is fully deployed and functional
- Users can register and get queue numbers
- Car dropdown loads from Firebase
- Registration submits to Render API
- Real-time updates work via Socket.io

---

**Start with Step 1 and work through each checkbox!**
