# Deploy Backend API to Render

## Step 1: Sign Up for Render

1. Go to https://render.com/
2. Click "Get Started for Free"
3. Sign up with your GitHub account
4. Authorize Render to access your repositories

## Step 2: Create New Web Service

1. Click "New +" button → "Web Service"
2. Connect your GitHub repository: `LorillaJm/queuingsystembyd`
3. Configure the service:

### Basic Settings:
- **Name:** `byd-queue-api`
- **Region:** Singapore (closest to Philippines)
- **Branch:** `main`
- **Root Directory:** `apps/api`
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Instance Type:
- Select **Free** (0 USD/month)

## Step 3: Add Environment Variables

Click "Advanced" and add these environment variables:

### Required Variables:

1. **NODE_ENV**
   - Value: `production`

2. **PORT**
   - Value: `10000`

3. **FIREBASE_DATABASE_URL**
   - Value: `https://testdrive-17e53-default-rtdb.asia-southeast1.firebasedatabase.app`

4. **STAFF_PIN**
   - Value: `1234` (or your preferred PIN)

5. **FIREBASE_SERVICE_ACCOUNT** (Important!)
   - Click "Add from .env"
   - Paste your entire Firebase service account JSON as a single line:
   ```
   {"type":"service_account","project_id":"testdrive-17e53",...}
   ```

## Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://byd-queue-api.onrender.com`

## Step 5: Update Frontend to Use API URL

After API is deployed, update Vercel environment variable:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Update `PUBLIC_API_URL`:
   - Value: `https://byd-queue-api.onrender.com` (your Render URL)
4. Redeploy frontend

## Step 6: Initialize Firebase Database

After API is deployed, run the initialization:

```bash
# Visit this URL in your browser to initialize:
https://byd-queue-api.onrender.com/api/health

# Then initialize the database by calling:
curl -X POST https://byd-queue-api.onrender.com/api/init
```

Or use the init script locally pointing to production:
```bash
# Update apps/api/.env temporarily with production URL
# Then run:
npm run init-firebase --workspace=apps/api
```

## Step 7: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try registering a customer
3. Check if queue number is generated
4. Test staff panel login
5. Test MC view and display screen

## Troubleshooting

### API not starting:
- Check Render logs: Dashboard → Your Service → Logs
- Verify all environment variables are set
- Make sure Firebase credentials are correct

### Frontend can't connect to API:
- Check CORS settings in `apps/api/src/server.js`
- Verify `PUBLIC_API_URL` in Vercel matches your Render URL
- Check browser console for errors

### Database errors:
- Verify `FIREBASE_DATABASE_URL` is correct
- Check Firebase service account JSON is valid
- Ensure Firebase Realtime Database is enabled

## Important Notes

### Free Tier Limitations:
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Good for testing, but consider paid tier for production event

### For Production Event (Feb 28, 2026):
Consider upgrading to Render's paid tier ($7/month) for:
- No spin-down delays
- Better performance
- More reliable for live event

## Alternative: Deploy to Railway

If Render doesn't work, try Railway:

1. Go to https://railway.app/
2. Sign in with GitHub
3. New Project → Deploy from GitHub
4. Select your repository
5. Set Root Directory: `apps/api`
6. Add same environment variables
7. Deploy!

Railway also has a free tier and is very reliable.

## Your Deployment URLs

After deployment, you'll have:

- **Frontend:** https://your-project.vercel.app
- **Backend API:** https://byd-queue-api.onrender.com
- **Registration:** https://your-project.vercel.app/
- **Staff Panel:** https://your-project.vercel.app/staff
- **MC View:** https://your-project.vercel.app/mc?branch=MAIN
- **TV Display:** https://your-project.vercel.app/screen?branch=MAIN

## Next Steps

1. Deploy API to Render (follow steps above)
2. Get your API URL
3. Update Vercel environment variable
4. Test everything
5. Seed test data if needed
6. Ready for your event! 🎉
