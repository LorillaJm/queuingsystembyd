# Deployment Quick Reference

One-page reference for deploying the Queue Management System.

---

## 🚀 Quick Deploy (Railway + Vercel)

### 1. MongoDB Atlas (5 minutes)

```bash
# 1. Create account at https://www.mongodb.com/cloud/atlas
# 2. Create M0 Free cluster
# 3. Add database user (username: queueadmin, generate password)
# 4. Whitelist IP: 0.0.0.0/0 (or specific IPs)
# 5. Get connection string:
mongodb+srv://queueadmin:PASSWORD@cluster0.xxxxx.mongodb.net/queue-system
```

### 2. Initialize Settings

```javascript
// Connect to MongoDB and run:
use queue-system

db.settings.insertOne({
  _id: "app_settings",
  staffPin: "YOUR_SECURE_PIN",  // CHANGE THIS!
  allowedBranches: [
    { code: "MAIN", name: "Main Branch", prefix: "A", active: true },
    { code: "NORTH", name: "North Branch", prefix: "B", active: true },
    { code: "SOUTH", name: "South Branch", prefix: "C", active: true }
  ],
  purposes: ["TEST_DRIVE", "SERVICE", "INQUIRY", "PURCHASE"],
  dailyResetTime: "00:00",
  maxQueuePerDay: 999,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 3. Deploy API to Railway (5 minutes)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
cd apps/api
railway login
railway init
railway up

# Set environment variables
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set STAFF_PIN="your-secure-pin"
railway variables set NODE_ENV="production"
railway variables set TZ="Asia/Manila"
railway variables set CORS_ORIGIN="https://your-app.vercel.app"

# Get API URL (e.g., https://queue-api.railway.app)
railway status
```

### 4. Deploy Web to Vercel (5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel

# Set environment variables in Vercel dashboard:
# Settings → Environment Variables
PUBLIC_API_URL=https://queue-api.railway.app
PUBLIC_SOCKET_URL=https://queue-api.railway.app

# Deploy to production
vercel --prod

# Get web URL (e.g., https://queue-system.vercel.app)
```

### 5. Update CORS (2 minutes)

```bash
# Update API CORS_ORIGIN with actual Vercel URL
railway variables set CORS_ORIGIN="https://queue-system.vercel.app"

# Redeploy API
railway up
```

### 6. Verify Deployment (5 minutes)

```bash
# Test API health
curl https://queue-api.railway.app/health

# Test registration
curl -X POST https://queue-api.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "mobile": "+63 912 345 6789",
    "model": "Toyota Camry",
    "branch": "MAIN",
    "purpose": "TEST_DRIVE"
  }'

# Open web app
open https://queue-system.vercel.app
```

---

## 🔧 Environment Variables

### API (.env)
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/queue-system
STAFF_PIN=your-secure-pin
NODE_ENV=production
CORS_ORIGIN=https://your-web-app.vercel.app
PORT=3001
TZ=Asia/Manila
```

### Web (.env)
```bash
PUBLIC_API_URL=https://your-api.railway.app
PUBLIC_SOCKET_URL=https://your-api.railway.app
```

---

## 📱 Access URLs

After deployment, access:

- **Registration**: `https://your-app.vercel.app`
- **TV Display**: `https://your-app.vercel.app/screen?branch=MAIN`
- **MC View**: `https://your-app.vercel.app/mc?branch=MAIN`
- **Staff Panel**: `https://your-app.vercel.app/staff`
- **API Health**: `https://your-api.railway.app/health`

---

## 🔒 Security Checklist

Before going live:

- [ ] Change STAFF_PIN from default (1234)
- [ ] Use strong MongoDB password (16+ chars)
- [ ] Set CORS_ORIGIN to exact production domain
- [ ] Verify NODE_ENV=production
- [ ] Whitelist production IPs in MongoDB Atlas
- [ ] Test all endpoints with production URLs
- [ ] Set up uptime monitoring
- [ ] Configure error tracking (Sentry)

---

## 🐛 Common Issues

### Issue: CORS Error
**Fix**: Verify CORS_ORIGIN matches web app URL exactly (with https://, no trailing slash)

### Issue: MongoDB Connection Failed
**Fix**: Check connection string, whitelist IPs in MongoDB Atlas

### Issue: Socket.io Not Connecting
**Fix**: Verify PUBLIC_SOCKET_URL matches API URL, check CORS_ORIGIN

### Issue: 404 on API Endpoints
**Fix**: Verify API is deployed and running, check Railway logs

---

## 📊 Monitoring Setup

### UptimeRobot (Free)
1. Go to https://uptimerobot.com
2. Add monitor: `https://your-api.railway.app/health`
3. Check interval: 5 minutes
4. Alert email: your-email@example.com

### Sentry (Free Tier)
```bash
# Install
npm install @sentry/node

# Add to server.js
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

## 🔄 Update Deployment

### Update API
```bash
cd apps/api
git pull
railway up
```

### Update Web
```bash
cd apps/web
git pull
vercel --prod
```

---

## 📞 Support Resources

- **Full Guide**: PRODUCTION_DEPLOYMENT.md
- **Testing**: QA_TESTING_CHECKLIST.md
- **Troubleshooting**: README.md (Troubleshooting section)
- **API Examples**: apps/api/API_EXAMPLES.md

---

## 💰 Cost Estimate

### Free Tier (Testing)
- MongoDB Atlas M0: Free
- Railway: $5 credit/month
- Vercel: Free
- **Total: $0-5/month**

### Production (Small)
- MongoDB Atlas M2: $9/month
- Railway Pro: $20/month
- Vercel: Free or $20/month
- **Total: $29-49/month**

---

## ✅ Deployment Complete!

Your queue management system is now live at:
- Web: `https://your-app.vercel.app`
- API: `https://your-api.railway.app`

Next steps:
1. Test all features with QA checklist
2. Set up monitoring
3. Train staff on using the system
4. Gather user feedback

---

**Need Help?** Check PRODUCTION_DEPLOYMENT.md for detailed instructions.
