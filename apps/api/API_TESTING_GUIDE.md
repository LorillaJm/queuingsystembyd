# API Testing Guide

Complete guide for testing the Queue Management API.

## Prerequisites

1. **Start the API server:**
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Ensure MongoDB is connected** (check console output)

3. **Initialize settings** (happens automatically on first run)

## Quick Test

Run the automated end-to-end test:

```bash
npm run test:api
```

This will test all endpoints and report results.

---

## Manual Testing with cURL

### Step 1: Health Check

Verify the API is running:

```bash
curl http://localhost:3001/health
```

Expected: `{"status":"ok","timestamp":"..."}`

---

### Step 2: Get Available Branches

```bash
curl http://localhost:3001/api/branches
```

Expected: List of branches with codes, names, and prefixes.

---

### Step 3: Register a Customer

```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "mobile": "+1234567890",
    "model": "Tesla Model 3",
    "branch": "MAIN",
    "purpose": "TEST_DRIVE"
  }'
```

Expected: 
- Status: 201
- Response includes `ticketId` and `queueNo`
- Save the `ticketId` for next steps

---

### Step 4: Get Ticket Information

Replace `TICKET_ID` with the ID from step 3:

```bash
curl http://localhost:3001/api/ticket/TICKET_ID
```

Expected: Full ticket details including status, timestamps, etc.

---

### Step 5: Check Queue Status

```bash
curl "http://localhost:3001/api/queue?branch=MAIN"
```

Expected:
- Current serving ticket (if any)
- Next 3 waiting tickets
- Total waiting count
- Last updated timestamp

---

### Step 6: Staff Authentication

```bash
curl -X POST http://localhost:3001/api/staff/auth \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234"}'
```

Expected: `{"success":true,"message":"Authentication successful"}`

---

### Step 7: Get Staff Tickets

```bash
curl http://localhost:3001/api/staff/tickets?branch=MAIN \
  -H "X-Staff-Pin: 1234"
```

Expected: List of all active (WAITING and SERVING) tickets.

---

### Step 8: Call Next Customer

```bash
curl -X POST http://localhost:3001/api/staff/call-next \
  -H "Content-Type: application/json" \
  -H "X-Staff-Pin: 1234" \
  -d '{"branch": "MAIN"}'
```

Expected: Next waiting ticket is called and status changes to SERVING.

---

### Step 9: Mark Ticket as Done

Replace `QUEUE_NO` with an actual queue number:

```bash
curl -X POST http://localhost:3001/api/staff/mark-done \
  -H "Content-Type: application/json" \
  -H "X-Staff-Pin: 1234" \
  -d '{"queueNo": "A-001"}'
```

Expected: Ticket status changes to DONE.

---

## Testing Validation

### Test Invalid Registration

```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "X",
    "mobile": "123",
    "model": "",
    "branch": "INVALID"
  }'
```

Expected: 
- Status: 400
- Response includes validation errors

---

### Test Invalid PIN

```bash
curl -X POST http://localhost:3001/api/staff/auth \
  -H "Content-Type: application/json" \
  -d '{"pin": "wrong"}'
```

Expected:
- Status: 401
- Error: "Invalid PIN"

---

### Test Missing Authentication

```bash
curl http://localhost:3001/api/staff/tickets
```

Expected:
- Status: 401
- Error: "Unauthorized"

---

## Testing Rate Limiting

Run this script to test rate limiting:

```bash
for i in {1..12}; do
  curl -X POST http://localhost:3001/api/register \
    -H "Content-Type: application/json" \
    -d "{
      \"fullName\": \"Rate Test $i\",
      \"mobile\": \"+123456789$i\",
      \"model\": \"Test\",
      \"branch\": \"MAIN\",
      \"purpose\": \"TEST_DRIVE\"
    }"
  echo ""
done
```

Expected: After 10 requests, you should get 429 (Too Many Requests).

---

## Testing with Postman

### Import Collection

Create a Postman collection with these requests:

1. **Health Check**
   - GET `http://localhost:3001/health`

2. **Get Branches**
   - GET `http://localhost:3001/api/branches`

3. **Register**
   - POST `http://localhost:3001/api/register`
   - Body (JSON):
     ```json
     {
       "fullName": "{{$randomFullName}}",
       "mobile": "+{{$randomPhoneNumber}}",
       "model": "{{$randomProduct}}",
       "branch": "MAIN",
       "purpose": "TEST_DRIVE"
     }
     ```

4. **Get Ticket**
   - GET `http://localhost:3001/api/ticket/{{ticketId}}`

5. **Get Queue**
   - GET `http://localhost:3001/api/queue?branch=MAIN`

6. **Staff Auth**
   - POST `http://localhost:3001/api/staff/auth`
   - Body: `{"pin": "1234"}`

7. **Get Staff Tickets**
   - GET `http://localhost:3001/api/staff/tickets?branch=MAIN`
   - Headers: `X-Staff-Pin: 1234`

8. **Call Next**
   - POST `http://localhost:3001/api/staff/call-next`
   - Headers: `X-Staff-Pin: 1234`
   - Body: `{"branch": "MAIN"}`

9. **Mark Done**
   - POST `http://localhost:3001/api/staff/mark-done`
   - Headers: `X-Staff-Pin: 1234`
   - Body: `{"queueNo": "A-001"}`

---

## Testing Real-time Updates

### Terminal 1: Watch Queue Status

```bash
watch -n 2 'curl -s "http://localhost:3001/api/queue?branch=MAIN" | jq'
```

### Terminal 2: Register Customers

```bash
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/register \
    -H "Content-Type: application/json" \
    -d "{
      \"fullName\": \"Customer $i\",
      \"mobile\": \"+123456789$i\",
      \"model\": \"Model $i\",
      \"branch\": \"MAIN\",
      \"purpose\": \"TEST_DRIVE\"
    }"
  sleep 2
done
```

### Terminal 3: Call Customers

```bash
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/staff/call-next \
    -H "Content-Type: application/json" \
    -H "X-Staff-Pin: 1234" \
    -d '{"branch": "MAIN"}'
  sleep 3
done
```

Watch Terminal 1 to see real-time queue updates!

---

## Testing Multiple Branches

```bash
# Register to different branches
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Main Customer","mobile":"+1111111111","model":"Car A","branch":"MAIN","purpose":"TEST_DRIVE"}'

curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"North Customer","mobile":"+2222222222","model":"Car B","branch":"NORTH","purpose":"SERVICE"}'

# Check queues
curl "http://localhost:3001/api/queue?branch=MAIN"
curl "http://localhost:3001/api/queue?branch=NORTH"
```

Expected: Each branch has independent queue numbers (A-001, B-001, etc.)

---

## Testing Concurrency

Run multiple registrations simultaneously:

```bash
# Using GNU parallel (if installed)
parallel -j 10 curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Concurrent {}","mobile":"+123456789{}","model":"Test","branch":"MAIN","purpose":"TEST_DRIVE"}' \
  ::: {1..10}

# Or using background jobs
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/register \
    -H "Content-Type: application/json" \
    -d "{\"fullName\":\"Concurrent $i\",\"mobile\":\"+123456789$i\",\"model\":\"Test\",\"branch\":\"MAIN\",\"purpose\":\"TEST_DRIVE\"}" &
done
wait
```

Expected: All 10 registrations get unique queue numbers (no duplicates).

---

## Verification Checklist

After testing, verify:

- [ ] All registrations have unique queue numbers
- [ ] No duplicate queue numbers exist
- [ ] Queue numbers are sequential per branch
- [ ] Status transitions work correctly (WAITING → SERVING → DONE)
- [ ] Rate limiting blocks excessive requests
- [ ] Invalid inputs are rejected with proper error messages
- [ ] Staff authentication works correctly
- [ ] Unauthorized requests are blocked
- [ ] Multiple branches work independently
- [ ] Real-time updates work (if using Socket.io client)

---

## Common Issues

### Issue: "Connection refused"
**Solution:** Ensure API server is running (`npm run dev`)

### Issue: "Invalid branch"
**Solution:** Check available branches with `/api/branches` endpoint

### Issue: "Unauthorized"
**Solution:** Include `X-Staff-Pin` header with correct PIN

### Issue: "Validation failed"
**Solution:** Check request body matches required format

### Issue: "Too many requests"
**Solution:** Wait 15 minutes or restart server to reset rate limit

---

## Performance Testing

### Load Test with Apache Bench

```bash
# Install Apache Bench (ab)
# Ubuntu: sudo apt-get install apache2-utils
# Mac: brew install httpd

# Test registration endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -T "application/json" \
  -p registration.json \
  http://localhost:3001/api/register
```

Create `registration.json`:
```json
{
  "fullName": "Load Test User",
  "mobile": "+1234567890",
  "model": "Test Model",
  "branch": "MAIN",
  "purpose": "TEST_DRIVE"
}
```

Expected: All requests should succeed with unique queue numbers.

---

## Debugging

### Enable Verbose Logging

Set environment variable:
```bash
DEBUG=* npm run dev
```

### Check MongoDB Queries

Add to server.js:
```javascript
mongoose.set('debug', true);
```

### Monitor Rate Limits

Check response headers:
```bash
curl -i http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","mobile":"+1234567890","model":"Test","branch":"MAIN","purpose":"TEST_DRIVE"}'
```

Look for:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## Success Criteria

All tests pass when:

✅ Health check returns 200
✅ All endpoints return proper status codes
✅ Validation catches invalid inputs
✅ Authentication blocks unauthorized access
✅ Rate limiting prevents abuse
✅ Queue numbers are unique and sequential
✅ Multiple branches work independently
✅ Concurrent requests don't create duplicates
✅ Error messages are clear and helpful
✅ Response format is consistent

---

## Next Steps

After successful testing:

1. Update frontend to use new API endpoints
2. Configure production environment variables
3. Set up monitoring and logging
4. Deploy to production
5. Run smoke tests in production

For more examples, see [API_EXAMPLES.md](API_EXAMPLES.md)
