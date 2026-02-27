# Deployment Guide

## Production Deployment Options

### Option 1: Railway (Recommended for API)

#### API Deployment on Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy API**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Navigate to API
   cd apps/api
   
   # Initialize
   railway init
   
   # Add environment variables
   railway variables set MONGODB_URI="your-mongodb-uri"
   railway variables set STAFF_PIN="your-pin"
   railway variables set NODE_ENV="production"
   railway variables set CORS_ORIGIN="https://your-web-app.vercel.app"
   
   # Deploy
   railway up
   ```

3. **Get API URL**
   - Railway will provide a URL like: `https://your-app.railway.app`
   - Note this URL for web app configuration

### Option 2: Render (Alternative for API)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository
   - Root Directory: `apps/api`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables**
   ```
   MONGODB_URI=your-mongodb-uri
   STAFF_PIN=your-pin
   NODE_ENV=production
   CORS_ORIGIN=https://your-web-app.vercel.app
   PORT=3001
   ```

### Option 3: Vercel (Recommended for Web)

#### Web Deployment on Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy Web App**
   ```bash
   cd apps/web
   
   # Login
   vercel login
   
   # Deploy
   vercel
   
   # Follow prompts
   ```

3. **Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     ```
     PUBLIC_API_URL=https://your-api.railway.app
     PUBLIC_SOCKET_URL=https://your-api.railway.app
     ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 4: Netlify (Alternative for Web)

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   cd apps/web
   
   # Build
   npm run build
   
   # Deploy
   netlify deploy --prod --dir=build
   ```

3. **Environment Variables**
   - Netlify Dashboard → Site Settings → Environment Variables
   - Add PUBLIC_API_URL and PUBLIC_SOCKET_URL

## MongoDB Atlas Production Setup

1. **Upgrade to Shared Cluster (Optional)**
   - Better performance
   - More storage
   - Automated backups

2. **Configure Network Access**
   - Add your production server IPs
   - Or use 0.0.0.0/0 (allow all) with strong authentication

3. **Create Production Database User**
   - Different credentials from development
   - Strong password
   - Appropriate permissions

4. **Enable Monitoring**
   - Set up alerts for high CPU/memory
   - Monitor slow queries
   - Track connection count

## Environment Variables Checklist

### API (.env)
```env
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/queue-system
STAFF_PIN=your-secure-pin-here
NODE_ENV=production
CORS_ORIGIN=https://your-web-app.vercel.app
```

### Web (.env)
```env
PUBLIC_API_URL=https://your-api.railway.app
PUBLIC_SOCKET_URL=https://your-api.railway.app
```

## Pre-Deployment Checklist

### Security
- [ ] Change default STAFF_PIN
- [ ] Use strong MongoDB password
- [ ] Configure CORS_ORIGIN to your actual domain
- [ ] Enable HTTPS (automatic on Vercel/Railway/Render)
- [ ] Review rate limiting settings
- [ ] Whitelist only necessary IPs in MongoDB Atlas

### Configuration
- [ ] Set NODE_ENV=production
- [ ] Configure all environment variables
- [ ] Test MongoDB connection from production server
- [ ] Verify Socket.io connection works across domains

### Testing
- [ ] Test registration flow
- [ ] Test real-time updates
- [ ] Test staff panel functionality
- [ ] Test on multiple devices
- [ ] Test with multiple concurrent users
- [ ] Verify error handling

### Performance
- [ ] Enable compression (automatic on most platforms)
- [ ] Configure CDN for static assets
- [ ] Monitor API response times
- [ ] Check database query performance
- [ ] Test with realistic load

## Post-Deployment

### Monitoring

1. **Application Monitoring**
   - Set up error tracking (Sentry)
   - Monitor API response times
   - Track Socket.io connections
   - Monitor memory usage

2. **Database Monitoring**
   - MongoDB Atlas built-in monitoring
   - Set up alerts for slow queries
   - Monitor connection pool usage
   - Track storage usage

3. **Uptime Monitoring**
   - Use UptimeRobot or similar
   - Monitor /health endpoint
   - Set up alerts for downtime

### Logging

1. **Structured Logging**
   ```bash
   npm install winston
   ```

2. **Log Aggregation**
   - Use Railway/Render built-in logs
   - Or set up external service (Logtail, Papertrail)

### Backups

1. **MongoDB Atlas Backups**
   - Enable automated backups
   - Test restore process
   - Set retention policy

2. **Code Backups**
   - Ensure code is in Git
   - Tag releases
   - Document deployment process

## Scaling Considerations

### Horizontal Scaling (Multiple API Instances)

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

3. **Deploy Multiple Instances**
   - Railway/Render support auto-scaling
   - Configure load balancer

### Database Scaling

1. **Connection Pooling**
   - Already configured in Mongoose
   - Adjust pool size if needed

2. **Indexes**
   - Already configured
   - Monitor slow queries
   - Add indexes as needed

3. **Sharding**
   - For very high volume
   - MongoDB Atlas supports sharding

## Custom Domain Setup

### Web App (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., queue.yourdomain.com)
3. Configure DNS records as instructed
4. SSL certificate is automatic

### API (Railway)

1. Go to Railway Dashboard → Your Project → Settings
2. Add custom domain
3. Configure DNS CNAME record
4. SSL certificate is automatic

## Troubleshooting Production Issues

### API Not Responding
- Check Railway/Render logs
- Verify environment variables
- Test MongoDB connection
- Check CORS configuration

### Socket.io Not Connecting
- Verify WebSocket support on hosting platform
- Check CORS_ORIGIN setting
- Ensure HTTPS is used
- Check browser console for errors

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist
- Check connection string
- Verify database user permissions
- Monitor connection pool

### High Response Times
- Check database query performance
- Monitor API server resources
- Consider adding Redis cache
- Review rate limiting settings

## Cost Estimates

### Free Tier (Development/Small Scale)
- MongoDB Atlas: Free (M0 cluster)
- Railway: $5/month credit (free tier)
- Vercel: Free (hobby plan)
- **Total: $0-5/month**

### Production (Medium Scale)
- MongoDB Atlas: $9/month (M2 cluster)
- Railway: $20/month (Pro plan)
- Vercel: Free or $20/month (Pro)
- **Total: $29-49/month**

### High Scale
- MongoDB Atlas: $57+/month (M10+ cluster)
- Railway: $50+/month
- Vercel: $20/month
- Redis: $10+/month
- **Total: $137+/month**

## Rollback Procedure

1. **Keep Previous Version Tagged**
   ```bash
   git tag v1.0.0
   git push --tags
   ```

2. **Quick Rollback**
   ```bash
   # Railway
   railway rollback
   
   # Vercel
   vercel rollback
   ```

3. **Manual Rollback**
   - Checkout previous tag
   - Redeploy

## Support and Maintenance

### Regular Tasks
- [ ] Monitor error logs weekly
- [ ] Review performance metrics
- [ ] Check database storage usage
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Test backup restore quarterly

### Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test thoroughly
npm test

# Deploy
```

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Socket.io Deployment Guide](https://socket.io/docs/v4/deployment/)
