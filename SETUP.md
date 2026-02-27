# Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. MongoDB Atlas account (free tier works)

## Step-by-Step Setup

### 1. MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account or login
3. Create a new cluster (free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Replace `<password>` with your actual password
7. Add `/queue-system` at the end: `mongodb+srv://username:password@cluster.mongodb.net/queue-system`

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install API dependencies
cd apps/api
npm install

# Install Web dependencies
cd ../web
npm install
cd ../..
```

### 3. Configure Environment Variables

#### API Configuration

```bash
# Copy example file
cp apps/api/.env.example apps/api/.env

# Edit apps/api/.env with your values:
# - Replace MONGODB_URI with your MongoDB Atlas connection string
# - Change STAFF_PIN if desired (default: 1234)
```

#### Web Configuration

```bash
# Copy example file
cp apps/web/.env.example apps/web/.env

# Default values should work for local development
```

### 4. Start the Application

Open two terminal windows:

#### Terminal 1 - API Server
```bash
cd apps/api
npm run dev
```

You should see:
```
✓ Connected to MongoDB
✓ Server running on port 3001
✓ Environment: development
```

#### Terminal 2 - Web Application
```bash
cd apps/web
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 5. Access the Application

- Registration Form: http://localhost:5173
- TV Display Screen: http://localhost:5173/display
- MC Announcer View: http://localhost:5173/mc
- Staff Control Panel: http://localhost:5173/staff

Default Staff PIN: `1234`

## Testing the System

1. Open http://localhost:5173 and register a customer
2. Open http://localhost:5173/display in another window (simulates TV screen)
3. Open http://localhost:5173/staff and login with PIN `1234`
4. Click "Call Next Customer" in staff panel
5. Watch the display screen update in real-time

## Troubleshooting

### MongoDB Connection Issues

If you see "MongoDB connection error":
- Verify your connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas (Network Access)
- Ensure password doesn't contain special characters that need URL encoding

### Port Already in Use

If port 3001 or 5173 is already in use:
- Change PORT in `apps/api/.env`
- Update PUBLIC_API_URL and PUBLIC_SOCKET_URL in `apps/web/.env` accordingly

### Socket.io Not Connecting

- Ensure API server is running
- Check browser console for connection errors
- Verify CORS_ORIGIN in API .env matches your web app URL

## Production Deployment

### API Deployment

1. Set environment variables on your hosting platform
2. Build: `npm start`
3. Ensure MongoDB Atlas allows connections from your server IP

### Web Deployment

1. Build: `npm run build`
2. Deploy the `build` folder to your hosting platform
3. Update PUBLIC_API_URL and PUBLIC_SOCKET_URL to production API URL

## Security Notes

- Change STAFF_PIN in production
- Use HTTPS in production
- Configure MongoDB Atlas IP whitelist properly
- Consider adding rate limiting adjustments for production traffic
- Implement proper session management for staff authentication in production
