# Quick Start Guide

Get the queue system running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier)

## 1. Install Dependencies (2 minutes)

```bash
# Root
npm install

# API
cd apps/api
npm install

# Web
cd ../web
npm install
cd ../..
```

## 2. Configure MongoDB (1 minute)

1. Get MongoDB connection string from Atlas
2. Copy and edit API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/queue-system
STAFF_PIN=1234
```

## 3. Configure Web (30 seconds)

```bash
cp apps/web/.env.example apps/web/.env
```

Default values work for local development!

## 4. Start the System (1 minute)

Open two terminals:

**Terminal 1 - API:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Web:**
```bash
cd apps/web
npm run dev
```

## 5. Access the Application

- **Registration**: http://localhost:5173
- **TV Display**: http://localhost:5173/display
- **MC View**: http://localhost:5173/mc
- **Staff Panel**: http://localhost:5173/staff (PIN: 1234)

## Quick Test

1. Open http://localhost:5173
2. Register with name "Test User" and phone "1234567890"
3. You'll get ticket A-001
4. Open http://localhost:5173/staff in new tab
5. Login with PIN: 1234
6. Click "Call Next Customer"
7. Open http://localhost:5173/display to see it update!

## Troubleshooting

**MongoDB connection failed?**
- Check your connection string
- Whitelist your IP in MongoDB Atlas Network Access

**Port already in use?**
- Change PORT in `apps/api/.env`
- Update URLs in `apps/web/.env`

**Socket.io not connecting?**
- Ensure API is running first
- Check browser console for errors

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed setup
- Read [FEATURES.md](FEATURES.md) for feature documentation
- Read [TESTING.md](TESTING.md) for testing guide
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system architecture

## Default Credentials

- Staff PIN: `1234` (change in production!)

## Common Commands

```bash
# Start API in development
cd apps/api && npm run dev

# Start Web in development
cd apps/web && npm run dev

# Build Web for production
cd apps/web && npm run build

# Start API in production
cd apps/api && npm start
```

That's it! You're ready to go! 🚀
