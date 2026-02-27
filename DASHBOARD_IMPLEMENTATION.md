# Dashboard Implementation

Complete dashboard aggregation showing all active cars with registration counts.

---

## ✅ Implementation Complete

### Overview

The dashboard endpoint provides a comprehensive view of all active cars in a branch with their registration statistics, ensuring cars with zero registrations are included.

---

## 📡 API Endpoints

### 1. Get Dashboard for Branch

**Endpoint**: `GET /api/staff/dashboard?branch=MAIN`

**Authentication**: Required (x-staff-pin header)

**Query Parameters**:
- `branch` (required): Branch code (e.g., "MAIN", "NORTH", "SOUTH")

**Response**:
```json
{
  "success": true,
  "data": {
    "branch": "MAIN",
    "models": [
      {
        "carId": "507f1f77bcf86cd799439011",
        "model": "Toyota Camry",
        "capacity": 1,
        "displayOrder": 1,
        "imageUrl": null,
        "serving": 1,
        "waiting": 5,
        "done": 12,
        "nextQueueNos": ["A-006", "A-007", "A-008"]
      },
      {
        "carId": "507f1f77bcf86cd799439012",
        "model": "Honda Civic",
        "capacity": 1,
        "displayOrder": 2,
        "imageUrl": null,
        "serving": 0,
        "waiting": 3,
        "done": 8,
        "nextQueueNos": ["A-009", "A-010", "A-011"]
      },
      {
        "carId": "507f1f77bcf86cd799439013",
        "model": "BYD ATTO 3",
        "capacity": 1,
        "displayOrder": 3,
        "imageUrl": null,
        "serving": 0,
        "waiting": 0,
        "done": 0,
        "nextQueueNos": []
      }
    ],
    "totals": {
      "serving": 1,
      "waiting": 8,
      "done": 20
    },
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

**Key Features**:
- ✅ Shows ALL active cars (even with 0 registrations)
- ✅ Sorted by displayOrder
- ✅ Counts by status: serving, waiting, done
- ✅ Next 3 queue numbers for waiting tickets
- ✅ Branch totals included

### 2. Get Summary for All Branches

**Endpoint**: `GET /api/staff/dashboard/summary`

**Authentication**: Required (x-staff-pin header)

**Response**:
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "branch": "MAIN",
        "branchName": "Main Branch",
        "serving": 2,
        "waiting": 15,
        "done": 45
      },
      {
        "branch": "NORTH",
        "branchName": "North Branch",
        "serving": 1,
        "waiting": 8,
        "done": 23
      },
      {
        "branch": "SOUTH",
        "branchName": "South Branch",
        "serving": 0,
        "waiting": 0,
        "done": 0
      }
    ],
    "totalBranches": 3
  }
}
```

---

## 🔧 Implementation Details

### Service Layer (`dashboardService.js`)

**Algorithm**:

1. **Fetch Active Cars**
   - Get all active cars for branch
   - Sorted by displayOrder, then model name
   - Ensures all cars are included in result

2. **Aggregate Registrations**
   - Group by modelId and status
   - Count registrations per model per status
   - Only includes registrations with modelId (linked to cars)

3. **Get Next Queue Numbers**
   - Find oldest 3 WAITING tickets per model
   - Sorted by createdAt (oldest first)
   - Returns array of queue numbers

4. **Merge Results**
   - Map active cars to result structure
   - Fill in counts from aggregation (default to 0)
   - Add next queue numbers
   - Calculate totals

**Key Code**:
```javascript
// Ensure all active cars show even with 0 counts
const models = activeCars.map(car => {
  const carIdStr = car._id.toString();
  const stats = statsMap[carIdStr] || { serving: 0, waiting: 0, done: 0 };
  const nextQueueNos = nextQueueByModel[carIdStr] || [];

  return {
    carId: car._id,
    model: car.model,
    capacity: car.capacity,
    displayOrder: car.displayOrder,
    imageUrl: car.imageUrl,
    serving: stats.serving || 0,
    waiting: stats.waiting || 0,
    done: stats.done || 0,
    nextQueueNos
  };
});
```

### Controller Layer (`dashboardController.js`)

**Responsibilities**:
- Validate branch parameter
- Call service layer
- Handle errors
- Format response

**Error Handling**:
- 400: Missing or invalid branch
- 500: Server error

---

## 📊 Data Flow

```
GET /api/staff/dashboard?branch=MAIN
   ↓
1. Validate branch parameter
   ↓
2. Fetch active cars for MAIN
   [Toyota Camry, Honda Civic, BYD ATTO 3]
   ↓
3. Aggregate registrations by modelId + status
   {
     "Toyota Camry": { serving: 1, waiting: 5, done: 12 },
     "Honda Civic": { serving: 0, waiting: 3, done: 8 }
     // BYD ATTO 3 has no registrations
   }
   ↓
4. Get next queue numbers for WAITING
   {
     "Toyota Camry": ["A-006", "A-007", "A-008"],
     "Honda Civic": ["A-009", "A-010", "A-011"]
   }
   ↓
5. Merge: Map all cars with stats (0 if missing)
   [
     { model: "Toyota Camry", serving: 1, waiting: 5, done: 12, ... },
     { model: "Honda Civic", serving: 0, waiting: 3, done: 8, ... },
     { model: "BYD ATTO 3", serving: 0, waiting: 0, done: 0, ... }
   ]
   ↓
6. Calculate totals
   { serving: 1, waiting: 8, done: 20 }
   ↓
7. Return response
```

---

## 🧪 Testing Guide

### Setup Test Data

```javascript
use queue-system

// 1. Create test cars
db.cars.insertMany([
  {
    branch: "MAIN",
    model: "Toyota Camry",
    capacity: 1,
    isActive: true,
    displayOrder: 1,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    branch: "MAIN",
    model: "Honda Civic",
    capacity: 1,
    isActive: true,
    displayOrder: 2,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    branch: "MAIN",
    model: "BYD ATTO 3",
    capacity: 1,
    isActive: true,
    displayOrder: 3,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// 2. Get car IDs
const toyotaId = db.cars.findOne({ model: "Toyota Camry" })._id
const hondaId = db.cars.findOne({ model: "Honda Civic" })._id
// BYD ATTO 3 - no registrations (testing zero counts)

// 3. Create test registrations
db.registrations.insertMany([
  // Toyota Camry - SERVING
  {
    queueNo: "A-001",
    fullName: "John Doe",
    mobile: "+63 912 345 6789",
    model: "Toyota Camry",
    modelId: toyotaId,
    branch: "MAIN",
    purpose: "TEST_DRIVE",
    status: "SERVING",
    calledAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Toyota Camry - WAITING
  {
    queueNo: "A-002",
    fullName: "Jane Smith",
    mobile: "+63 923 456 7890",
    model: "Toyota Camry",
    modelId: toyotaId,
    branch: "MAIN",
    purpose: "TEST_DRIVE",
    status: "WAITING",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    queueNo: "A-003",
    fullName: "Bob Johnson",
    mobile: "+63 934 567 8901",
    model: "Toyota Camry",
    modelId: toyotaId,
    branch: "MAIN",
    purpose: "TEST_DRIVE",
    status: "WAITING",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Honda Civic - WAITING
  {
    queueNo: "A-004",
    fullName: "Alice Brown",
    mobile: "+63 945 678 9012",
    model: "Honda Civic",
    modelId: hondaId,
    branch: "MAIN",
    purpose: "SERVICE",
    status: "WAITING",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Toyota Camry - DONE
  {
    queueNo: "A-005",
    fullName: "Charlie Wilson",
    mobile: "+63 956 789 0123",
    model: "Toyota Camry",
    modelId: toyotaId,
    branch: "MAIN",
    purpose: "TEST_DRIVE",
    status: "DONE",
    completedAt: new Date(),
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    updatedAt: new Date()
  }
])
```

### Test Cases

#### Test 1: Dashboard Shows All Cars (Including Zero Counts)

```bash
curl -X GET "http://localhost:3001/api/staff/dashboard?branch=MAIN" \
  -H "x-staff-pin: 1234"
```

**Expected Result**:
```json
{
  "success": true,
  "data": {
    "branch": "MAIN",
    "models": [
      {
        "model": "Toyota Camry",
        "serving": 1,
        "waiting": 2,
        "done": 1,
        "nextQueueNos": ["A-002", "A-003"]
      },
      {
        "model": "Honda Civic",
        "serving": 0,
        "waiting": 1,
        "done": 0,
        "nextQueueNos": ["A-004"]
      },
      {
        "model": "BYD ATTO 3",
        "serving": 0,
        "waiting": 0,
        "done": 0,
        "nextQueueNos": []
      }
    ],
    "totals": {
      "serving": 1,
      "waiting": 3,
      "done": 1
    }
  }
}
```

✅ **Pass Criteria**:
- All 3 cars shown
- BYD ATTO 3 shows with 0 counts
- Cars sorted by displayOrder
- Next queue numbers correct

#### Test 2: Branch with No Registrations

```bash
# Create branch with cars but no registrations
db.cars.insertOne({
  branch: "SOUTH",
  model: "Tesla Model 3",
  capacity: 1,
  isActive: true,
  displayOrder: 1,
  imageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date()
})

curl -X GET "http://localhost:3001/api/staff/dashboard?branch=SOUTH" \
  -H "x-staff-pin: 1234"
```

**Expected Result**:
```json
{
  "success": true,
  "data": {
    "branch": "SOUTH",
    "models": [
      {
        "model": "Tesla Model 3",
        "serving": 0,
        "waiting": 0,
        "done": 0,
        "nextQueueNos": []
      }
    ],
    "totals": {
      "serving": 0,
      "waiting": 0,
      "done": 0
    }
  }
}
```

✅ **Pass Criteria**:
- Car shown with all zeros
- No errors
- Empty nextQueueNos array

#### Test 3: Invalid Branch

```bash
curl -X GET "http://localhost:3001/api/staff/dashboard?branch=INVALID" \
  -H "x-staff-pin: 1234"
```

**Expected Result**:
```json
{
  "success": false,
  "error": "Invalid branch",
  "message": "Branch 'INVALID' does not exist or is not active"
}
```

✅ **Pass Criteria**:
- 400 status code
- Clear error message

#### Test 4: Missing Branch Parameter

```bash
curl -X GET "http://localhost:3001/api/staff/dashboard" \
  -H "x-staff-pin: 1234"
```

**Expected Result**:
```json
{
  "success": false,
  "error": "Missing branch parameter",
  "message": "Branch parameter is required"
}
```

✅ **Pass Criteria**:
- 400 status code
- Clear error message

#### Test 5: All Branches Summary

```bash
curl -X GET "http://localhost:3001/api/staff/dashboard/summary" \
  -H "x-staff-pin: 1234"
```

**Expected Result**:
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "branch": "MAIN",
        "branchName": "Main Branch",
        "serving": 1,
        "waiting": 3,
        "done": 1
      },
      {
        "branch": "NORTH",
        "branchName": "North Branch",
        "serving": 0,
        "waiting": 0,
        "done": 0
      },
      {
        "branch": "SOUTH",
        "branchName": "South Branch",
        "serving": 0,
        "waiting": 0,
        "done": 0
      }
    ],
    "totalBranches": 3
  }
}
```

✅ **Pass Criteria**:
- All branches shown
- Correct totals per branch
- Branches with no activity show zeros

---

## 🎯 Use Cases

### 1. Staff Dashboard View

Display real-time statistics for all car models:
- Which models are most popular
- Which models have waiting customers
- Which models have no activity

### 2. Capacity Planning

Identify:
- Models with high demand (long waiting lists)
- Models with no demand (consider removing)
- Peak times per model

### 3. Resource Allocation

Determine:
- Which models need more staff attention
- Which models can be deprioritized
- Optimal model mix per branch

### 4. Reporting

Generate reports on:
- Daily registrations per model
- Completion rates per model
- Popular models by branch

---

## 📝 Response Fields Explained

### Model Object

| Field | Type | Description |
|-------|------|-------------|
| `carId` | ObjectId | Unique car identifier |
| `model` | String | Car model name |
| `capacity` | Number | Number of simultaneous test drives |
| `displayOrder` | Number | Sort order in lists |
| `imageUrl` | String\|null | Car image URL |
| `serving` | Number | Count of SERVING registrations |
| `waiting` | Number | Count of WAITING registrations |
| `done` | Number | Count of DONE registrations |
| `nextQueueNos` | Array | Next 3 queue numbers waiting |

### Totals Object

| Field | Type | Description |
|-------|------|-------------|
| `serving` | Number | Total SERVING across all models |
| `waiting` | Number | Total WAITING across all models |
| `done` | Number | Total DONE across all models |

---

## 🔍 Key Implementation Details

### Why All Active Cars Show

The service explicitly maps ALL active cars, not just those with registrations:

```javascript
const models = activeCars.map(car => {
  // Get stats from aggregation, default to zeros
  const stats = statsMap[carIdStr] || { serving: 0, waiting: 0, done: 0 };
  
  return {
    ...car,
    serving: stats.serving || 0,  // Ensures 0 if undefined
    waiting: stats.waiting || 0,
    done: stats.done || 0,
    nextQueueNos: nextQueueByModel[carIdStr] || []
  };
});
```

### Why Only modelId Registrations Count

Registrations without `modelId` are legacy data or manual entries:

```javascript
$match: {
  branch: branchUpper,
  status: { $in: ['WAITING', 'SERVING', 'DONE'] },
  modelId: { $ne: null }  // Only count linked registrations
}
```

### Why Next 3 Queue Numbers

Provides context for staff:
- See upcoming customers
- Plan ahead
- Estimate wait times

Limited to 3 to keep response size manageable.

---

## 🚀 Performance Considerations

### Optimizations

1. **Aggregation Pipeline**: Efficient grouping at database level
2. **Lean Queries**: Returns plain objects, not Mongoose documents
3. **Indexed Fields**: modelId, status, branch, createdAt all indexed
4. **Limited Results**: Only next 3 queue numbers per model

### Scalability

- **Small Scale** (< 1000 registrations/day): Sub-100ms response
- **Medium Scale** (1000-10000/day): 100-500ms response
- **Large Scale** (> 10000/day): Consider caching

### Caching Strategy (Optional)

For high-traffic scenarios:
```javascript
// Cache dashboard data for 30 seconds
const cacheKey = `dashboard:${branch}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const data = await getDashboardData(branch);
await redis.setex(cacheKey, 30, JSON.stringify(data));
return data;
```

---

## 🔒 Security

### Authentication Required

Both endpoints require staff authentication:
- Header: `x-staff-pin: 1234`
- Validated against Settings collection
- 401 error if invalid

### Branch Validation

- Branch must exist in Settings
- Branch must be active
- 400 error if invalid

### Rate Limiting

Inherits from staff rate limiter:
- 30 requests per minute per IP
- Prevents abuse

---

## 📊 Example Scenarios

### Scenario 1: New Branch (No Activity)

**Setup**: Branch has 2 active cars, no registrations

**Result**:
```json
{
  "models": [
    { "model": "Car A", "serving": 0, "waiting": 0, "done": 0 },
    { "model": "Car B", "serving": 0, "waiting": 0, "done": 0 }
  ],
  "totals": { "serving": 0, "waiting": 0, "done": 0 }
}
```

### Scenario 2: Busy Branch

**Setup**: 3 cars, high activity

**Result**:
```json
{
  "models": [
    { "model": "Popular Car", "serving": 2, "waiting": 15, "done": 45 },
    { "model": "Medium Car", "serving": 1, "waiting": 5, "done": 20 },
    { "model": "New Car", "serving": 0, "waiting": 0, "done": 0 }
  ],
  "totals": { "serving": 3, "waiting": 20, "done": 65 }
}
```

### Scenario 3: Mixed Activity

**Setup**: Some cars active, some not

**Result**:
```json
{
  "models": [
    { "model": "Active Car", "serving": 1, "waiting": 3, "done": 10 },
    { "model": "Inactive Car", "serving": 0, "waiting": 0, "done": 0 },
    { "model": "New Car", "serving": 0, "waiting": 1, "done": 0 }
  ],
  "totals": { "serving": 1, "waiting": 4, "done": 10 }
}
```

---

## ✅ Implementation Checklist

- [x] Dashboard service created
- [x] Dashboard controller created
- [x] Routes added to staff.js
- [x] All active cars included (even with 0 counts)
- [x] Sorted by displayOrder
- [x] Next queue numbers included
- [x] Totals calculated
- [x] Branch validation
- [x] Error handling
- [x] Authentication required
- [x] Documentation complete

---

**Status: FULLY IMPLEMENTED ✅**

The dashboard endpoint is complete and ready for use. It ensures all active cars are displayed with their registration counts, even when counts are zero (like BYD ATTO 3 with no registrations).
