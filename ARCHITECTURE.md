# System Architecture

## Overview

The Queue Management System is a full-stack application built with a clear separation between frontend and backend, communicating via REST API and WebSocket connections.

```
┌─────────────────────────────────────────────────────────────┐
│                         Clients                              │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Registration │  TV Display  │   MC View    │  Staff Panel   │
│   (Public)   │   (Public)   │   (Public)   │  (Protected)   │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       │ HTTP + WS    │ HTTP + WS    │ HTTP + WS      │ HTTP + WS
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Express API      │
                    │   + Socket.io      │
                    │   (Port 3001)      │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  MongoDB Atlas     │
                    │  (Cloud Database)  │
                    └────────────────────┘
```

## Technology Stack

### Frontend (SvelteKit)
- **Framework**: SvelteKit 2.0
- **Styling**: TailwindCSS 3.4
- **Real-time**: Socket.io Client 4.6
- **Build Tool**: Vite 5.0
- **Language**: JavaScript (ES Modules)

### Backend (Node.js)
- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **Database ODM**: Mongoose 8.0
- **Real-time**: Socket.io 4.6
- **Validation**: express-validator 7.0
- **Security**: express-rate-limit 7.1, CORS 2.8

### Database
- **Type**: MongoDB (NoSQL)
- **Hosting**: MongoDB Atlas (Cloud)
- **Collections**: tickets

## Project Structure

```
queue-system/
├── apps/
│   ├── api/                      # Backend application
│   │   ├── src/
│   │   │   ├── middleware/       # Express middleware
│   │   │   │   ├── auth.js       # PIN authentication
│   │   │   │   └── rateLimiter.js # Rate limiting
│   │   │   ├── models/           # Mongoose models
│   │   │   │   └── Ticket.js     # Ticket schema
│   │   │   ├── routes/           # API routes
│   │   │   │   ├── public.js     # Public endpoints
│   │   │   │   └── staff.js      # Staff endpoints
│   │   │   └── server.js         # Entry point
│   │   ├── .env.example          # Environment template
│   │   └── package.json          # Dependencies
│   │
│   └── web/                      # Frontend application
│       ├── src/
│       │   ├── lib/              # Utilities
│       │   │   ├── api.js        # API client
│       │   │   └── socket.js     # Socket.io client
│       │   ├── routes/           # SvelteKit routes
│       │   │   ├── +layout.svelte # Root layout
│       │   │   ├── +page.svelte   # Registration
│       │   │   ├── display/       # TV display
│       │   │   ├── mc/            # MC view
│       │   │   └── staff/         # Staff panel
│       │   ├── app.css           # Global styles
│       │   └── app.html          # HTML template
│       ├── static/               # Static assets
│       ├── .env.example          # Environment template
│       └── package.json          # Dependencies
│
├── .gitignore                    # Git ignore rules
├── package.json                  # Root package.json
├── README.md                     # Main documentation
├── SETUP.md                      # Setup instructions
├── FEATURES.md                   # Feature documentation
├── TESTING.md                    # Testing guide
└── ARCHITECTURE.md               # This file
```

## Data Flow

### Registration Flow
```
1. User fills form → 2. POST /api/register
                   ↓
3. Validate input → 4. Generate ticket number (A-001)
                   ↓
5. Save to MongoDB → 6. Emit 'queue:updated' via Socket.io
                   ↓
7. Return ticket → 8. All connected clients receive update
```

### Call Next Flow
```
1. Staff clicks "Call Next" → 2. POST /api/staff/call-next (with PIN)
                             ↓
3. Mark current serving as done → 4. Find next waiting ticket
                             ↓
5. Update status to 'serving' → 6. Save to MongoDB
                             ↓
7. Emit 'queue:updated' + 'ticket:called' → 8. All screens update
```

## Database Schema

### Ticket Collection
```javascript
{
  _id: ObjectId,
  ticketNumber: "A-001",        // Format: [A-Z]-\d{3}
  fullName: "John Doe",         // Max 100 chars
  phone: "+1234567890",         // Validated format
  email: "john@example.com",    // Optional, validated
  status: "waiting",            // Enum: waiting|called|serving|done|no-show
  calledAt: ISODate,            // When ticket was called
  completedAt: ISODate,         // When service completed
  createdAt: ISODate,           // Auto-generated
  updatedAt: ISODate            // Auto-generated
}
```

### Indexes
```javascript
{ status: 1, createdAt: 1 }  // Compound index for queue queries
{ ticketNumber: 1 }          // Unique index (auto-created)
```

## API Endpoints

### Public Endpoints

#### POST /api/register
Create new ticket
- Rate limit: 10 requests per 15 minutes per IP
- Body: `{ fullName, phone, email? }`
- Response: `{ success, ticket: { ticketNumber, fullName, status } }`

#### GET /api/queue
Get current queue status
- No authentication required
- Response: `{ nowServing, next: [], waitingCount }`

#### GET /health
Health check endpoint
- Response: `{ status: "ok", timestamp }`

### Staff Endpoints (PIN Required)

#### POST /api/staff/auth
Verify staff PIN
- Rate limit: 30 requests per minute
- Body: `{ pin }`
- Response: `{ success, message }`

#### GET /api/staff/tickets
Get all active tickets
- Header: `X-Staff-Pin: 1234`
- Response: `{ tickets: [] }`

#### POST /api/staff/call-next
Call next waiting ticket
- Header: `X-Staff-Pin: 1234`
- Response: `{ success, ticket }`

#### POST /api/staff/call-specific
Call specific ticket
- Header: `X-Staff-Pin: 1234`
- Body: `{ ticketNumber }`
- Response: `{ success, ticket }`

#### POST /api/staff/mark-done
Mark ticket as completed
- Header: `X-Staff-Pin: 1234`
- Body: `{ ticketNumber }`
- Response: `{ success, ticket }`

#### POST /api/staff/mark-no-show
Mark ticket as no-show
- Header: `X-Staff-Pin: 1234`
- Body: `{ ticketNumber }`
- Response: `{ success, ticket }`

## WebSocket Events

### Server → Client

#### queue:updated
Emitted when queue state changes
- Triggers: New registration, status change, ticket called
- Payload: None (clients should fetch latest data)

#### ticket:called
Emitted when a ticket is called
- Triggers: Call next, call specific
- Payload: `{ ticketNumber, fullName }`

### Client → Server
- Standard Socket.io connection events only
- No custom client-to-server events

## Security Measures

### Authentication
- PIN-based staff authentication
- PIN stored in environment variable
- PIN sent via HTTP header for API requests
- PIN stored in localStorage for session persistence

### Rate Limiting
- Registration: 10 requests per 15 minutes per IP
- Staff endpoints: 30 requests per minute per IP
- Prevents abuse and DoS attacks

### Input Validation
- Server-side validation using express-validator
- Mongoose schema validation
- Regex patterns for phone and email
- Length limits on text fields

### CORS
- Configured to allow specific origin
- Prevents unauthorized cross-origin requests
- Configurable via environment variable

### Database Security
- MongoDB connection over TLS
- Mongoose prevents NoSQL injection
- No raw query execution
- Proper error handling without data leakage

## Scalability Considerations

### Current Limitations
- Single server instance
- In-memory Socket.io (no Redis adapter)
- No horizontal scaling support
- Single staff PIN

### Scaling Path
1. **Add Redis for Socket.io**: Enable multi-server Socket.io
2. **Load Balancer**: Distribute traffic across API instances
3. **Database Sharding**: If ticket volume grows significantly
4. **CDN**: Serve static frontend assets
5. **Caching**: Add Redis cache for queue queries
6. **Message Queue**: Decouple ticket processing

## Monitoring & Logging

### Current Implementation
- Console logging for key events
- Error logging to console
- Connection status logging

### Production Recommendations
- Add structured logging (Winston, Pino)
- Application monitoring (New Relic, DataDog)
- Error tracking (Sentry)
- Performance monitoring
- Database query monitoring
- Socket.io connection metrics

## Deployment Architecture

### Development
```
localhost:5173 (Web) → localhost:3001 (API) → MongoDB Atlas
```

### Production (Recommended)
```
CDN → Web App (Vercel/Netlify)
         ↓
    Load Balancer
         ↓
    API Servers (Railway/Render/AWS)
         ↓
    MongoDB Atlas (Replica Set)
```

## Performance Characteristics

### Expected Load
- Registration: ~10-50 per hour
- Queue queries: ~100-500 per hour
- Staff operations: ~10-30 per hour
- WebSocket connections: 5-20 concurrent

### Response Times (Target)
- Registration: < 500ms
- Queue fetch: < 200ms
- Staff operations: < 300ms
- WebSocket latency: < 100ms

### Database Queries
- Most queries use indexes
- Lean queries for read operations
- Minimal data transfer
- Connection pooling enabled

## Future Architecture Improvements

1. **Microservices**: Split into registration, queue, and notification services
2. **Event Sourcing**: Track all state changes for audit trail
3. **CQRS**: Separate read and write models
4. **GraphQL**: Replace REST API for flexible queries
5. **Server-Sent Events**: Alternative to WebSocket for one-way updates
6. **Multi-tenancy**: Support multiple locations/counters
7. **Analytics Pipeline**: Real-time analytics and reporting
