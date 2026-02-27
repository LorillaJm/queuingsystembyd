# API Examples - cURL Requests

Complete examples for testing all API endpoints.

## Base URL
```
http://localhost:3001
```

---

## Public Endpoints (No Authentication)

### 1. Register New Customer

**POST /api/register**

Create a new registration and get queue number.

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

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439011",
    "queueNo": "A-001",
    "fullName": "John Doe",
    "branch": "MAIN",
    "purpose": "TEST_DRIVE",
    "status": "WAITING",
    "createdAt": "2024-01-01T10:00:00.000Z"
  },
  "message": "Registration successful"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "mobile",
      "message": "Invalid mobile number format (8-20 characters)"
    }
  ]
}
```

**Rate Limit Response (429):**
```json
{
  "error": "Too many registration attempts, please try again later"
}
```

---

### 2. Get Ticket Information

**GET /api/ticket/:id**

Retrieve ticket details by ticket ID.

```bash
curl http://localhost:3001/api/ticket/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439011",
    "queueNo": "A-001",
    "fullName": "John Doe",
    "mobile": "+1234567890",
    "model": "Tesla Model 3",
    "branch": "MAIN",
    "purpose": "TEST_DRIVE",
    "status": "WAITING",
    "calledAt": null,
    "completedAt": null,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Ticket not found",
  "message": "No ticket found with ID: 507f1f77bcf86cd799439011"
}
```

---

### 3. Get Queue Status

**GET /api/queue?branch=MAIN**

Get current queue status for a branch.

```bash
curl "http://localhost:3001/api/queue?branch=MAIN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "branch": "MAIN",
    "currentServing": {
      "queueNo": "A-005",
      "fullName": "Jane Smith",
      "status": "SERVING",
      "calledAt": "2024-01-01T10:15:00.000Z"
    },
    "nextUp": [
      {
        "queueNo": "A-006",
        "status": "WAITING"
      },
      {
        "queueNo": "A-007",
        "status": "WAITING"
      },
      {
        "queueNo": "A-008",
        "status": "WAITING"
      }
    ],
    "waitingCount": 15,
    "lastUpdated": "2024-01-01T10:20:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Missing branch parameter",
  "message": "Branch parameter is required"
}
```

---

### 4. Get All Active Branches

**GET /api/branches**

Get list of all active branches.

```bash
curl http://localhost:3001/api/branches
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "code": "MAIN",
        "name": "Main Branch",
        "prefix": "A"
      },
      {
        "code": "NORTH",
        "name": "North Branch",
        "prefix": "B"
      },
      {
        "code": "SOUTH",
        "name": "South Branch",
        "prefix": "C"
      }
    ]
  }
}
```

---

## Staff Endpoints (Requires PIN Authentication)

### 5. Verify Staff PIN

**POST /api/staff/auth**

Authenticate with staff PIN.

```bash
curl -X POST http://localhost:3001/api/staff/auth \
  -H "Content-Type: application/json" \
  -d '{
    "pin": "1234"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Authentication successful"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid PIN",
  "message": "The provided PIN is incorrect"
}
```

---

### 6. Get All Active Tickets

**GET /api/staff/tickets?branch=MAIN**

Get all active tickets (WAITING and SERVING).

```bash
curl http://localhost:3001/api/staff/tickets?branch=MAIN \
  -H "X-Staff-Pin: 1234"
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

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

### 7. Call Next Customer

**POST /api/staff/call-next**

Call the next waiting customer.

```bash
curl -X POST http://localhost:3001/api/staff/call-next \
  -H "Content-Type: application/json" \
  -H "X-Staff-Pin: 1234" \
  -d '{
    "branch": "MAIN"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439012",
    "queueNo": "A-006",
    "fullName": "Bob Johnson",
    "status": "SERVING",
    "calledAt": "2024-01-01T10:20:00.000Z"
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

---

### 8. Call Specific Ticket

**POST /api/staff/call-specific**

Call a specific ticket by queue number.

```bash
curl -X POST http://localhost:3001/api/staff/call-specific \
  -H "Content-Type: application/json" \
  -H "X-Staff-Pin: 1234" \
  -d '{
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

---

### 9. Mark Ticket as Done

**POST /api/staff/mark-done**

Mark a ticket as completed.

```bash
curl -X POST http://localhost:3001/api/staff/mark-done \
  -H "Content-Type: application/json" \
  -H "X-Staff-Pin: 1234" \
  -d '{
    "queueNo": "A-006"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439012",
    "queueNo": "A-006",
    "status": "DONE",
    "completedAt": "2024-01-01T10:30:00.000Z"
  },
  "message": "Ticket marked as done"
}
```

---

### 10. Mark Ticket as No-Show

**POST /api/staff/mark-no-show**

Mark a ticket as no-show.

```bash
curl -X POST http://localhost:3001/api/staff/mark-no-show \
  -H "Content-Type: application/json" \
  -H "X-Staff-Pin: 1234" \
  -d '{
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

---

## Testing Workflow

### Complete Registration Flow

```bash
# 1. Get available branches
curl http://localhost:3001/api/branches

# 2. Register a customer
RESPONSE=$(curl -s -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Customer",
    "mobile": "+1234567890",
    "model": "Test Model",
    "branch": "MAIN",
    "purpose": "TEST_DRIVE"
  }')

echo $RESPONSE

# Extract ticket ID (using jq)
TICKET_ID=$(echo $RESPONSE | jq -r '.data.ticketId')

# 3. Get ticket information
curl http://localhost:3001/api/ticket/$TICKET_ID

# 4. Check queue status
curl "http://localhost:3001/api/queue?branch=MAIN"
```

### Complete Staff Flow

```bash
# 1. Authenticate
curl -X POST http://localhost:3001/api/staff/auth \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234"}'

# 2. Get all tickets
curl http://localhost:3001/api/staff/tickets?branch=MAIN \
  -H "X-Staff-Pin: 1234"

# 3. Call next customer
curl -X POST http://localhost:3001/api/staff/call-next \
  -H "Content-Type: application/json" \
  -H "X-Staff-Pin: 1234" \
  -d '{"branch": "MAIN"}'

# 4. Mark as done
curl -X POST http://localhost:3001/api/staff/mark-done \
  -H "Content-Type: application/json" \
  -H "X-Staff-Pin: 1234" \
  -d '{"queueNo": "A-001"}'
```

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request completed successfully |
| 201 | Created | Registration created |
| 400 | Bad Request | Invalid input or missing parameters |
| 401 | Unauthorized | Invalid or missing PIN |
| 404 | Not Found | Ticket or resource not found |
| 409 | Conflict | Duplicate queue number |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Response Format

All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": [ ... ]  // Optional validation details
}
```

---

## Rate Limiting

- **Registration**: 10 requests per 15 minutes per IP
- **Staff endpoints**: 30 requests per minute per IP

Rate limit headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640000000
```

---

## CORS

CORS is configured to allow requests from:
- `http://localhost:5173` (development)
- Configure `CORS_ORIGIN` in `.env` for production

---

## Health Check

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```
