# 🔗 BYD Queue Management System - All Links

## 🌐 Production URLs

### Frontend (Firebase Hosting)
- **Primary URL:** https://testdrive-17e53.web.app
- **Alternative URL:** https://testdrive-17e53.firebaseapp.com
- **Vercel URL:** https://queuingsystembyd-web.vercel.app

### Backend API (Render)
- **API Base URL:** https://queuingsystembyd.onrender.com
- **Health Check:** https://queuingsystembyd.onrender.com/health

---

## 📱 Application Pages

### Public Pages (Customer-Facing)

#### Registration Form
- **Firebase:** https://testdrive-17e53.web.app/
- **Vercel:** https://queuingsystembyd-web.vercel.app/
- **Purpose:** Customers register and get queue numbers

#### Display Screen (TV/Monitor)
- **Firebase:** https://testdrive-17e53.web.app/screen
- **Vercel:** https://queuingsystembyd-web.vercel.app/screen
- **Purpose:** Shows current queue status on TV screens

#### MC/Announcer View
- **Firebase:** https://testdrive-17e53.web.app/mc
- **Vercel:** https://queuingsystembyd-web.vercel.app/mc
- **Purpose:** Announcer calls out queue numbers

---

### Staff Pages (Protected)

#### Staff Dashboard
- **Firebase:** https://testdrive-17e53.web.app/staff
- **Vercel:** https://queuingsystembyd-web.vercel.app/staff
- **Purpose:** Manage queue, call next customer
- **PIN Required:** 1234

#### Car Management
- **Firebase:** https://testdrive-17e53.web.app/cars
- **Vercel:** https://queuingsystembyd-web.vercel.app/cars
- **Purpose:** Add/edit/manage car models
- **PIN Required:** 1234

#### Dashboard Summary
- **Firebase:** https://testdrive-17e53.web.app/dashboard
- **Vercel:** https://queuingsystembyd-web.vercel.app/dashboard
- **Purpose:** View all branches statistics
- **PIN Required:** 1234

---

## 🔌 API Endpoints

### Public Endpoints (No Auth Required)

```
POST   https://queuingsystembyd.onrender.com/api/register
GET    https://queuingsystembyd.onrender.com/api/queue?branch=MAIN
GET    https://queuingsystembyd.onrender.com/api/ticket/:id
GET    https://queuingsystembyd.onrender.com/api/branches
GET    https://queuingsystembyd.onrender.com/api/cars?branch=MAIN
GET    https://queuingsystembyd.onrender.com/api/registrations?branch=MAIN
GET    https://queuingsystembyd.onrender.com/api/registrations/search?query=John&branch=MAIN
PATCH  https://queuingsystembyd.onrender.com/api/registrations/:id
```

### Staff Endpoints (Requires PIN in Header)

```
POST   https://queuingsystembyd.onrender.com/api/staff/auth
GET    https://queuingsystembyd.onrender.com/api/staff/tickets?branch=MAIN
POST   https://queuingsystembyd.onrender.com/api/staff/next
POST   https://queuingsystembyd.onrender.com/api/staff/next-model
POST   https://queuingsystembyd.onrender.com/api/staff/call
POST   https://queuingsystembyd.onrender.com/api/staff/mark-done
POST   https://queuingsystembyd.onrender.com/api/staff/no-show
GET    https://queuingsystembyd.onrender.com/api/staff/stats?branch=MAIN
GET    https://queuingsystembyd.onrender.com/api/staff/dashboard?branch=MAIN
GET    https://queuingsystembyd.onrender.com/api/staff/dashboard/summary
POST   https://queuingsystembyd.onrender.com/api/staff/cars
GET    https://queuingsystembyd.onrender.com/api/staff/cars?branch=MAIN
PATCH  https://queuingsystembyd.onrender.com/api/staff/cars/:id
PATCH  https://queuingsystembyd.onrender.com/api/staff/cars/:id/toggle
DELETE https://queuingsystembyd.onrender.com/api/staff/cars/:id
```

### Test Drive Endpoints

```
POST   https://queuingsystembyd.onrender.com/api/testdrive/register
GET    https://queuingsystembyd.onrender.com/api/testdrive/ticket/:id
```

### Reservation Endpoints

```
POST   https://queuingsystembyd.onrender.com/api/reservation/register
GET    https://queuingsystembyd.onrender.com/api/reservation/ticket/:id
```

---

## 🎯 Quick Access Links

### For Customers
1. **Register for Queue:** https://testdrive-17e53.web.app/
2. **View Queue Status:** https://testdrive-17e53.web.app/screen

### For Staff
1. **Login & Manage Queue:** https://testdrive-17e53.web.app/staff (PIN: 1234)
2. **Manage Cars:** https://testdrive-17e53.web.app/cars (PIN: 1234)
3. **View Dashboard:** https://testdrive-17e53.web.app/dashboard (PIN: 1234)

### For Announcer
1. **MC View:** https://testdrive-17e53.web.app/mc

---

## 🔐 Authentication

### Staff PIN
- **Default PIN:** `1234`
- **Header Name:** `X-Staff-Pin`
- **Used For:** All `/api/staff/*` endpoints

### Example API Call with Auth
```bash
curl -X POST https://queuingsystembyd.onrender.com/api/staff/next \
  -H "Content-Type: application/json" \
  -H "X-Staff-Pin: 1234" \
  -d '{"branch": "MAIN"}'
```

---

## 📊 Monitoring & Admin

### Render Dashboard
- **URL:** https://dashboard.render.com/
- **Service:** queuingsystembyd
- **View:** Logs, metrics, deployments

### Firebase Console
- **URL:** https://console.firebase.google.com/project/testdrive-17e53
- **Access:** Database, hosting, analytics

---

## 🧪 Testing Links

### Health Check
```bash
curl https://queuingsystembyd.onrender.com/health
```

### Test Registration
```bash
curl -X POST https://queuingsystembyd.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "branch": "MAIN",
    "firstName": "John",
    "lastName": "Doe",
    "contactNumber": "09123456789",
    "purpose": "test_drive",
    "selectedModel": "ATTO 3"
  }'
```

### Test Staff Auth
```bash
curl -X POST https://queuingsystembyd.onrender.com/api/staff/auth \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234"}'
```

---

## 📱 QR Codes (Generate These)

You can create QR codes for easy mobile access:

1. **Customer Registration:** https://testdrive-17e53.web.app/
2. **Queue Display:** https://testdrive-17e53.web.app/screen
3. **Staff Login:** https://testdrive-17e53.web.app/staff

Use any QR code generator like:
- https://www.qr-code-generator.com/
- https://qr.io/

---

## 🔄 WebSocket Connection

### Socket.io URL
```javascript
const socket = io('https://queuingsystembyd.onrender.com', {
  transports: ['websocket', 'polling']
});

// Join branch room
socket.emit('join-branch', 'MAIN');
```

### Events
- `queue-updated` - Queue status changed
- `ticket-called` - Customer called
- `ticket-completed` - Service completed

---

## 📝 Notes

- All frontend URLs work on both Firebase and Vercel
- API is hosted on Render (free tier - may sleep after inactivity)
- First API request after sleep takes ~30 seconds to wake up
- WebSocket connections auto-reconnect on disconnect
- All times are in Asia/Manila timezone (GMT+8)

---

## 🆘 Support

If any link doesn't work:
1. Check Render logs: https://dashboard.render.com/
2. Check Firebase hosting: https://console.firebase.google.com/
3. Verify environment variables in Render dashboard
4. Check CORS settings if getting CORS errors
