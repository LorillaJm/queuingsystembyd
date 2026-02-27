# Testing Guide

## Manual Testing Checklist

### 1. Registration Flow

#### Test Case 1.1: Successful Registration
1. Navigate to http://localhost:5173
2. Fill in:
   - Full Name: "John Doe"
   - Phone: "+1 234 567 8900"
   - Email: "john@example.com"
3. Click "Get Queue Number"
4. ✓ Should display ticket number (e.g., A-001)
5. ✓ Should show success message

#### Test Case 1.2: Registration Without Email
1. Fill in only name and phone
2. Leave email empty
3. Click "Get Queue Number"
4. ✓ Should succeed (email is optional)

#### Test Case 1.3: Validation Errors
1. Try submitting with empty name
2. ✓ Should show validation error
3. Try invalid phone format
4. ✓ Should show validation error
5. Try invalid email format
6. ✓ Should show validation error

#### Test Case 1.4: Rate Limiting
1. Submit 11 registrations quickly from same IP
2. ✓ 11th request should be rate limited

### 2. TV Display Screen

#### Test Case 2.1: Initial Load
1. Navigate to http://localhost:5173/display
2. ✓ Should show "—" if no tickets
3. ✓ Should have dark theme
4. ✓ Should show NOW SERVING and NEXT sections

#### Test Case 2.2: Real-time Updates
1. Keep display screen open
2. Register a new ticket in another tab
3. ✓ Display should update automatically
4. Call next from staff panel
5. ✓ NOW SERVING should update
6. ✓ NEXT section should update

### 3. MC View

#### Test Case 3.1: Display Customer Info
1. Navigate to http://localhost:5173/mc
2. Register a ticket and call it from staff panel
3. ✓ Should show ticket number (large)
4. ✓ Should show customer full name
5. ✓ Should update in real-time

### 4. Staff Control Panel

#### Test Case 4.1: Authentication
1. Navigate to http://localhost:5173/staff
2. Enter wrong PIN
3. ✓ Should show error
4. Enter correct PIN (1234)
5. ✓ Should login successfully
6. ✓ PIN should be saved in localStorage

#### Test Case 4.2: Call Next
1. Register 3 tickets
2. Login to staff panel
3. ✓ Should see all 3 tickets with "waiting" status
4. Click "Call Next Customer"
5. ✓ First ticket should change to "serving"
6. ✓ Display screen should update
7. ✓ MC view should show customer name

#### Test Case 4.3: Call Specific
1. Have multiple waiting tickets
2. Click "Call" on a specific ticket (not first)
3. ✓ That ticket should be called
4. ✓ Previous serving ticket should be marked done
5. ✓ All screens should update

#### Test Case 4.4: Mark Done
1. Have a serving ticket
2. Click "Done" button
3. ✓ Ticket should be marked as done
4. ✓ Ticket should disappear from queue
5. ✓ Display should update

#### Test Case 4.5: Mark No-Show
1. Have a serving ticket
2. Click "No-Show" button
3. ✓ Ticket should be marked as no-show
4. ✓ Ticket should disappear from queue
5. ✓ Display should update

#### Test Case 4.6: Logout
1. Click "Logout"
2. ✓ Should return to login screen
3. ✓ localStorage should be cleared

### 5. Real-time Synchronization

#### Test Case 5.1: Multi-Screen Sync
1. Open 4 browser windows:
   - Registration form
   - TV Display
   - MC View
   - Staff Panel
2. Register a ticket
3. ✓ All screens should update
4. Call next from staff panel
5. ✓ All screens should update simultaneously
6. Mark as done
7. ✓ All screens should update

#### Test Case 5.2: Connection Recovery
1. Stop the API server
2. ✓ Screens should show disconnected state (check console)
3. Restart API server
4. ✓ Screens should reconnect automatically
5. ✓ Data should sync

### 6. Edge Cases

#### Test Case 6.1: Empty Queue
1. Ensure no tickets in queue
2. Click "Call Next" in staff panel
3. ✓ Should show "No tickets in queue" error

#### Test Case 6.2: Ticket Number Format
1. Register tickets throughout the day
2. ✓ First ticket: A-001
3. ✓ Second ticket: A-002
4. ✓ Tenth ticket: A-010
5. ✓ Format should be consistent

#### Test Case 6.3: Long Names
1. Register with 100 character name
2. ✓ Should succeed
3. Try 101 characters
4. ✓ Should be rejected

#### Test Case 6.4: Special Characters
1. Try phone with special chars: "+1 (234) 567-8900"
2. ✓ Should be accepted
3. Try name with special chars: "O'Brien"
4. ✓ Should be accepted

## API Testing with curl

### Register a Ticket
```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phone": "+1234567890",
    "email": "test@example.com"
  }'
```

### Get Queue Status
```bash
curl http://localhost:3001/api/queue
```

### Staff Authentication
```bash
curl -X POST http://localhost:3001/api/staff/auth \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234"}'
```

### Call Next (with PIN)
```bash
curl -X POST http://localhost:3001/api/staff/call-next \
  -H "Content-Type: application/json" \
  -H "X-Staff-Pin: 1234"
```

### Get Staff Tickets
```bash
curl http://localhost:3001/api/staff/tickets \
  -H "X-Staff-Pin: 1234"
```

## Performance Testing

### Load Test Registration
```bash
# Install Apache Bench (ab) if not available
# Test 100 requests with 10 concurrent
ab -n 100 -c 10 -T "application/json" \
  -p registration.json \
  http://localhost:3001/api/register
```

Create `registration.json`:
```json
{
  "fullName": "Load Test User",
  "phone": "+1234567890",
  "email": "loadtest@example.com"
}
```

## Browser Compatibility

Test on:
- ✓ Chrome/Edge (latest)
- ✓ Firefox (latest)
- ✓ Safari (latest)
- ✓ Mobile browsers (iOS Safari, Chrome Mobile)

## Known Issues / Limitations

1. Ticket numbers reset daily (by design)
2. No pagination on staff panel (fine for small queues)
3. PIN stored in localStorage (consider more secure approach for production)
4. Single staff PIN for all staff (consider individual accounts for production)
5. No ticket history view (only active tickets shown)

## Success Criteria

All test cases should pass with:
- ✓ No console errors
- ✓ Real-time updates working
- ✓ Data persistence in MongoDB
- ✓ Proper error handling
- ✓ Responsive UI on all screen sizes
