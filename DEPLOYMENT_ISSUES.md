# Deployment Issues & Solutions

## Current Status

### Working:
- ✅ Firebase Hosting: https://testdrive-17e53.web.app (deployed)
- ✅ Vercel: https://queuingsystembyd-web.vercel.app (deployed)
- ✅ Local API: Can run on localhost:8080

### Not Working:
- ❌ Render API: https://queuingsystembyd-api.onrender.com (returns 404)

## Problem

Both Vercel and Firebase Hosting are trying to fetch car data, but the Render API isn't working.

## Root Cause

The Render deployment is failing because:
1. The monorepo structure isn't configured correctly
2. Render doesn't know to look in `apps/api` directory
3. The `render.yaml` needs the `rootDir` setting

## Solutions

### Option 1: Fix Render Deployment (Recommended for Production)

1. **Update Render Dashboard Settings:**
   - Go to https://dashboard.render.com
   - Select your `byd-queue-api` service
   - Go to Settings
   - Set "Root Directory" to: `apps/api`
   - Save changes

2. **Update Environment Variables:**
   - Go to Environment tab
   - Update `CORS_ORIGIN` to:
     ```
     https://queuingsystembyd-web.vercel.app,https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com,http://localhost:5173
     ```
   - Save and redeploy

3. **Check Logs:**
   - Go to Logs tab
   - Look for any errors during deployment
   - Verify the server starts successfully

### Option 2: Deploy API to Firebase Functions (Alternative)

If Render continues to have issues, you can deploy the API to Firebase Functions:

1. Install Firebase Functions:
```bash
cd apps/api
npm install firebase-functions firebase-admin
```

2. Create `functions` directory and move API code
3. Deploy with `firebase deploy --only functions`

### Option 3: Use Local API for Testing

For immediate testing, run the API locally:

```bash
cd apps/api
npm run dev
```

Then update both deployments to use `http://your-ip:8080` (replace with your actual IP)

## Testing After Fix

Once Render is working, test these endpoints:

1. Root: https://queuingsystembyd-api.onrender.com/
2. Health: https://queuingsystembyd-api.onrender.com/health
3. Cars: https://queuingsystembyd-api.onrender.com/api/cars?branch=MAIN
4. Branches: https://queuingsystembyd-api.onrender.com/api/branches

All should return JSON responses, not 404.

## Vercel Configuration Issue

Vercel is also trying to serve API routes from itself. Check if there's a `vercel.json` that's routing `/api/*` incorrectly.

## Next Steps

1. Fix Render deployment using Option 1 above
2. Verify API endpoints work
3. Test Firebase Hosting app
4. Test Vercel app
5. Both should now load car models successfully
