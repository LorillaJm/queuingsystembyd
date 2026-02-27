# Features Documentation

## Core Features

### 1. Public Registration
- No login/password required
- Simple form: Full Name, Phone, Email (optional)
- Auto-generated queue numbers in A-001 format
- Real-time ticket generation
- Rate limiting: 10 registrations per IP per 15 minutes

### 2. TV Display Screen (`/display`)
- Large, minimal Apple-like design
- Shows NOW SERVING in huge text (ticket number only)
- Shows NEXT 5 tickets in queue
- Real-time updates via Socket.io
- Dark theme optimized for TV screens

### 3. MC Announcer View (`/mc`)
- Shows NOW SERVING ticket number (large)
- Shows customer full name for announcing
- Real-time updates when tickets are called
- Clean, focused interface for announcers

### 4. Staff Control Panel (`/staff`)
- PIN-based authentication (no user accounts)
- View all tickets in queue with full details
- Actions:
  - Call Next: Automatically calls next waiting customer
  - Call Specific: Call any waiting ticket directly
  - Mark Done: Complete current service
  - Mark No-Show: Mark customer as no-show
- Real-time queue updates
- Status indicators (waiting, called, serving)

## Technical Features

### Real-time Updates
- Socket.io for instant updates across all screens
- Events:
  - `queue:updated` - Triggers when queue state changes
  - `ticket:called` - Triggers when a ticket is called
- Auto-reconnection on connection loss

### Data Validation
- Server-side validation using express-validator
- Client-side form validation
- Phone number format validation
- Email format validation
- Name length limits (100 chars)

### Security
- Rate limiting on registration endpoint
- Rate limiting on staff endpoints
- PIN-based staff authentication
- CORS configuration
- Input sanitization
- MongoDB injection protection via Mongoose

### Error Handling
- Graceful error messages
- Network error handling
- Database connection error handling
- Validation error feedback
- User-friendly error displays

### Database Schema
```javascript
Ticket {
  ticketNumber: String (A-001 format)
  fullName: String (max 100 chars)
  phone: String (validated format)
  email: String (optional, validated)
  status: Enum ['waiting', 'called', 'serving', 'done', 'no-show']
  calledAt: Date
  completedAt: Date
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Status Flow
```
waiting → serving → done
        ↘ no-show

waiting → called → serving → done
                  ↘ no-show
```

## API Endpoints

### Public Endpoints
- `POST /api/register` - Create new ticket
- `GET /api/queue` - Get current queue status
- `GET /health` - Health check

### Staff Endpoints (require PIN)
- `POST /api/staff/auth` - Verify PIN
- `GET /api/staff/tickets` - Get all active tickets
- `POST /api/staff/call-next` - Call next in queue
- `POST /api/staff/call-specific` - Call specific ticket
- `POST /api/staff/mark-done` - Mark as completed
- `POST /api/staff/mark-no-show` - Mark as no-show

## UI/UX Features

### Apple-like Minimal Design
- Clean, spacious layouts
- Rounded corners (rounded-2xl, rounded-3xl)
- Subtle shadows
- Gray color palette
- Large, readable typography
- Smooth transitions
- Focus states on interactive elements

### Responsive Design
- Mobile-friendly registration form
- Optimized for large TV displays
- Tablet-friendly staff panel
- Flexible grid layouts

### Accessibility
- Semantic HTML
- Proper form labels
- Focus indicators
- Color contrast compliance
- Keyboard navigation support

## Performance

### Optimizations
- Mongoose lean() queries for read operations
- Database indexes on status and createdAt
- Efficient Socket.io event handling
- Minimal bundle size with SvelteKit
- Auto-reconnection with exponential backoff

### Scalability Considerations
- Stateless API design
- MongoDB Atlas auto-scaling
- Socket.io horizontal scaling ready
- Rate limiting to prevent abuse
- Connection pooling via Mongoose

## Future Enhancement Ideas

1. SMS notifications when ticket is called
2. Email notifications
3. Multi-language support
4. Analytics dashboard
5. Historical data and reports
6. Multiple service counters
7. Priority queue support
8. Estimated wait time calculation
9. QR code ticket generation
10. Voice announcement integration
