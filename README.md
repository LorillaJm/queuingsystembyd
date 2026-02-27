# Queue Management System

A production-ready queue management system for automotive dealerships with real-time updates, TV displays, and staff control panel.

![System Overview](docs/screenshots/overview.png)
> Screenshot placeholder - System overview showing registration, display, and staff panel

---

## 🎯 Overview

Complete queue management solution for test drives, service appointments, and customer inquiries. Features automatic queue number generation, real-time updates across all displays, and staff control with PIN protection.

### Key Features

✅ **Public Registration** - No login required, instant queue number generation  
✅ **Concurrency Safe** - No duplicate numbers even with 100+ simultaneous registrations  
✅ **Real-time Updates** - Socket.io broadcasts to all connected displays  
✅ **TV Display** - Large format screen optimized for 1080p with sound notifications  
✅ **MC/Announcer View** - Shows customer names for calling tickets  
✅ **Staff Control Panel** - PIN-protected operations (call next, mark done, no-show)  
✅ **Multi-Branch Support** - Independent queues per branch (A-001, B-001, C-001)  
✅ **Daily Auto-Reset** - Queue numbers reset at midnight (Asia/Manila timezone)  
✅ **Production Ready** - Security headers, rate limiting, error handling, logging

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get running in 5 minutes
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[FEATURES.md](FEATURES.md)** - Complete feature documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Deploy to Railway/Render/Heroku
- **[QA_TESTING_CHECKLIST.md](QA_TESTING_CHECKLIST.md)** - Complete testing checklist
- **[API_EXAMPLES.md](apps/api/API_EXAMPLES.md)** - API endpoint examples
- **[TESTING.md](TESTING.md)** - Testing guide

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd queue-system

# Install dependencies
npm install
cd apps/api && npm install
cd ../web && npm install
cd ../..
```

### 2. Configure Environment

```bash
# API configuration
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env and set your MongoDB URI

# Web configuration  
cp apps/web/.env.example apps/web/.env
# Default values work for local development
```

### 3. Initialize Database

Connect to MongoDB and create settings:

```javascript
use queue-system

db.settings.insertOne({
  _id: "app_settings",
  staffPin: "1234",
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

### 4. Start Development Servers

```bash
# Terminal 1 - API Server
cd apps/api
npm run dev

# Terminal 2 - Web App
cd apps/web
npm run dev
```

### 5. Access Application

- **Registration**: http://localhost:5173
- **TV Display**: http://localhost:5173/screen?branch=MAIN
- **MC View**: http://localhost:5173/mc?branch=MAIN
- **Staff Panel**: http://localhost:5173/staff (PIN: 1234)
- **API Health**: http://localhost:3001/health

---

## 🏗️ Tech Stack

### Frontend
- **SvelteKit** - Modern web framework with SSR
- **TailwindCSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time WebSocket communication

### Backend
- **Node.js + Express** - REST API server
- **MongoDB + Mongoose** - Database with ODM
- **Socket.io** - Real-time event broadcasting
- **Helmet** - Security headers
- **Morgan** - HTTP request logging
- **Express Validator** - Input validation
- **Express Rate Limit** - API rate limiting

### Infrastructure
- **MongoDB Atlas** - Cloud database
- **Railway/Render/Vercel** - Deployment platforms

### Infrastructure
- **MongoDB Atlas** - Cloud database
- **Railway/Render/Vercel** - Deployment platforms

---

## 📁 Project Structure

```
queue-system/
├── apps/
│   ├── api/                          # Express Backend
│   │   ├── src/
│   │   │   ├── controllers/          # Request handlers
│   │   │   │   ├── registrationController.js
│   │   │   │   └── staffController.js
│   │   │   ├── middleware/           # Auth, validation, rate limiting
│   │   │   │   ├── auth.js
│   │   │   │   ├── validation.js
│   │   │   │   └── rateLimiter.js
│   │   │   ├── models/               # Mongoose schemas
│   │   │   │   ├── Registration.js   # Ticket/registration data
│   │   │   │   ├── QueueState.js     # Daily queue state per branch
│   │   │   │   ├── Settings.js       # App configuration
│   │   │   │   └── Ticket.js         # (legacy, use Registration)
│   │   │   ├── routes/               # API routes
│   │   │   │   ├── public.js         # Public endpoints
│   │   │   │   └── staff.js          # Staff endpoints
│   │   │   ├── services/             # Business logic
│   │   │   │   ├── queueGenerator.js # Queue number generation
│   │   │   │   └── ticketService.js  # Ticket state management
│   │   │   ├── utils/
│   │   │   │   └── logger.js         # Logging utility
│   │   │   └── server.js             # Entry point
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── web/                          # SvelteKit Frontend
│       ├── src/
│       │   ├── lib/
│       │   │   ├── api.js            # API client functions
│       │   │   └── socket.js         # Socket.io client
│       │   ├── routes/
│       │   │   ├── +page.svelte      # Registration form
│       │   │   ├── screen/
│       │   │   │   └── +page.svelte  # TV display
│       │   │   ├── mc/
│       │   │   │   └── +page.svelte  # MC/announcer view
│       │   │   └── staff/
│       │   │       └── +page.svelte  # Staff control panel
│       │   ├── app.css               # Global styles
│       │   └── app.html              # HTML template
│       ├── static/
│       │   ├── notification.mp3      # Sound notification
│       │   └── favicon.png
│       ├── .env.example
│       └── package.json
│
├── docs/                             # Documentation
│   └── screenshots/                  # Screenshot placeholders
├── ARCHITECTURE.md
├── PRODUCTION_DEPLOYMENT.md
├── QA_TESTING_CHECKLIST.md
├── QUICK_START.md
└── README.md
```

---

## 🔌 API Endpoints

### Public Endpoints

#### Register New Ticket
```bash
POST /api/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "mobile": "+63 912 345 6789",
  "model": "Toyota Camry",
  "branch": "MAIN",
  "purpose": "TEST_DRIVE"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439011",
    "queueNo": "A-001",
    "fullName": "John Doe",
    "branch": "MAIN",
    "status": "WAITING"
  }
}
```

#### Get Queue Status
```bash
GET /api/queue?branch=MAIN

Response: 200 OK
{
  "success": true,
  "data": {
    "branch": "MAIN",
    "currentServing": {
      "queueNo": "A-005",
      "fullName": "Jane Smith",
      "status": "SERVING"
    },
    "nextUp": [
      { "queueNo": "A-006" },
      { "queueNo": "A-007" },
      { "queueNo": "A-008" }
    ],
    "waitingCount": 12
  }
}
```

#### Get Ticket Details
```bash
GET /api/ticket/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439011",
    "queueNo": "A-001",
    "fullName": "John Doe",
    "status": "WAITING",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get Active Branches
```bash
GET /api/branches

Response: 200 OK
{
  "success": true,
  "data": {
    "branches": [
      { "code": "MAIN", "name": "Main Branch", "prefix": "A" },
      { "code": "NORTH", "name": "North Branch", "prefix": "B" }
    ]
  }
}
```

### Staff Endpoints (Require x-staff-pin header)

#### Verify Staff PIN
```bash
POST /api/staff/auth
Content-Type: application/json

{ "pin": "1234" }

Response: 200 OK
{ "success": true, "message": "Authentication successful" }
```

#### Call Next Ticket
```bash
POST /api/staff/next
Content-Type: application/json
x-staff-pin: 1234

{ "branch": "MAIN" }

Response: 200 OK
{
  "success": true,
  "data": {
    "queueNo": "A-006",
    "status": "SERVING"
  }
}
```

#### Call Specific Ticket
```bash
POST /api/staff/call
Content-Type: application/json
x-staff-pin: 1234

{ "branch": "MAIN", "queueNo": "A-010" }
```

#### Mark Ticket as Done
```bash
POST /api/staff/mark-done
Content-Type: application/json
x-staff-pin: 1234

{ "branch": "MAIN", "queueNo": "A-006" }
```

#### Mark Ticket as No-Show
```bash
POST /api/staff/no-show
Content-Type: application/json
x-staff-pin: 1234

{ "branch": "MAIN", "queueNo": "A-007" }
```

See [API_EXAMPLES.md](apps/api/API_EXAMPLES.md) for more examples.

---

## 🔄 Real-time Events (Socket.io)

### Client → Server

```javascript
// Join branch room
socket.emit('join-branch', 'MAIN');

// Leave branch room
socket.emit('leave-branch', 'MAIN');
```

### Server → Client

```javascript
// Queue updated (new registration, status change)
socket.on('queue:updated', (data) => {
  console.log('Queue updated for branch:', data.branch);
  // Refresh queue display
});

// Ticket called (status changed to SERVING)
socket.on('ticket:called', (data) => {
  console.log('Ticket called:', data.queueNo);
  // Play notification sound, update display
});
```

---

## 🎨 User Interfaces

### 1. Registration Page (/)

![Registration Form](docs/screenshots/registration.png)
> Screenshot placeholder - Public registration form

**Features:**
- Clean, minimal Apple-like design
- Real-time client-side validation
- Instant queue number display
- Mobile responsive

**Fields:**
- Full Name (required, 2-100 chars)
- Mobile Number (required, 10+ digits)
- Vehicle Model (required)
- Branch (dropdown)
- Purpose (dropdown: Test Drive, Service, Inquiry, Purchase)

### 2. TV Display Screen (/screen?branch=MAIN)

![TV Display](docs/screenshots/tv-display.png)
> Screenshot placeholder - Large format TV display

**Features:**
- Full-screen layout optimized for 1080p
- Huge NOW SERVING number (16rem font)
- Shows next 3 queue numbers
- Smooth fade/fly animations
- Sound notification on update
- Connection status indicator
- Auto-reconnect on disconnect

**Usage:**
- Open on TV/monitor in waiting area
- Add `?branch=MAIN` to URL for branch filtering
- Runs 24/7 with auto-reconnect

### 3. MC/Announcer View (/mc?branch=MAIN)

![MC View](docs/screenshots/mc-view.png)
> Screenshot placeholder - MC announcer interface

**Features:**
- Shows NOW SERVING with full customer name
- Shows next 5 customers with names
- Search functionality to find specific tickets
- Real-time updates via Socket.io
- Fallback polling every 10 seconds

**Usage:**
- Used by MC/announcer to call customer names
- Search bar to quickly find specific tickets
- Updates automatically when staff calls next

### 4. Staff Control Panel (/staff)

![Staff Panel](docs/screenshots/staff-panel.png)
> Screenshot placeholder - Staff control interface

**Features:**
- PIN-protected access (no user accounts)
- Branch selector
- Call Next button (oldest waiting → serving)
- Call Specific (enter queue number)
- Mark Done / Mark No-Show buttons
- Real-time ticket list with status
- Shows waiting count

**Usage:**
- Staff enters PIN (default: 1234)
- Select branch
- Click "Call Next" to serve oldest waiting ticket
- Use "Call Specific" to skip queue (VIP, etc.)
- Mark tickets as Done or No-Show

---

## 🔒 Security Features

✅ **Helmet** - Security headers (XSS, clickjacking, MIME sniffing protection)  
✅ **CORS** - Restricted to configured origin  
✅ **Rate Limiting** - 10 registrations per 15 min, 30 staff requests per min  
✅ **Input Validation** - Server-side validation with express-validator  
✅ **Input Sanitization** - Prevents XSS and injection attacks  
✅ **Request Size Limits** - 10MB max body size  
✅ **PIN Protection** - Staff endpoints require x-staff-pin header  
✅ **Error Handling** - No sensitive data leaked in production errors  
✅ **MongoDB Injection Prevention** - Mongoose schema validation

---

## ⚙️ Configuration

### Environment Variables

#### API (.env)
```bash
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/queue-system
STAFF_PIN=your-secure-pin
NODE_ENV=production
CORS_ORIGIN=https://your-web-app.vercel.app

# Optional
PORT=3001
TZ=Asia/Manila
```

#### Web (.env)
```bash
# Required
PUBLIC_API_URL=https://your-api.railway.app
PUBLIC_SOCKET_URL=https://your-api.railway.app
```

### Settings Collection

Configure branches, purposes, and limits in MongoDB:

```javascript
{
  _id: "app_settings",
  staffPin: "1234",                    // Change in production!
  allowedBranches: [
    { code: "MAIN", name: "Main Branch", prefix: "A", active: true },
    { code: "NORTH", name: "North Branch", prefix: "B", active: true }
  ],
  purposes: ["TEST_DRIVE", "SERVICE", "INQUIRY", "PURCHASE"],
  dailyResetTime: "00:00",             // Midnight Manila time
  maxQueuePerDay: 999                  // Max tickets per branch per day
}
```

---

## 🧪 Testing

### Run Tests

```bash
# API tests
cd apps/api
npm test

# Concurrency test (100 simultaneous registrations)
node src/tests/concurrency-demo.js

# Quick API test
node src/tests/quick-test.js
```

### QA Checklist

See [QA_TESTING_CHECKLIST.md](QA_TESTING_CHECKLIST.md) for complete testing checklist covering:
- Registration flow and validation
- Queue number generation and concurrency
- Real-time updates across all views
- Staff operations and state transitions
- Security and error handling
- Performance and load testing

---

## 🚀 Production Deployment

See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete deployment guide.

### Quick Deploy to Railway + Vercel

#### 1. Deploy API to Railway

```bash
cd apps/api
railway init
railway up

# Set environment variables
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set STAFF_PIN="your-secure-pin"
railway variables set NODE_ENV="production"
railway variables set TZ="Asia/Manila"
railway variables set CORS_ORIGIN="https://your-web-app.vercel.app"
```

#### 2. Deploy Web to Vercel

```bash
cd apps/web
vercel

# Set environment variables in Vercel dashboard
PUBLIC_API_URL=https://your-api.railway.app
PUBLIC_SOCKET_URL=https://your-api.railway.app

# Deploy to production
vercel --prod
```

#### 3. Initialize MongoDB Settings

Connect to MongoDB Atlas and run initialization script (see Quick Start section).

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Symptoms:** API won't start, "MongoDB connection error" in logs

**Solutions:**
1. Verify connection string is correct (check password, cluster URL)
2. Whitelist your IP in MongoDB Atlas Network Access
3. Check database name in connection string
4. Verify MongoDB cluster is running

### CORS Errors in Browser

**Symptoms:** API requests fail with CORS error in browser console

**Solutions:**
1. Verify `CORS_ORIGIN` in API .env matches web app URL exactly
2. Include protocol (https://) and no trailing slash
3. Restart API server after changing CORS_ORIGIN
4. Check browser console for exact error message

### Socket.io Not Connecting

**Symptoms:** Real-time updates don't work, connection indicator shows red

**Solutions:**
1. Verify `PUBLIC_SOCKET_URL` matches API URL
2. Check WebSocket support on hosting platform
3. Ensure HTTPS is used in production
4. Check browser console for connection errors
5. Verify CORS_ORIGIN includes web app URL

### Duplicate Queue Numbers

**Symptoms:** Two registrations get same queue number

**Solutions:**
1. Verify MongoDB indexes are created (unique on queueNo)
2. Check QueueState collection for correct lastNumber
3. Verify atomic $inc operation is used in queueGenerator
4. Restart API server
5. Check for multiple API instances (need Redis adapter)

### Daily Reset Not Working

**Symptoms:** Queue numbers don't reset at midnight

**Solutions:**
1. Verify `TZ=Asia/Manila` is set in environment
2. Check server timezone: `date` command or /health endpoint
3. Verify dateKey generation uses correct timezone
4. Check queuestates collection for correct dateKey format (YYYY-MM-DD)
5. Test by manually changing system date

### Rate Limiting Issues

**Symptoms:** Getting 429 Too Many Requests errors

**Solutions:**
1. Check rate limit settings in rateLimiter.js
2. Wait for rate limit window to reset (15 min for registration, 1 min for staff)
3. Verify IP address is correct (check X-Forwarded-For header)
4. Adjust limits if needed for your use case

### Staff PIN Not Working

**Symptoms:** Staff authentication fails with correct PIN

**Solutions:**
1. Verify PIN in Settings collection matches entered PIN
2. Check x-staff-pin header is being sent
3. Verify no extra spaces or characters in PIN
4. Check API logs for authentication errors
5. Re-initialize Settings collection if needed

---

## 📊 Monitoring

### Health Check Endpoint

```bash
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "production",
  "timezone": "Asia/Manila",
  "mongodb": "connected"
}
```

### Recommended Monitoring

- **Uptime**: UptimeRobot, Pingdom (monitor /health endpoint)
- **Errors**: Sentry, Rollbar, Bugsnag
- **Logs**: Logtail, Papertrail, Datadog
- **Performance**: New Relic, Datadog APM

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🆘 Support

- **Documentation**: Check docs folder and .md files
- **Issues**: Open GitHub issue with details
- **Questions**: Check troubleshooting section first

---

## 🎯 Roadmap

Future enhancements:
- [ ] SMS notifications when ticket is called
- [ ] Email receipts for registrations
- [ ] Analytics dashboard (daily stats, peak hours)
- [ ] Multi-language support
- [ ] Customer feedback after service
- [ ] Appointment scheduling integration
- [ ] Mobile app (React Native)
- [ ] QR code ticket scanning

---

**Built with ❤️ for automotive dealerships**
