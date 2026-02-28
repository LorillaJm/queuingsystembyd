# Final Deployment Steps - CORS Fix Required

## Current Status

✅ **Working:**
- Firebase Hosting deployed: https://testdrive-17e53.web.app
- Vercel deployed: https://queuingsystembyd-web.vercel.app
- Web apps built with correct production API URL

❌ **Not Working:**
- Render API returning 404 or CORS errors
- API needs CORS configuration update

---

## The Problem

Your Render API at `https://queuingsystembyd-api.onrender.com` is either:
1. **Sleeping** (free tier spins down after 15 min)
2. **Not deployed correctly** (404 errors)
3. **Missing CORS headers** for Firebase Hosting domain

---

## Solution: Update Render API Configuration

### Option 1: Update via Render Dashboard (Recommended)

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com
   - Login with your account

2. **Find Your API Service:**
   - Look for `byd-queue-api` or similar name
   - Click on it

3. **Check if Service is Running:**
   - Look at the status (should be "Live")
   - If it says "Suspended" or "Failed", check the logs

4. **Update Environment Variables:**
   - Click "Environment" tab on the left
   - Find `CORS_ORIGIN` variable
   - Click "Edit"
   - Update value to:
     ```
     https://queuingsystembyd-web.vercel.app,https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com,http://localhost:5173
     ```
   - Click "Save Changes"

5. **Check Root Directory Setting:**
   - Go to "Settings" tab
   - Find "Root Directory"
   - Set it to: `apps/api`
   - Save changes

6. **Manual Redeploy:**
   - Go to "Manual Deploy" section
   - Click "Deploy latest commit"
   - Wait for deployment to complete (2-5 minutes)

7. **Check Logs:**
   - Go to "Logs" tab
   - Look for "Server running on port 10000" or similar
   - Check for any errors

### Option 2: Update via Git (Alternative)

The `render.yaml` file has already been updated with correct settings:

```bash
# Commit the changes
git add apps/api/render.yaml
git commit -m "Fix Render CORS and root directory"
git push origin main
```

Render will automatically redeploy when you push.

---

## Verify API is Working

After updating Render, test these URLs in your browser:

1. **Root endpoint:**
   ```
   https://queuingsystembyd-api.onrender.com/
   ```
   Should return: JSON with API info

2. **Health check:**
   ```
   https://queuingsystembyd-api.onrender.com/health
   ```
   Should return: JSON with status "ok"

3. **Cars endpoint:**
   ```
   https://queuingsystembyd-api.onrender.com/api/cars?branch=MAIN
   ```
   Should return: JSON with car list

If any return 404, the API isn't deployed correctly.

---

## Common Issues & Solutions

### Issue: "404 Not Found" on all endpoints

**Cause:** Render doesn't know where your API code is (monorepo issue)

**Solution:**
1. Go to Render Dashboard > Settings
2. Set "Root Directory" to `apps/api`
3. Redeploy

### Issue: "CORS policy" error

**Cause:** CORS_ORIGIN doesn't include your domain

**Solution:**
1. Update CORS_ORIGIN environment variable (see above)
2. Redeploy
3. Wait 1-2 minutes for changes to take effect

### Issue: API returns 404 after being idle

**Cause:** Free tier spins down after 15 minutes

**Solution:**
- First request wakes it up (takes 30-60 seconds)
- Refresh the page after 1 minute
- Or upgrade to paid plan ($7/month) for always-on

### Issue: Build fails on Render

**Cause:** Missing dependencies or wrong Node version

**Solution:**
1. Check Render logs for specific error
2. Ensure `package.json` has all dependencies
3. Set Node version to 20.x in Render settings

---

## Alternative: Run API Locally

If Render continues to have issues, you can run the API locally and use ngrok to expose it:

```bash
# Terminal 1: Run API
cd apps/api
npm run dev

# Terminal 2: Expose with ngrok
ngrok http 8080
```

Then update your web apps to use the ngrok URL.

---

## After Fixing Render

Once Render is working correctly:

1. **Test Firebase Hosting:**
   - Visit: https://testdrive-17e53.web.app
   - Car models should load
   - Registration should work

2. **Test Vercel:**
   - Visit: https://queuingsystembyd-web.vercel.app
   - Should also work now

3. **Test Locally:**
   - Run: `cd apps/web && npm run dev`
   - Visit: http://localhost:5173
   - Should connect to production API

---

## Summary of Required Changes on Render

1. ✅ Root Directory: `apps/api`
2. ✅ CORS_ORIGIN: Include all your domains
3. ✅ Redeploy after changes
4. ✅ Verify API responds without 404

---

## Need Help?

If you're still having issues:

1. Check Render logs for errors
2. Verify the API works by visiting the URLs above
3. Make sure CORS_ORIGIN includes your domain
4. Try manual redeploy from Render dashboard

The main issue is that Render needs to be configured correctly for your monorepo structure and CORS settings.
