# Quick Deployment Guide - BYD Queue System

## Current Status
✅ All features implemented and tested locally
✅ Firebase Realtime Database configured
✅ Ready for production deployment

## Deployment Architecture
- **API Backend**: Render.com (Free tier available)
- **Web Frontend**: Vercel (Free tier available)
- **Database**: Firebase Realtime Database (Already configured)

---

## Step 1: Deploy API to Render

### 1.1 Prepare for Deployment
```bash
# Make sure you're in the project root
cd apps/api

# Verify your .env file has all required variables
# FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
# FIREBASE_SERVICE_ACCOUNT=<your-service-account-json>
# STAFF_PIN=your-secure-pin
```

### 1.2 Deploy to Render

**Option A: Using Render Dashboard (Recommended)**

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `byd-queue-api`
   - **Region**: Singapore (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   STAFF_PIN=your-secure-pin-here
   CORS_ORIGIN=*
   TZ=Asia/Manila
   ```

6. For FIREBASE_SERVICE_ACCOUNT:
   - Copy the entire content of `apps/api/firebase-service-account.json`
   - Paste it as a single-line JSON string (or use the file upload feature)

7. Click "Create Web Service"

8. Wait for deployment (5-10 minutes)

9. **Save your API URL**: `https://byd-queue-api.onrender.com`

**Option B: Using render.yaml (Automated)**

1. Update `apps/api/render.yaml` with your values
2. Push to GitHub
3. In Render Dashboard, click "New +" → "Blueprint"
4. Connect repository and select `apps/api/render.yaml`
5. Add environment variables in Render dashboard

---

## Step 2: Deploy Web to Vercel

### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 2.2 Configure API URL

Update `apps/web/src/lib/api.js` to use your Render API URL:

```javascript
// Change this line:
const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? `${window.location.protocol}//${window.location.hostname}/api`
  : 'http://localhost:3001';

// To this:
const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? 'https://byd-queue-api.onrender.com'  // Your Render API URL
  : 'http://localhost:3001';
```

### 2.3 Deploy to Vercel

```bash
# Navigate to web app
cd apps/web

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? byd-queue-web
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### 2.4 Get Your URLs

After deployment, you'll get:
- **Web URL**: `https://byd-queue-web.vercel.app`
- **API URL**: `https://byd-queue-api.onrender.com`

---

## Step 3: Update CORS Configuration

Go back to Render dashboard and update the API environment variable:

```
CORS_ORIGIN=https://byd-queue-web.vercel.app
```

Then redeploy the API service.

---

## Step 4: Test Your Deployment

### 4.1 Test API Health
```bash
curl https://byd-queue-api.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "uptime": 123.45,
  "environment": "production",
  "timezone": "Asia/Manila",
  "firebase": "connected"
}
```

### 4.2 Test Web App

1. Open `https://byd-queue-web.vercel.app`
2. Try registering a customer
3. Check if queue number is generated
4. Open staff panel: `https://byd-queue-web.vercel.app/staff`
5. Test real-time updates

---

## Step 5: Custom Domain (Optional)

### For Web App (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `queue.bydiloilo.com`)
3. Configure DNS records as instructed by Vercel
4. SSL is automatic

### For API (Render)

1. Go to Render Dashboard → Your Service → Settings
2. Add custom domain (e.g., `api.bydiloilo.com`)
3. Configure DNS CNAME record
4. SSL is automatic

---

## Troubleshooting

### API Issues

**Problem**: API not responding
```bash
# Check Render logs
# Go to Render Dashboard → Your Service → Logs
```

**Problem**: Firebase connection error
- Verify FIREBASE_DATABASE_URL is correct
- Check FIREBASE_SERVICE_ACCOUNT JSON is valid
- Ensure Firebase Realtime Database rules allow access

**Problem**: CORS errors
- Update CORS_ORIGIN to match your Vercel URL
- Redeploy API after changing environment variables

### Web App Issues

**Problem**: Can't connect to API
- Check API URL in `apps/web/src/lib/api.js`
- Verify API is running: `curl https://your-api-url/health`
- Check browser console for errors

**Problem**: Socket.io not connecting
- Verify API URL includes protocol (https://)
- Check CORS configuration on API
- Ensure WebSocket support is enabled (automatic on Render)

---

## Quick Commands Reference

### Redeploy API (Render)
- Go to Render Dashboard → Your Service → Manual Deploy → "Deploy latest commit"

### Redeploy Web (Vercel)
```bash
cd apps/web
vercel --prod
```

### View Logs

**API Logs (Render)**:
- Render Dashboard → Your Service → Logs

**Web Logs (Vercel)**:
```bash
vercel logs
```

---

## Environment Variables Checklist

### API (Render)
- [x] NODE_ENV=production
- [x] PORT=10000
- [x] FIREBASE_DATABASE_URL
- [x] FIREBASE_SERVICE_ACCOUNT
- [x] STAFF_PIN
- [x] CORS_ORIGIN
- [x] TZ=Asia/Manila

### Web (Vercel)
- No environment variables needed (API URL is hardcoded)

---

## Cost Estimate

### Free Tier (Current Setup)
- **Render**: Free tier (750 hours/month, sleeps after 15 min inactivity)
- **Vercel**: Free tier (unlimited bandwidth for personal projects)
- **Firebase**: Free tier (1GB storage, 10GB/month bandwidth)
- **Total**: $0/month

### Paid Tier (Recommended for Production)
- **Render**: $7/month (always on, no sleep)
- **Vercel**: Free or $20/month (Pro features)
- **Firebase**: Free tier sufficient for most use cases
- **Total**: $7-27/month

---

## Post-Deployment Checklist

- [ ] API health check passes
- [ ] Web app loads correctly
- [ ] Registration flow works
- [ ] Queue numbers are generated
- [ ] Staff panel accessible
- [ ] Real-time updates working
- [ ] Test Drive modal works
- [ ] Reservation modal works
- [ ] Vehicle selection works
- [ ] Camera capture works (test on mobile)
- [ ] Search and edit works
- [ ] All screens display correctly (TV, MC, Staff)

---

## Support

If you encounter issues:

1. Check Render logs for API errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test API endpoints directly with curl
5. Ensure Firebase Realtime Database is accessible

---

## Next Steps After Deployment

1. **Monitor Performance**
   - Check Render metrics
   - Monitor Firebase usage
   - Set up uptime monitoring (UptimeRobot)

2. **Security**
   - Change default STAFF_PIN
   - Review Firebase security rules
   - Enable rate limiting if needed

3. **Backups**
   - Firebase has automatic backups
   - Keep code in Git repository
   - Document any manual configurations

4. **Updates**
   - Test changes locally first
   - Deploy to Vercel/Render
   - Monitor for errors after deployment

---

## Quick Start Commands

```bash
# Deploy everything from scratch

# 1. Deploy API to Render (use dashboard)
# 2. Deploy Web to Vercel
cd apps/web
vercel login
vercel --prod

# 3. Test
curl https://your-api-url/health
open https://your-web-url

# Done! 🎉
```
