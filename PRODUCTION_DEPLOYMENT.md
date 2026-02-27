# Production Deployment Guide

Complete guide for deploying the Queue Management System to production.

## Pre-Deployment Checklist

### Security
- [ ] Change default STAFF_PIN in Settings collection
- [ ] Use strong MongoDB password
- [ ] Configure CORS_ORIGIN to production domain
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Review rate limiting settings
- [ ] Set NODE_ENV=production
- [ ] Whitelist production IPs in MongoDB Atlas

### Configuration
- [ ] Set TZ=Asia/Manila for correct timezone
- [ ] Configure all environment variables
- [ ] Test MongoDB connection from production
- [ ] Verify Socket.io works across domains
- [ ] Test daily reset at midnight Manila time

### Testing
- [ ] Run all automated tests
- [ ] Test registration flow
- [ ] Test staff operations
- [ ] Test real-time updates
- [ ] Test with multiple concurrent users
- [ ] Verify no duplicate queue numbers
- [ ] Test daily reset behavior
- [ ] Test all three views (screen, MC, staff)

---

## MongoDB Atlas Setup

### 1. Create Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account or login
3. Create new cluster (M0 Free tier or higher)
4. Choose region closest to your deployment
5. Wait for cluster to be created (~5-10 minutes)

### 2. Configure Database Access

1. Go to Database Access
2. Add New Database User
3. Choose Password authentication
4. Username: `queueadmin` (or your choice)
5. Password: Generate strong password
6. Database User Privileges: Read and write to any database
7. Save

### 3. Configure Network Access

1. Go to Network Access
2. Add IP Address
3. Options:
   - **Development**: Add your current IP
   - **Production**: Add your server IPs
   - **Quick (less secure)**: Allow access from anywhere (0.0.0.0/0)
4. Save

### 4. Get Connection String

1. Go to Database → Connect
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy connection string
5. Replace `<password>` with your database password
6. Add database name: `/queue-system`

Example:
```
mongodb+srv://queueadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/queue-system?retryWrites=true&w=majority
```

### 5. Initialize Settings

After first deployment, initialize settings:

```bash
# Connect to MongoDB and run:
use queue-system

db.settings.insertOne({
  _id: "app_settings",
  staffPin: "YOUR_SECURE_PIN",
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

---

## Deployment Options

### Option 1: Railway (Recommended)

#### API Deployment

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Deploy API**
   ```bash
   cd apps/api
   railway init
   railway up
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set MONGODB_URI="your-mongodb-uri"
   railway variables set STAFF_PIN="your-secure-pin"
   railway variables set NODE_ENV="production"
   railway variables set TZ="Asia/Manila"
   railway variables set CORS_ORIGIN="https://your-web-app.vercel.app"
   ```

5. **Get API URL**
   - Railway provides: `https://your-app.railway.app`
   - Note this for web app configuration

#### Web Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd apps/web
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add:
     ```
     PUBLIC_API_URL=https://your-api.railway.app
     PUBLIC_SOCKET_URL=https://your-api.railway.app
     ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

### Option 2: Render

#### API Deployment

1. **Create Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository
   - Settings:
     - Name: `queue-api`
     - Root Directory: `apps/api`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Instance Type: Free or Starter

3. **Environment Variables**
   ```
   MONGODB_URI=your-mongodb-uri
   STAFF_PIN=your-secure-pin
   NODE_ENV=production
   TZ=Asia/Manila
   CORS_ORIGIN=https://your-web-app.vercel.app
   PORT=3001
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (~5-10 minutes)
   - Note the URL: `https://queue-api.onrender.com`

#### Web Deployment (Vercel)

Same as Railway option above.

---

### Option 3: Heroku

#### API Deployment

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd apps/api
   heroku create queue-api
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-uri"
   heroku config:set STAFF_PIN="your-secure-pin"
   heroku config:set NODE_ENV="production"
   heroku config:set TZ="Asia/Manila"
   heroku config:set CORS_ORIGIN="https://your-web-app.vercel.app"
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

---

## Environment Variables Reference

### API (.env)

```bash
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/queue-system
STAFF_PIN=your-secure-pin-here
NODE_ENV=production
CORS_ORIGIN=https://your-web-app.vercel.app

# Optional
PORT=3001
TZ=Asia/Manila
```

### Web (.env)

```bash
# Required
PUBLIC_API_URL=https://your-api.railway.app
PUBLIC_SOCKET_URL=https://your-api.railway.app
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check API health
curl https://your-api.railway.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "timezone": "Asia/Manila",
  "mongodb": "connected"
}
```

### 2. Test Registration

```bash
curl -X POST https://your-api.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "mobile": "+1234567890",
    "model": "Test Model",
    "branch": "MAIN",
    "purpose": "TEST_DRIVE"
  }'
```

### 3. Test Staff Authentication

```bash
curl -X POST https://your-api.railway.app/api/staff/auth \
  -H "Content-Type: application/json" \
  -d '{"pin": "your-secure-pin"}'
```

### 4. Access Web App

- Registration: `https://your-web-app.vercel.app`
- TV Screen: `https://your-web-app.vercel.app/screen?branch=MAIN`
- MC View: `https://your-web-app.vercel.app/mc?branch=MAIN`
- Staff Panel: `https://your-web-app.vercel.app/staff`

---

## Monitoring & Maintenance

### Logging

**Railway/Render:**
- View logs in dashboard
- Set up log drains for external services

**Recommended Services:**
- Logtail
- Papertrail
- Datadog

### Error Tracking

**Recommended:**
- Sentry (https://sentry.io)
- Rollbar
- Bugsnag

**Setup:**
```bash
npm install @sentry/node
```

Add to `server.js`:
```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### Uptime Monitoring

**Free Options:**
- UptimeRobot (https://uptimerobot.com)
- Pingdom
- StatusCake

**Setup:**
- Monitor: `https://your-api.railway.app/health`
- Check interval: 5 minutes
- Alert on: Down, Slow response

### Database Backups

**MongoDB Atlas:**
1. Go to Clusters → Backup
2. Enable Cloud Backup
3. Configure backup schedule
4. Test restore process

---

## Scaling Considerations

### Horizontal Scaling

**For multiple API instances:**

1. **Add Redis for Socket.io**
   ```bash
   npm install @socket.io/redis-adapter redis
   ```

2. **Update server.js**
   ```javascript
   import { createAdapter } from '@socket.io/redis-adapter';
   import { createClient } from 'redis';
   
   const pubClient = createClient({ url: process.env.REDIS_URL });
   const subClient = pubClient.duplicate();
   
   await Promise.all([pubClient.connect(), subClient.connect()]);
   io.adapter(createAdapter(pubClient, subClient));
   ```

3. **Deploy Redis**
   - Railway: Add Redis service
   - Render: Add Redis instance
   - Upstash: Free Redis (https://upstash.com)

### Database Scaling

**MongoDB Atlas:**
- Upgrade to M10+ for auto-scaling
- Enable sharding for high volume
- Add read replicas for read-heavy workloads

---

## Troubleshooting

### Issue: MongoDB Connection Failed

**Symptoms:**
- API won't start
- "MongoDB connection error" in logs

**Solutions:**
1. Check connection string is correct
2. Verify password doesn't have special characters
3. Whitelist server IP in MongoDB Atlas
4. Check network connectivity
5. Verify database name in connection string

### Issue: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- API requests fail from web app

**Solutions:**
1. Verify CORS_ORIGIN matches web app URL exactly
2. Include protocol (https://)
3. No trailing slash
4. Redeploy API after changing CORS_ORIGIN

### Issue: Socket.io Not Connecting

**Symptoms:**
- Real-time updates don't work
- Connection indicator shows red

**Solutions:**
1. Verify WebSocket support on hosting platform
2. Check CORS_ORIGIN includes web app URL
3. Ensure HTTPS is used in production
4. Check browser console for errors
5. Verify Socket.io URL matches API URL

### Issue: Daily Reset Not Working

**Symptoms:**
- Queue numbers don't reset at midnight
- Numbers continue from previous day

**Solutions:**
1. Verify TZ=Asia/Manila is set
2. Check server timezone: `date` command
3. Verify dateKey generation uses correct timezone
4. Check MongoDB documents have correct dateKey format

### Issue: Duplicate Queue Numbers

**Symptoms:**
- Two registrations get same queue number
- Database unique constraint errors

**Solutions:**
1. Verify MongoDB indexes are created
2. Check atomic $inc operation is used
3. Review QueueState collection for corruption
4. Restart API server
5. Check for multiple API instances without Redis

---

## Security Checklist

- [ ] HTTPS enabled (automatic on Vercel/Railway/Render)
- [ ] Strong STAFF_PIN (min 8 characters, mixed case, numbers)
- [ ] Strong MongoDB password
- [ ] CORS restricted to production domain
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled
- [ ] Request size limits configured
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Environment variables not in code
- [ ] Secrets not in git repository
- [ ] Error messages don't leak sensitive data

---

## Performance Optimization

### API
- [x] Compression enabled
- [x] MongoDB indexes created
- [x] Lean queries used
- [x] Connection pooling configured
- [ ] Add Redis caching (optional)
- [ ] Enable CDN for static assets

### Web
- [ ] Build for production: `npm run build`
- [ ] Enable Vercel Edge Network
- [ ] Optimize images
- [ ] Lazy load components
- [ ] Enable service worker (optional)

---

## Cost Estimates

### Free Tier (Development/Testing)
- MongoDB Atlas: Free (M0, 512MB)
- Railway: $5 credit/month
- Vercel: Free (Hobby)
- **Total: $0-5/month**

### Production (Small Scale)
- MongoDB Atlas: $9/month (M2, 2GB)
- Railway: $20/month (Pro)
- Vercel: Free or $20/month (Pro)
- **Total: $29-49/month**

### Production (Medium Scale)
- MongoDB Atlas: $57/month (M10, 10GB)
- Railway: $50/month
- Vercel: $20/month
- Redis: $10/month (Upstash)
- **Total: $137/month**

---

## Support & Resources

### Documentation
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
- Socket.io: https://socket.io/docs

### Community
- MongoDB Community: https://community.mongodb.com
- Railway Discord: https://discord.gg/railway
- Vercel Discord: https://vercel.com/discord

---

## Rollback Procedure

### Quick Rollback

**Railway:**
```bash
railway rollback
```

**Vercel:**
```bash
vercel rollback
```

### Manual Rollback

1. **Tag current version**
   ```bash
   git tag v1.0.0
   git push --tags
   ```

2. **Revert to previous version**
   ```bash
   git checkout v0.9.0
   git push -f origin main
   ```

3. **Redeploy**
   - Railway/Render: Auto-deploys on push
   - Vercel: `vercel --prod`

---

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Verify daily reset worked

### Weekly
- [ ] Review performance metrics
- [ ] Check database storage usage
- [ ] Review rate limit hits
- [ ] Check for security updates

### Monthly
- [ ] Update dependencies
- [ ] Review and rotate secrets
- [ ] Test backup restore
- [ ] Review scaling needs
- [ ] Check cost optimization

---

## Emergency Contacts

**Platform Support:**
- Railway: support@railway.app
- Render: support@render.com
- Vercel: support@vercel.com
- MongoDB Atlas: https://support.mongodb.com

**Escalation:**
- Document on-call procedures
- Set up PagerDuty or similar
- Define SLA requirements
- Create runbook for common issues
