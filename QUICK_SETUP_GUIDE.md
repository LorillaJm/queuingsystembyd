# Quick Setup Guide - BYD Test Drive Queue System

## 🚀 Get Started in 3 Steps

### Step 1: Initialize Database

Run this command to set up your MongoDB Atlas database with all BYD models:

```bash
cd apps/api
npm run init-db
```

This will:
- ✅ Connect to your MongoDB Atlas database
- ✅ Create settings (staff PIN, branches, etc.)
- ✅ Add all 12 BYD models to MAIN branch
- ✅ Display current database state

**Expected Output:**
```
🔌 Connecting to MongoDB Atlas...
✅ Connected to MongoDB Atlas
📊 Database: queue-system

📝 Initializing Settings...
✅ Settings initialized

🚗 Adding BYD Models...
  ✅ Added: BYD Atto 3
  ✅ Added: BYD Dolphin
  ✅ Added: BYD eMax 7
  ... (all 12 models)

📊 Summary:
  - Added: 12 models
  - Skipped: 0 models
  - Total: 12 models

✅ Database initialization complete!
```

### Step 2: Start the API Server

```bash
cd apps/api
npm run dev
```

Server will start on: `http://localhost:3001`

### Step 3: Start the Web App

Open a new terminal:

```bash
cd apps/web
npm run dev
```

Web app will start on: `http://localhost:5173`

---

## 📱 Access Your Application

### Public Registration Form
**URL:** http://localhost:5173

**Features:**
- Full Name input
- Contact Number input
- Vehicle of Interest dropdown (shows all 12 BYD models)
- Automatic queue number generation (A-001, A-002, etc.)

### Staff Control Panel
**URL:** http://localhost:5173/staff

**Login:** PIN `1234`

**Features:**
- View all waiting customers
- Call next customer
- Call specific queue number
- Mark as done or no-show
- Real-time updates

### Manage Cars
**URL:** http://localhost:5173/staff/cars

**Features:**
- View all BYD models
- Add new models
- Edit existing models
- Activate/deactivate models
- Delete models
- Reorder models

### TV Display Screen
**URL:** http://localhost:5173/screen?branch=MAIN

**Features:**
- Large NOW SERVING display
- Next 3 queue numbers
- Sound notification on update
- Auto-refresh

### MC/Announcer View
**URL:** http://localhost:5173/mc?branch=MAIN

**Features:**
- NOW SERVING with customer name
- Next 5 customers with names
- Search by queue number

---

## 🔧 Configuration

### Database Connection
File: `apps/api/.env`
```
MONGODB_URI=mongodb+srv://wavemobilejmlorilla_db_user:LLigxKWw6AU5LyzY@testdrive.ahh94lv.mongodb.net/queue-system?retryWrites=true&w=majority
```

### Staff PIN
Default: `1234`

To change:
1. Connect to MongoDB Atlas
2. Update the `settings` collection
3. Change `staffPin` field

Or run:
```javascript
db.settings.updateOne(
  { _id: "app_settings" },
  { $set: { staffPin: "YOUR_NEW_PIN" } }
)
```

### Branches
Default branches:
- MAIN (prefix: A) - A-001, A-002, etc.
- NORTH (prefix: B) - B-001, B-002, etc.
- SOUTH (prefix: C) - C-001, C-002, etc.

### BYD Models (Already Added)
1. BYD Atto 3
2. BYD Dolphin
3. BYD eMax 7
4. BYD eMax 9 DM-i
5. BYD Han
6. BYD Seal 5
7. BYD Seal Performance
8. BYD Sealion 5 DM-i
9. BYD Sealion 6 DM-i
10. BYD Shark 6 DMO
11. BYD Tang EV
12. BYD Tang DM-i

---

## 🧪 Test the System

### 1. Register a Customer

1. Go to http://localhost:5173
2. Fill in:
   - Full Name: "John Doe"
   - Contact Number: "+63 912 345 6789"
   - Vehicle of Interest: "BYD Atto 3"
3. Click "Get Queue Number"
4. You'll receive: **A-001**

### 2. Call the Customer (Staff)

1. Go to http://localhost:5173/staff
2. Login with PIN: `1234`
3. Click "Call Next"
4. Customer A-001 moves to "NOW SERVING"

### 3. View on TV Screen

1. Go to http://localhost:5173/screen?branch=MAIN
2. See "NOW SERVING: A-001"
3. Hear notification sound

### 4. Complete Service

1. In staff panel, click "Mark Done"
2. Customer A-001 marked as complete
3. Ready for next customer

---

## 📊 Database Collections

Your MongoDB Atlas database has these collections:

### 1. settings
- Staff PIN
- Branch configuration
- System settings

### 2. cars
- All BYD models
- Capacity, display order
- Active/inactive status

### 3. registrations
- Customer registrations
- Queue numbers
- Status (WAITING, SERVING, DONE, NOSHOW)

### 4. queuestates
- Daily queue state per branch
- Last queue number
- Current serving

---

## 🔒 Security Notes

### Change Default PIN
The default staff PIN is `1234`. Change it before going live!

### MongoDB Atlas Security
Your connection string contains credentials. Keep it secure:
- ✅ Already in `.env` file (not committed to git)
- ✅ `.env` is in `.gitignore`
- ❌ Never commit credentials to git
- ❌ Never share credentials publicly

### IP Whitelist
In MongoDB Atlas:
1. Go to Network Access
2. Add your server's IP address
3. For development: Allow 0.0.0.0/0 (all IPs)
4. For production: Whitelist specific IPs only

---

## 🐛 Troubleshooting

### Database Connection Failed

**Error:** `MongoServerError: bad auth`

**Solution:**
1. Check username/password in `.env`
2. Verify IP is whitelisted in MongoDB Atlas
3. Check database name is correct

### No Cars Showing in Dropdown

**Solution:**
```bash
cd apps/api
npm run init-db
```

### Staff PIN Not Working

**Solution:**
Check settings in MongoDB:
```javascript
db.settings.findOne({ _id: "app_settings" })
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

---

## 📞 Support

### Check System Status

```bash
# API Health Check
curl http://localhost:3001/health

# Expected Response:
{
  "status": "ok",
  "mongodb": "connected",
  "timezone": "Asia/Manila"
}
```

### View Database

Connect to MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Click "Browse Collections"
3. Select `queue-system` database
4. View collections: settings, cars, registrations

---

## ✅ Checklist

Before going live:

- [ ] Database initialized (`npm run init-db`)
- [ ] All 12 BYD models added
- [ ] Staff PIN changed from default
- [ ] API server running
- [ ] Web app running
- [ ] Test registration works
- [ ] Test staff panel works
- [ ] Test TV screen works
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Backup strategy in place

---

## 🎉 You're Ready!

Your BYD Test Drive Queue System is now set up and ready to use!

**Next Steps:**
1. Test the complete flow (register → call → complete)
2. Customize branding if needed
3. Train staff on using the system
4. Deploy to production when ready

**Need Help?**
- Check the troubleshooting section above
- Review the full documentation in other .md files
- Test with sample data before going live
