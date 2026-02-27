# 🚀 START HERE - BYD Test Drive Queue System

## Quick Start (Windows)

I've created 3 batch files to make it easy for you:

### Step 1: Initialize Database (Run Once)
**Double-click:** `init-database.bat`

This will:
- Connect to your MongoDB Atlas
- Add all 12 BYD models
- Set up settings and branches

**Expected Output:**
```
✅ Connected to MongoDB Atlas
✅ Settings initialized
✅ Added: BYD Atto 3
✅ Added: BYD Dolphin
... (all 12 models)
✅ Database initialization complete!
```

### Step 2: Start API Server
**Double-click:** `start-api.bat`

Server will run on: http://localhost:3001

Keep this window open!

### Step 3: Start Web App
**Double-click:** `start-web.bat`

Web app will run on: http://localhost:5173

Keep this window open!

---

## 📱 Access Your Application

Once both servers are running:

### 🎯 Main Registration Form
**URL:** http://localhost:5173

**What customers see:**
- Full Name field
- Contact Number field
- Vehicle of Interest dropdown (12 BYD models)
- Get Queue Number button

**Result:** Customer gets queue number like A-001, A-002, etc.

### 👨‍💼 Staff Control Panel
**URL:** http://localhost:5173/staff

**Login:** PIN `1234`

**Features:**
- View all waiting customers
- Call next customer
- Call specific queue number
- Mark as done or no-show
- Real-time updates

### 🚗 Manage Cars
**URL:** http://localhost:5173/staff/cars

**Features:**
- View all BYD models
- Add/edit/delete models
- Activate/deactivate models
- Change display order

### 📺 TV Display Screen
**URL:** http://localhost:5173/screen?branch=MAIN

**For waiting area TV:**
- Large NOW SERVING display
- Next 3 queue numbers
- Sound notification
- Auto-refresh

### 🎤 MC/Announcer View
**URL:** http://localhost:5173/mc?branch=MAIN

**For announcer:**
- NOW SERVING with customer name
- Next 5 customers with names
- Search by queue number

---

## 🧪 Test the System

### Test Flow:

1. **Register a customer:**
   - Go to http://localhost:5173
   - Fill in: Name, Contact, Select "BYD Atto 3"
   - Click "Get Queue Number"
   - You get: **A-001**

2. **Call the customer (Staff):**
   - Go to http://localhost:5173/staff
   - Login with PIN: `1234`
   - Click "Call Next"
   - A-001 moves to "NOW SERVING"

3. **View on TV:**
   - Go to http://localhost:5173/screen?branch=MAIN
   - See "NOW SERVING: A-001"
   - Hear notification sound

4. **Complete:**
   - In staff panel, click "Mark Done"
   - A-001 marked as complete
   - Ready for next customer

---

## 🔧 Configuration

### Change Staff PIN

1. Go to http://localhost:5173/staff/cars
2. Or connect to MongoDB Atlas
3. Update settings collection

### Add More Models

1. Go to http://localhost:5173/staff/cars
2. Click "+ Add Car"
3. Enter model name, capacity, display order
4. Click "Add Car"

### Change Branch Names

Edit `apps/api/.env` or update in MongoDB settings collection

---

## ❓ Troubleshooting

### "Node is not recognized"

**Solution:** 
1. Open Command Prompt (not PowerShell)
2. Navigate to project folder
3. Run: `cd apps\api`
4. Run: `node src\scripts\init-database.js`

Or install Node.js from: https://nodejs.org

### Database Connection Failed

**Check:**
1. Internet connection is working
2. MongoDB Atlas IP whitelist includes your IP
3. Credentials in `apps/api/.env` are correct

### Port Already in Use

**Solution:**
1. Close any running Node.js processes
2. Restart your computer
3. Try again

### No Cars in Dropdown

**Solution:**
1. Run `init-database.bat` again
2. Check MongoDB Atlas has data
3. Restart API server

---

## 📊 Your BYD Models

All 12 models are automatically added:

1. ✅ BYD Atto 3
2. ✅ BYD Dolphin
3. ✅ BYD eMax 7
4. ✅ BYD eMax 9 DM-i
5. ✅ BYD Han
6. ✅ BYD Seal 5
7. ✅ BYD Seal Performance
8. ✅ BYD Sealion 5 DM-i
9. ✅ BYD Sealion 6 DM-i
10. ✅ BYD Shark 6 DMO
11. ✅ BYD Tang EV
12. ✅ BYD Tang DM-i

---

## 🎉 You're Ready!

Your system is now set up and ready to use!

**Remember:**
- Keep both batch files running (API and Web)
- Staff PIN is `1234` (change it later!)
- Queue numbers reset daily at midnight (Manila time)

**Need Help?**
- Check QUICK_SETUP_GUIDE.md for detailed instructions
- Check troubleshooting section above
- Test with sample data first

---

## 📞 Quick Reference

| What | URL | Notes |
|------|-----|-------|
| Registration | http://localhost:5173 | Public access |
| Staff Panel | http://localhost:5173/staff | PIN: 1234 |
| Manage Cars | http://localhost:5173/staff/cars | Add/edit models |
| TV Screen | http://localhost:5173/screen?branch=MAIN | For waiting area |
| MC View | http://localhost:5173/mc?branch=MAIN | For announcer |
| API Health | http://localhost:3001/health | Check if API is running |

---

**🚀 Ready to start? Double-click `init-database.bat` now!**
