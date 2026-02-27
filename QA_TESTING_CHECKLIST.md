# QA Testing Checklist

Complete testing checklist before production deployment.

## Pre-Testing Setup

- [ ] MongoDB Atlas cluster is running
- [ ] API server is running (dev or production)
- [ ] Web app is running (dev or production)
- [ ] All environment variables are configured
- [ ] Settings collection is initialized with branches and staff PIN

---

## 1. Registration Flow

### Basic Registration
- [ ] Open registration page (/)
- [ ] Fill in all required fields (Full Name, Mobile, Model, Branch, Purpose)
- [ ] Submit form
- [ ] Verify queue number is displayed (format: A-001, B-001, etc.)
- [ ] Verify branch is shown
- [ ] Click "Register Another" and verify form resets

### Validation Testing
- [ ] Try submitting with empty Full Name → Should show error
- [ ] Try submitting with name < 2 characters → Should show error
- [ ] Try submitting with empty Mobile → Should show error
- [ ] Try submitting with invalid mobile (letters) → Should show error
- [ ] Try submitting with mobile < 10 digits → Should show error
- [ ] Try submitting with empty Model → Should show error
- [ ] Verify real-time validation on blur works for all fields
- [ ] Verify submit button is disabled when validation errors exist

### Edge Cases
- [ ] Submit with very long name (100+ chars) → Should be truncated or rejected
- [ ] Submit with special characters in name → Should work
- [ ] Submit with international phone format (+63, +1, etc.) → Should work
- [ ] Submit multiple registrations quickly → All should get unique queue numbers

---

## 2. Queue Number Generation

### Concurrency Safety
- [ ] Open 5+ browser tabs
- [ ] Register simultaneously from all tabs
- [ ] Verify all get unique queue numbers (no duplicates)
- [ ] Check MongoDB queuestates collection → lastNumber should match highest number

### Daily Reset
- [ ] Check current dateKey in queuestates collection (YYYY-MM-DD format)
- [ ] Note the lastNumber value
- [ ] Change system date to next day OR wait until midnight Manila time
- [ ] Register new ticket
- [ ] Verify queue number resets to 001
- [ ] Verify new dateKey is created in queuestates

### Branch Isolation
- [ ] Register ticket for Branch A (MAIN)
- [ ] Register ticket for Branch B (NORTH)
- [ ] Verify Branch A gets A-001, A-002, etc.
- [ ] Verify Branch B gets B-001, B-002, etc.
- [ ] Verify numbers are independent per branch

### Maximum Queue Limit
- [ ] Check maxQueuePerDay in settings (default: 999)
- [ ] If testing: temporarily set to 3
- [ ] Register 3 tickets
- [ ] Try registering 4th ticket → Should fail with "Maximum queue limit reached"
- [ ] Reset maxQueuePerDay to 999

---

## 3. TV Display Screen (/screen)

### Basic Display
- [ ] Open /screen?branch=MAIN
- [ ] Verify "NOW SERVING" section shows correctly
- [ ] Verify "NEXT" section shows next 3 queue numbers
- [ ] Verify large, readable typography (optimized for 1080p)
- [ ] Verify connection status indicator (green = connected)

### Real-time Updates
- [ ] Keep screen open
- [ ] From staff panel, call next ticket
- [ ] Verify screen updates immediately (within 1-2 seconds)
- [ ] Verify smooth fade/fly animation
- [ ] Verify notification sound plays (ding)
- [ ] Verify "NEXT" list updates to show new next 3

### Branch Filtering
- [ ] Open /screen?branch=MAIN
- [ ] Open /screen?branch=NORTH in another tab
- [ ] Call ticket in MAIN branch
- [ ] Verify only MAIN screen updates, not NORTH
- [ ] Call ticket in NORTH branch
- [ ] Verify only NORTH screen updates, not MAIN

### Connection Handling
- [ ] Open screen
- [ ] Stop API server
- [ ] Verify connection indicator turns red/yellow
- [ ] Restart API server
- [ ] Verify screen reconnects automatically
- [ ] Verify data refreshes

---

## 4. MC/Announcer View (/mc)

### Basic Display
- [ ] Open /mc?branch=MAIN
- [ ] Verify "NOW SERVING" shows queue number + full name
- [ ] Verify "NEXT UP" shows next 5 customers with names
- [ ] Verify clean, readable layout

### Real-time Updates
- [ ] Keep MC view open
- [ ] Call next ticket from staff panel
- [ ] Verify MC view updates immediately
- [ ] Verify full name is visible for announcer to read

### Search Functionality
- [ ] Register ticket and note queue number (e.g., A-005)
- [ ] In MC view, use search to find A-005
- [ ] Verify ticket details are shown
- [ ] Try searching for non-existent ticket → Should show "not found"

### Branch Filtering
- [ ] Open /mc?branch=MAIN
- [ ] Open /mc?branch=NORTH in another tab
- [ ] Verify each shows only tickets for their branch
- [ ] Call ticket in MAIN → Only MAIN MC view updates

### Fallback Polling
- [ ] Open MC view
- [ ] Stop API server
- [ ] Wait 10 seconds
- [ ] Verify fallback polling attempts (check console)
- [ ] Restart API server
- [ ] Verify MC view recovers and shows data

---

## 5. Staff Panel (/staff)

### Authentication
- [ ] Open /staff
- [ ] Try logging in with wrong PIN → Should show error
- [ ] Try logging in with correct PIN (default: 1234) → Should succeed
- [ ] Verify staff panel loads with ticket list

### Call Next
- [ ] Register 3+ tickets
- [ ] Click "Call Next"
- [ ] Verify oldest WAITING ticket moves to SERVING
- [ ] Verify previous SERVING ticket moves to DONE (if any)
- [ ] Verify only ONE ticket is SERVING at a time
- [ ] Verify TV screen and MC view update

### Call Specific
- [ ] Register ticket and note queue number (e.g., A-003)
- [ ] In staff panel, use "Call Specific" with A-003
- [ ] Verify A-003 moves to SERVING
- [ ] Verify previous SERVING moves to DONE
- [ ] Try calling already DONE ticket → Should handle gracefully

### Mark Done
- [ ] Call a ticket (status: SERVING)
- [ ] Click "Mark Done"
- [ ] Verify ticket status changes to DONE
- [ ] Verify ticket disappears from SERVING section
- [ ] Verify completedAt timestamp is set

### Mark No-Show
- [ ] Call a ticket (status: SERVING)
- [ ] Click "Mark No-Show"
- [ ] Verify ticket status changes to NOSHOW
- [ ] Verify ticket is removed from active queue

### State Transition Rules
- [ ] Verify WAITING → SERVING works
- [ ] Verify SERVING → DONE works
- [ ] Verify SERVING → NOSHOW works
- [ ] Try illegal transitions (e.g., DONE → WAITING) → Should be prevented
- [ ] Verify only ONE SERVING ticket per branch at any time

### Branch Filtering
- [ ] Select Branch A (MAIN)
- [ ] Verify only Branch A tickets are shown
- [ ] Switch to Branch B (NORTH)
- [ ] Verify only Branch B tickets are shown
- [ ] Call next in Branch A → Should not affect Branch B

---

## 6. API Endpoints

### Public Endpoints

#### POST /api/register
```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "mobile": "+63 912 345 6789",
    "model": "Toyota Camry",
    "branch": "MAIN",
    "purpose": "TEST_DRIVE"
  }'
```
- [ ] Returns 201 with ticket data
- [ ] Returns queueNo in correct format (A-001)
- [ ] Returns ticketId (MongoDB ObjectId)

#### GET /api/ticket/:id
```bash
curl http://localhost:3001/api/ticket/[TICKET_ID]
```
- [ ] Returns 200 with ticket details
- [ ] Returns 404 for non-existent ticket
- [ ] Returns 400 for invalid ID format

#### GET /api/queue?branch=MAIN
```bash
curl http://localhost:3001/api/queue?branch=MAIN
```
- [ ] Returns 200 with queue status
- [ ] Shows currentServing (if any)
- [ ] Shows nextUp (next 3 waiting)
- [ ] Shows waitingCount
- [ ] Returns 400 for missing branch parameter
- [ ] Returns 400 for invalid branch

#### GET /api/branches
```bash
curl http://localhost:3001/api/branches
```
- [ ] Returns 200 with list of active branches
- [ ] Each branch has code, name, prefix

### Staff Endpoints

#### POST /api/staff/auth
```bash
curl -X POST http://localhost:3001/api/staff/auth \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234"}'
```
- [ ] Returns 200 for correct PIN
- [ ] Returns 401 for incorrect PIN
- [ ] Returns 400 for missing PIN

#### POST /api/staff/next
```bash
curl -X POST http://localhost:3001/api/staff/next \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{"branch": "MAIN"}'
```
- [ ] Returns 200 with called ticket
- [ ] Moves oldest WAITING to SERVING
- [ ] Previous SERVING moves to DONE
- [ ] Returns 404 if no waiting tickets
- [ ] Returns 401 for missing/invalid PIN

#### POST /api/staff/call
```bash
curl -X POST http://localhost:3001/api/staff/call \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{"branch": "MAIN", "queueNo": "A-001"}'
```
- [ ] Returns 200 with called ticket
- [ ] Sets specified ticket to SERVING
- [ ] Previous SERVING moves to DONE
- [ ] Returns 404 for non-existent ticket
- [ ] Returns 401 for missing/invalid PIN

#### POST /api/staff/mark-done
```bash
curl -X POST http://localhost:3001/api/staff/mark-done \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{"branch": "MAIN", "queueNo": "A-001"}'
```
- [ ] Returns 200 with updated ticket
- [ ] Sets ticket status to DONE
- [ ] Sets completedAt timestamp
- [ ] Returns 404 for non-existent ticket
- [ ] Returns 401 for missing/invalid PIN

#### POST /api/staff/no-show
```bash
curl -X POST http://localhost:3001/api/staff/no-show \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{"branch": "MAIN", "queueNo": "A-001"}'
```
- [ ] Returns 200 with updated ticket
- [ ] Sets ticket status to NOSHOW
- [ ] Returns 404 for non-existent ticket
- [ ] Returns 401 for missing/invalid PIN

### Rate Limiting
- [ ] Make 11+ registration requests within 15 minutes → Should be rate limited
- [ ] Make 31+ staff requests within 1 minute → Should be rate limited
- [ ] Verify 429 status code is returned
- [ ] Verify rate limit resets after time window

---

## 7. Socket.io Real-time

### Connection
- [ ] Open browser console on any page
- [ ] Verify Socket.io connection established
- [ ] Check for "connected" message in console
- [ ] Verify no connection errors

### Room Joining
- [ ] Open /screen?branch=MAIN
- [ ] Check console for "joined branch:MAIN" message
- [ ] Open /screen?branch=NORTH
- [ ] Check console for "joined branch:NORTH" message

### Event Broadcasting
- [ ] Open screen, MC, and staff panel for same branch
- [ ] Call next ticket from staff panel
- [ ] Verify all three pages update simultaneously
- [ ] Check console for "queue:updated" event

### Cross-Branch Isolation
- [ ] Open /screen?branch=MAIN
- [ ] Open /screen?branch=NORTH
- [ ] Call ticket in MAIN
- [ ] Verify only MAIN screen updates
- [ ] Verify NORTH screen does NOT update

---

## 8. Security

### CORS
- [ ] Verify CORS_ORIGIN is set correctly
- [ ] Try accessing API from unauthorized origin → Should be blocked
- [ ] Verify API works from configured origin

### Helmet Security Headers
- [ ] Check response headers include:
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: SAMEORIGIN
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Strict-Transport-Security (in production)

### Input Sanitization
- [ ] Try SQL injection in name field → Should be sanitized
- [ ] Try XSS in name field (<script>alert('xss')</script>) → Should be escaped
- [ ] Try very long inputs → Should be truncated or rejected
- [ ] Try special characters → Should be handled safely

### Staff PIN Protection
- [ ] Verify staff endpoints require x-staff-pin header
- [ ] Verify wrong PIN returns 401
- [ ] Verify missing PIN returns 401
- [ ] Verify PIN is not exposed in responses

---

## 9. Database

### MongoDB Connection
- [ ] Verify API connects to MongoDB on startup
- [ ] Check logs for "Connected to MongoDB" message
- [ ] Verify retry logic works (stop MongoDB, start API, start MongoDB)

### Collections
- [ ] Verify registrations collection exists
- [ ] Verify queuestates collection exists
- [ ] Verify settings collection exists
- [ ] Verify indexes are created (queueNo unique, branch+dateKey compound)

### Data Integrity
- [ ] Register ticket → Check registrations collection
- [ ] Verify queueNo is unique
- [ ] Verify branch is uppercase
- [ ] Verify status is WAITING initially
- [ ] Verify timestamps (createdAt, updatedAt) are set

### Transactions
- [ ] Call next ticket
- [ ] Verify both tickets (old SERVING, new SERVING) update atomically
- [ ] If transaction fails, verify no partial updates

---

## 10. Performance

### Load Testing
- [ ] Register 100 tickets rapidly (use script or tool)
- [ ] Verify all get unique queue numbers
- [ ] Verify no errors or timeouts
- [ ] Check API response times (should be < 500ms)

### Concurrent Users
- [ ] Open 10+ browser tabs
- [ ] Perform actions simultaneously
- [ ] Verify no race conditions
- [ ] Verify no duplicate queue numbers

### Memory Leaks
- [ ] Run API for extended period (1+ hours)
- [ ] Monitor memory usage
- [ ] Verify no memory leaks
- [ ] Check for unclosed connections

---

## 11. Error Handling

### Network Errors
- [ ] Stop API server while web app is running
- [ ] Verify graceful error messages (not crashes)
- [ ] Restart API
- [ ] Verify web app recovers

### Database Errors
- [ ] Stop MongoDB while API is running
- [ ] Try registering ticket → Should show error
- [ ] Restart MongoDB
- [ ] Verify API reconnects automatically

### Invalid Data
- [ ] Send malformed JSON to API → Should return 400
- [ ] Send missing required fields → Should return 400 with details
- [ ] Send invalid data types → Should return 400

---

## 12. Timezone & Daily Reset

### Timezone Configuration
- [ ] Verify TZ=Asia/Manila is set in environment
- [ ] Check /health endpoint → Should show timezone: Asia/Manila
- [ ] Verify server logs show Manila time

### Daily Reset Verification
- [ ] Note current dateKey in queuestates (YYYY-MM-DD)
- [ ] Note lastNumber value
- [ ] Wait until midnight Manila time OR change system date
- [ ] Register new ticket
- [ ] Verify new dateKey is created
- [ ] Verify lastNumber resets to 1
- [ ] Verify queue number is X-001 (where X is branch prefix)

---

## 13. Production Deployment

### Environment Variables
- [ ] All required env vars are set
- [ ] No default/development values in production
- [ ] Secrets are not in code or git
- [ ] CORS_ORIGIN matches production domain
- [ ] NODE_ENV=production

### MongoDB Atlas
- [ ] Cluster is running
- [ ] IP whitelist is configured
- [ ] Database user has correct permissions
- [ ] Connection string is correct
- [ ] Settings collection is initialized

### Health Check
- [ ] Access /health endpoint
- [ ] Verify status: ok
- [ ] Verify mongodb: connected
- [ ] Verify timezone: Asia/Manila
- [ ] Verify environment: production

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up log aggregation
- [ ] Configure alerts for downtime

---

## 14. User Experience

### Mobile Responsiveness
- [ ] Open registration page on mobile
- [ ] Verify form is usable
- [ ] Verify buttons are tappable
- [ ] Verify text is readable
- [ ] Test on iOS and Android

### Accessibility
- [ ] Verify all form inputs have labels
- [ ] Verify error messages are clear
- [ ] Verify color contrast is sufficient
- [ ] Test with screen reader (basic check)
- [ ] Verify keyboard navigation works

### Loading States
- [ ] Verify loading indicators show during API calls
- [ ] Verify buttons are disabled during loading
- [ ] Verify no double-submissions possible

### Error Messages
- [ ] Verify error messages are user-friendly
- [ ] Verify technical details are hidden in production
- [ ] Verify errors don't crash the app

---

## 15. Documentation

- [ ] README.md is up to date
- [ ] QUICK_START.md has correct instructions
- [ ] PRODUCTION_DEPLOYMENT.md is complete
- [ ] API_EXAMPLES.md has working examples
- [ ] All environment variables are documented
- [ ] Troubleshooting section is helpful

---

## Sign-off

### Tested By
- Name: ___________________________
- Date: ___________________________
- Environment: [ ] Development [ ] Staging [ ] Production

### Issues Found
- [ ] No critical issues
- [ ] All issues documented and tracked
- [ ] All blockers resolved

### Approval
- [ ] QA Lead: ___________________________
- [ ] Tech Lead: ___________________________
- [ ] Product Owner: ___________________________

---

## Notes

Use this space to document any issues, observations, or recommendations:

```
[Your notes here]
```
