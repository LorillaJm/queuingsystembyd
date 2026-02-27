# Deployment Steps - Quick Guide

## ✅ Prerequisites Installed
- Node.js v24.14.0 ✓
- npm 11.8.0 ✓
- Vercel CLI ✓

## 🚀 Deployment Options

### Option 1: Deploy Web App to Vercel (Recommended - Free)

#### Step 1: Build the Web App
```bash
cd apps/web
npm install
npm run build
```

#### Step 2: Deploy to Vercel
```bash
vercel login
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **byd-queue-system**
- Directory? **./apps/web**
- Override settings? **No**

You'll get a URL like: `https://byd-queue-system.vercel.app`

---

### Option 2: Deploy API to Render (Free Tier)

#### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with email or GitHub

#### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Choose "Deploy from Git" or "Deploy without Git"

#### Step 3: Configure Service (If using Git)
- **Repository**: Connect your GitHub repo
- **Name**: `byd-queue-api`
- **Region**: Singapore
- **Branch**: `main`
- **Root Directory**: `apps/api`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Step 4: Add Environment Variables
```
NODE_ENV=production
PORT=10000
FIREBASE_DATABASE_URL=<your-firebase-url>
STAFF_PIN=<your-pin>
CORS_ORIGIN=*
TZ=Asia/Manila
```

For FIREBASE_SERVICE_ACCOUNT:
- Copy content from `apps/api/firebase-service-account.json`
- Paste as environment variable

#### Step 5: Deploy
Click "Create Web Service" and wait 5-10 minutes

You'll get a URL like: `https://byd-queue-api.onrender.com`

---

### Option 3: Deploy Both Together (Full Stack)

#### Step 1: Deploy API First (Follow Option 2)
Get your API URL: `https://byd-queue-api.onrender.com`

#### Step 2: Update Web App API URL
Edit `apps/web/src/lib/api.js`:
```javascript
const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? 'https://byd-queue-api.onrender.com'  // Your Render API URL
  : 'http://localhost:3001';
```

#### Step 3: Deploy Web App (Follow Option 1)

#### Step 4: Update CORS on API
In Render dashboard, update environment variable:
```
CORS_ORIGIN=https://your-vercel-url.vercel.app
```

---

## 🧪 Testing After Deployment

### Test API
```bash
curl https://your-api-url.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "firebase": "connected"
}
```

### Test Web App
1. Open your Vercel URL
2. Try registering a customer
3. Check queue number generation
4. Test staff panel
5. Test real-time updates

---

## 📱 Access Your Deployed App

After deployment, you can access:

- **Registration**: `https://your-app.vercel.app`
- **TV Display**: `https://your-app.vercel.app/screen?branch=MAIN`
- **MC View**: `https://your-app.vercel.app/mc?branch=MAIN`
- **Staff Panel**: `https://your-app.vercel.app/staff`

---

## 🔧 Troubleshooting

### Web App Can't Connect to API
- Check API URL in `apps/web/src/lib/api.js`
- Verify API is running
- Check CORS settings

### API Not Starting
- Check Render logs
- Verify environment variables
- Check Firebase connection

### Build Errors
```bash
# Clear cache and rebuild
cd apps/web
rm -rf node_modules .svelte-kit build
npm install
npm run build
```

---

## 💰 Cost

### Free Tier (Current Setup)
- Vercel: Free (unlimited bandwidth)
- Render: Free (750 hours/month, sleeps after 15 min)
- Firebase: Free (1GB storage)
- **Total: $0/month**

### Paid Tier (Always On)
- Vercel: Free
- Render: $7/month (no sleep)
- Firebase: Free
- **Total: $7/month**

---

## 🎯 Quick Commands

```bash
# Deploy web app only
cd apps/web
vercel --prod

# Redeploy after changes
cd apps/web
npm run build
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

---

## ✅ Deployment Checklist

- [ ] API deployed to Render
- [ ] Environment variables configured
- [ ] API health check passes
- [ ] Web app deployed to Vercel
- [ ] Registration flow works
- [ ] Queue numbers generated
- [ ] Staff panel accessible
- [ ] Real-time updates working
- [ ] Test Drive modal works
- [ ] Reservation modal works
- [ ] Camera capture works

---

## 📞 Support

If you need help:
1. Check Render logs for API errors
2. Check browser console for frontend errors
3. Verify environment variables
4. Test API endpoints with curl

---

Ready to deploy? Start with Option 1 (Web App to Vercel) - it's the easiest!
