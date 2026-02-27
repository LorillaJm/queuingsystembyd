# Staff Endpoints Documentation

Complete documentation for staff-protected endpoints with state transition rules.

## Authentication

All staff endpoints require the `x-staff-pin` header:

```bash
-H "x-staff-pin: 1234"
```

If missing or invalid, returns `401 Unauthorized`.

---

## State Transition Rules

### Valid Transitions

| From Status | To Status | Endpoint | Rule |
|------------|-----------|----------|------|
| WAITING | SERVING | `/staff/next` or `/staff/call` | Can be called |
| SERVING | DONE | `/staff/mark-done` | Service completed |
| SERVING | NOSHOW | `/staff/no-show` | Customer didn't show |
| WAITING | NOSHOW | `/staff/no-show` | Mark without calling |

### Invalid Transitions (Rejected)

| From Status | To Status | Reason |
|------------|-----------|--------|
| DONE | any | Final state, cannot change |
| NOSHOW | any | Final state, cannot change |
| WAITING | DONE | Must call first (SERVING) |

### Branch Rule

**Only ONE ticket can be SERVING per branch at any time.**

When calling next or specific ticket:
1. All current SERVING tickets → DONE
2. Target ticket → SERVING

---

## Endpoints

### 1. POST /api/staff/next

Call the next waiting customer.

**Request:**
```bash
curl -X POST http://localhost:3001/api/staff/next \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{
    "branch": "MAIN"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439011",
    "queueNo": "A-005",
    "fullName": "John Doe",
    "status": "SERVING",
    "calledAt": "2024-01-01T10:15:00.000Z"
  },
  "message": "Next ticket called successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "No tickets in queue",
  "message": "There are no waiting tickets to call"
}
```

**Behavior:**
1. Finds oldest WAITING ticket (by createdAt)
2. Marks all current SERVING tickets as DONE
3. Updates target ticket to SERVING
4. Emits Socket.io events: `queue:updated`, `ticket:called`

---

### 2. POST /api/staff/call

Call a specific ticket by queue number.

**Request:**
```bash
curl -X POST http://localhost:3001/api/staff/call \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{
    "branch": "MAIN",
    "queueNo": "A-008"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439014",
    "queueNo": "A-008",
    "fullName": "Alice Williams",
    "status": "SERVING",
    "calledAt": "2024-01-01T10:25:00.000Z"
  },
  "message": "Ticket called successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Ticket not found",
  "message": "No ticket found with queue number: A-999"
}
```

**Error Response (400 - Invalid Transition):**
```json
{
  "success": false,
  "error": "Invalid state transition",
  "message": "Cannot move DONE to SERVING"
}
```

**Behavior:**
1. Validates ticket exists and branch matches
2. Checks if transition is valid (WAITING/SERVING → SERVING)
3. Marks all other SERVING tickets as DONE
4. Updates target ticket to SERVING
5. Emits Socket.io events

---

### 3. POST /api/staff/mark-done

Mark a ticket as completed.

**Request:**
```bash
curl -X POST http://localhost:3001/api/staff/mark-done \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{
    "branch": "MAIN",
    "queueNo": "A-005"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439011",
    "queueNo": "A-005",
    "status": "DONE",
    "completedAt": "2024-01-01T10:30:00.000Z"
  },
  "message": "Ticket marked as done"
}
```

**Error Response (400 - Invalid Transition):**
```json
{
  "success": false,
  "error": "Invalid state transition",
  "message": "Cannot move WAITING to DONE"
}
```

**Behavior:**
1. Validates ticket exists
2. Checks if transition is valid (SERVING → DONE)
3. Updates status to DONE
4. Sets completedAt timestamp
5. Emits Socket.io event: `queue:updated`

---

### 4. POST /api/staff/no-show

Mark a ticket as no-show.

**Request:**
```bash
curl -X POST http://localhost:3001/api/staff/no-show \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{
    "branch": "MAIN",
    "queueNo": "A-007"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439013",
    "queueNo": "A-007",
    "status": "NOSHOW",
    "completedAt": "2024-01-01T10:35:00.000Z"
  },
  "message": "Ticket marked as no-show"
}
```

**Behavior:**
1. Validates ticket exists
2. Checks if transition is valid (WAITING/SERVING → NOSHOW)
3. Updates status to NOSHOW
4. Sets completedAt timestamp
5. Emits Socket.io event: `queue:updated`

---

### 5. GET /api/staff/tickets

Get all active tickets (WAITING and SERVING).

**Request:**
```bash
curl http://localhost:3001/api/staff/tickets?branch=MAIN \
  -H "x-staff-pin: 1234"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "ticketId": "507f1f77bcf86cd799439011",
        "queueNo": "A-005",
        "fullName": "Jane Smith",
        "mobile": "+1234567890",
        "model": "BMW X5",
        "branch": "MAIN",
        "purpose": "TEST_DRIVE",
        "status": "SERVING",
        "calledAt": "2024-01-01T10:15:00.000Z",
        "createdAt": "2024-01-01T10:00:00.000Z"
      },
      {
        "ticketId": "507f1f77bcf86cd799439012",
        "queueNo": "A-006",
        "fullName": "Bob Johnson",
        "mobile": "+1234567891",
        "model": "Audi A4",
        "branch": "MAIN",
        "purpose": "SERVICE",
        "status": "WAITING",
        "calledAt": null,
        "createdAt": "2024-01-01T10:05:00.000Z"
      }
    ],
    "count": 2
  }
}
```

---

### 6. GET /api/staff/stats

Get queue statistics for a branch.

**Request:**
```bash
curl "http://localhost:3001/api/staff/stats?branch=MAIN" \
  -H "x-staff-pin: 1234"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "branch": "MAIN",
    "waiting": 15,
    "serving": 1,
    "done": 42,
    "noshow": 3,
    "total": 61
  }
}
```

---

## Transaction Safety

All state-changing operations use MongoDB transactions to ensure:

1. **Atomicity**: All changes succeed or all fail
2. **Consistency**: Only one SERVING ticket per branch
3. **Isolation**: Concurrent requests don't interfere
4. **Durability**: Changes are persisted

Example transaction flow for `/staff/next`:

```javascript
await session.withTransaction(async () => {
  // Step 1: Mark current SERVING as DONE
  await Registration.updateMany(
    { branch: 'MAIN', status: 'SERVING' },
    { status: 'DONE', completedAt: new Date() },
    { session }
  );

  // Step 2: Find next WAITING
  const next = await Registration.findOne(
    { branch: 'MAIN', status: 'WAITING' }
  ).sort({ createdAt: 1 }).session(session);

  // Step 3: Update to SERVING
  next.status = 'SERVING';
  next.calledAt = new Date();
  await next.save({ session });
});
```

---

## Socket.io Events

### queue:updated

Emitted when queue state changes.

**Payload:**
```json
{
  "branch": "MAIN"
}
```

**When emitted:**
- After calling next
- After calling specific
- After marking done
- After marking no-show

### ticket:called

Emitted when a ticket is called.

**Payload:**
```json
{
  "queueNo": "A-005",
  "fullName": "John Doe",
  "branch": "MAIN"
}
```

**When emitted:**
- After calling next
- After calling specific

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Operation completed |
| 400 | Bad Request | Invalid transition, validation error |
| 401 | Unauthorized | Missing or invalid PIN |
| 404 | Not Found | Ticket not found, no tickets in queue |
| 500 | Server Error | Database error, unexpected error |

---

## Testing Workflow

### Complete Staff Flow

```bash
# 1. Authenticate
curl -X POST http://localhost:3001/api/staff/auth \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'

# 2. Get active tickets
curl "http://localhost:3001/api/staff/tickets?branch=MAIN" \
  -H "x-staff-pin: 1234"

# 3. Call next customer
curl -X POST http://localhost:3001/api/staff/next \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{"branch":"MAIN"}'

# 4. Mark as done
curl -X POST http://localhost:3001/api/staff/mark-done \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{"branch":"MAIN","queueNo":"A-001"}'

# 5. Get statistics
curl "http://localhost:3001/api/staff/stats?branch=MAIN" \
  -H "x-staff-pin: 1234"
```

### Test Invalid Transitions

```bash
# Try to mark WAITING as DONE (should fail)
curl -X POST http://localhost:3001/api/staff/mark-done \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{"branch":"MAIN","queueNo":"A-002"}'

# Expected: 400 Bad Request
# "Cannot move WAITING to DONE"
```

### Test Branch Rule

```bash
# Call ticket A-001
curl -X POST http://localhost:3001/api/staff/call \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{"branch":"MAIN","queueNo":"A-001"}'

# Call ticket A-002 (A-001 should become DONE)
curl -X POST http://localhost:3001/api/staff/call \
  -H "Content-Type: application/json" \
  -H "x-staff-pin: 1234" \
  -d '{"branch":"MAIN","queueNo":"A-002"}'

# Verify only A-002 is SERVING
curl "http://localhost:3001/api/staff/tickets?branch=MAIN" \
  -H "x-staff-pin: 1234"
```

---

## Best Practices

1. **Always include branch parameter** - Required for all operations
2. **Check response status** - Handle errors appropriately
3. **Listen to Socket.io events** - Update UI in real-time
4. **Validate transitions** - Check current status before operations
5. **Handle 404 gracefully** - Queue might be empty
6. **Secure PIN** - Change default PIN in production
7. **Rate limiting** - Respect 30 requests/minute limit

---

## Security Notes

- PIN is validated against `settings.staffPin` in database
- PIN is sent in header, not URL (more secure)
- All endpoints require authentication
- Rate limiting prevents brute force attacks
- Transactions prevent race conditions
- Input validation prevents injection attacks

---

## Integration Example

```javascript
// Frontend integration example
async function callNextCustomer(branch) {
  try {
    const response = await fetch('http://localhost:3001/api/staff/next', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-staff-pin': localStorage.getItem('staffPin')
      },
      body: JSON.stringify({ branch })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        alert('No customers in queue');
      } else if (response.status === 401) {
        alert('Invalid PIN');
      } else {
        alert(data.message || 'Error calling customer');
      }
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('Error:', error);
    alert('Network error');
    return null;
  }
}
```
