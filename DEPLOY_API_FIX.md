# Deploy API Fix - CORS & Routes

## Changes Made ✅

1. **Enhanced CORS Configuration**
   - Added explicit origin checking
   - Added OPTIONS preflight handling
   - Added more allowed headers
   - Added request logging for debugging

2. **Verified Routes**
   - Routes are correctly mounted at `/api`
   - `/api/cars` endpoint exists in public routes

## Deploy to Render

### Option 1: Git Push (Recommended)

```bash
# From project root
git add apps/api/src/server.js
git commit -m "Fix CORS configuration for all origins"
git push origin main
```

Render will automatically redeploy (takes 2-5 minutes).

### Option 2: Manual Deploy on Render

1. Go to https://dashboard.render.com
2. Find your `byd-queue-api` service
3. Click "Manual Deploy" > "Deploy latest commit"
4. Wait for deployment to complete

## Verify After Deployment

### Test 1: Check API is Running

Open in browser:
```
https://queuingsystembyd-api.onrender.com/
```

Expected: JSON response with API info

### Test 2: Check Health Endpoint

```
https://queuingsystembyd-api.onrender.com/health
```

Expected: `{"status":"ok",...}`

### Test 3: Check Cars Endpoint

```
https://queuingsystembyd-api.onrender.com/api/cars?branch=MAIN
```

Expected: JSON with cars array (or error message if no data)

### Test 4: Check CORS Headers

Open browser console and run:
```javascript
fetch('https://queuingsystembyd-api.onrender.com/api/cars?branch=MAIN')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Expected: No CORS error, JSON response

## If Still Getting 404

The issue is likely that Render doesn't know where your code is.

### Fix Root Directory on Render:

1. Go to Render Dashboard
2. Click your service
3. Go to "Settings"
4. Find "Root Directory"
5. Set to: `apps/api`
6. Save and redeploy

## If Still Getting CORS Error

### Check Render Environment Variables:

1. Go to Render Dashboard
2. Click your service
3. Go to "Environment"
4. Find `CORS_ORIGIN`
5. Verify it includes:
   ```
   http://localhost:5173,https://queuingsystembyd-web.vercel.app,https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com
   ```
6. Save and redeploy

## Check Render Logs

After deployment:

1. Go to "Logs" tab
2. Look for:
   - ✅ "Server running on port 10000"
   - ✅ "Connected to Firebase"
   - ❌ Any error messages

3. Make a request to your API
4. Check logs for:
   - Request received
   - Origin logged
   - Response sent

## Quick Test Commands

```bash
# Test from command line
curl https://queuingsystembyd-api.onrender.com/health

# Test with origin header
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://queuingsystembyd-api.onrender.com/api/cars?branch=MAIN
```

## Expected Result

After deploying:

1. ✅ API responds without 404
2. ✅ CORS headers present
3. ✅ Frontend can fetch data
4. ✅ All deployments work:
   - Firebase Hosting
   - Vercel
   - Local development

## Troubleshooting

### "Cannot find module" error in logs
- Check that all dependencies are in `package.json`
- Run `npm install` locally to verify

### "Port already in use"
- Render uses PORT environment variable (10000)
- Your code correctly uses `process.env.PORT`

### "Firebase initialization failed"
- Check `FIREBASE_DATABASE_URL` is set on Render
- Check `FIREBASE_SERVICE_ACCOUNT` is set (if using service account)

## Next Steps

1. Deploy the changes (git push or manual)
2. Wait 2-5 minutes for Render to deploy
3. Test the API endpoints
4. Test your web apps
5. Everything should work! 🎉
