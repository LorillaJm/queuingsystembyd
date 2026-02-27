# Car Registration Integration

Complete integration of car management with the registration flow.

---

## ✅ Implementation Complete

### 1. Database Schema Updates

**Registration Model** (`apps/api/src/models/Registration.js`)
- Added `modelId` field (ObjectId reference to Car model)
- Keeps `model` field for snapshot of model name
- `modelId` is optional (nullable) for backward compatibility

```javascript
modelId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Car',
  default: null,
  index: true
}
```

### 2. Public API Endpoint

**New Endpoint**: `GET /api/cars?branch=MAIN`

**Purpose**: Load active cars for selected branch (public access, no authentication)

**Response**:
```json
{
  "success": true,
  "data": {
    "branch": "MAIN",
    "cars": [
      {
        "carId": "507f1f77bcf86cd799439011",
        "model": "Toyota Camry",
        "displayOrder": 1,
        "imageUrl": null
      },
      {
        "carId": "507f1f77bcf86cd799439012",
        "model": "Honda Civic",
        "displayOrder": 2,
        "imageUrl": null
      }
    ],
    "count": 2
  }
}
```

**Features**:
- Returns only active cars (`isActive: true`)
- Sorted by `displayOrder` then `model` name
- Branch validation included
- No authentication required (public endpoint)

### 3. Updated Registration Endpoint

**Endpoint**: `POST /api/register`

**Updated Request Body**:
```json
{
  "fullName": "John Doe",
  "mobile": "+63 912 345 6789",
  "carId": "507f1f77bcf86cd799439011",  // NEW: Optional car ID
  "model": "Toyota Camry",               // Optional: fallback if carId not provided
  "branch": "MAIN",
  "purpose": "TEST_DRIVE"
}
```

**Validation Logic**:

1. **If `carId` is provided**:
   - Validates ObjectId format
   - Checks car exists in database
   - Validates car is active (`isActive: true`)
   - Validates car belongs to selected branch
   - Uses car's model name as snapshot
   - Stores `modelId` reference

2. **If only `model` is provided** (backward compatibility):
   - Tries to find matching active car in branch
   - If found, stores `modelId` reference
   - If not found, stores model name only

3. **Rejection Cases** (400 Bad Request):
   - Car ID invalid format
   - Car doesn't exist
   - Car is inactive
   - Car belongs to different branch

**Updated Response**:
```json
{
  "success": true,
  "data": {
    "ticketId": "507f1f77bcf86cd799439013",
    "queueNo": "A-001",
    "fullName": "John Doe",
    "model": "Toyota Camry",
    "modelId": "507f1f77bcf86cd799439011",  // NEW
    "branch": "MAIN",
    "purpose": "TEST_DRIVE",
    "status": "WAITING",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Registration successful"
}
```

### 4. Validation Middleware Updates

**Updated**: `apps/api/src/middleware/validation.js`

```javascript
// carId is now optional
body('carId')
  .optional()
  .trim()
  .matches(/^[0-9a-fA-F]{24}$/)
  .withMessage('Invalid car ID format'),

// model is now optional (was required)
body('model')
  .optional()
  .trim()
  .isLength({ max: 100 })
  .withMessage('Model must be less than 100 characters'),
```

**Note**: At least one of `carId` or `model` should be provided, validated in controller logic.

### 5. Frontend Updates

**API Client** (`apps/web/src/lib/api.js`)

New function:
```javascript
export async function getCars(branch) {
  const response = await fetch(`${API_URL}/api/cars?branch=${branch}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch cars');
  }

  return response.json();
}
```

**Registration Page** (`apps/web/src/routes/+page.svelte`)

**Changes**:
1. Replaced text input for model with dropdown
2. Added `loadingCars` state
3. Loads cars on mount and when branch changes
4. Shows loading state while fetching cars
5. Shows "No models available" if branch has no active cars
6. Validates car selection is required
7. Sends `carId` instead of `model` in registration request

**UI States**:
- **Loading**: "Loading models..." (gray background)
- **Empty**: "No models available for this branch"
- **Loaded**: Dropdown with car models sorted by displayOrder

**Form Flow**:
1. User selects branch
2. Cars load automatically for that branch
3. User selects car from dropdown
4. Registration submits with `carId`

---

## 🔄 Data Flow

### Registration Flow

```
1. User opens registration page
   ↓
2. Page loads cars for default branch (MAIN)
   GET /api/cars?branch=MAIN
   ↓
3. User selects branch
   ↓
4. Cars reload for new branch
   GET /api/cars?branch=NORTH
   ↓
5. User selects car from dropdown
   ↓
6. User fills other fields and submits
   ↓
7. POST /api/register with carId
   ↓
8. Server validates:
   - Car exists
   - Car is active
   - Car belongs to branch
   ↓
9. Registration created with:
   - modelId (reference)
   - model (snapshot)
   ↓
10. Queue number generated and returned
```

### Car Validation Flow

```
POST /api/register { carId: "..." }
   ↓
1. Validate carId format (24-char hex)
   ↓
2. Find car in database
   ↓
3. Check car.isActive === true
   ↓
4. Check car.branch === request.branch
   ↓
5. Use car.model as snapshot
   ↓
6. Store modelId reference
   ↓
7. Create registration
```

---

## 📊 Database Structure

### Before (Old Schema)
```javascript
{
  queueNo: "A-001",
  fullName: "John Doe",
  mobile: "+63 912 345 6789",
  model: "Toyota Camry",  // Just a string
  branch: "MAIN",
  purpose: "TEST_DRIVE",
  status: "WAITING"
}
```

### After (New Schema)
```javascript
{
  queueNo: "A-001",
  fullName: "John Doe",
  mobile: "+63 912 345 6789",
  model: "Toyota Camry",              // Snapshot (for display)
  modelId: ObjectId("507f..."),       // Reference to Car
  branch: "MAIN",
  purpose: "TEST_DRIVE",
  status: "WAITING"
}
```

**Benefits**:
- Can track which car model was selected
- Can query registrations by car model
- Can update car details without affecting old registrations
- Maintains data integrity with references

---

## 🧪 Testing Guide

### 1. Setup Test Data

Create some cars in MongoDB:

```javascript
use queue-system

// Insert test cars for MAIN branch
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
    model: "Ford Mustang",
    capacity: 1,
    isActive: false,  // Inactive
    displayOrder: 3,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// Insert test cars for NORTH branch
db.cars.insertMany([
  {
    branch: "NORTH",
    model: "Tesla Model 3",
    capacity: 1,
    isActive: true,
    displayOrder: 1,
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

### 2. Test Public Cars Endpoint

```bash
# Get cars for MAIN branch
curl http://localhost:3001/api/cars?branch=MAIN

# Expected: Returns Toyota Camry and Honda Civic (not Ford Mustang - inactive)

# Get cars for NORTH branch
curl http://localhost:3001/api/cars?branch=NORTH

# Expected: Returns Tesla Model 3

# Get cars for invalid branch
curl http://localhost:3001/api/cars?branch=INVALID

# Expected: 400 error
```

### 3. Test Registration with carId

```bash
# Register with valid carId
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "mobile": "+63 912 345 6789",
    "carId": "PASTE_TOYOTA_CAMRY_ID_HERE",
    "branch": "MAIN",
    "purpose": "TEST_DRIVE"
  }'

# Expected: 201 success with modelId in response
```

### 4. Test Inactive Car Rejection

```bash
# Try to register with inactive car (Ford Mustang)
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "mobile": "+63 923 456 7890",
    "carId": "PASTE_FORD_MUSTANG_ID_HERE",
    "branch": "MAIN",
    "purpose": "TEST_DRIVE"
  }'

# Expected: 400 error "The selected car model is no longer available"
```

### 5. Test Branch Mismatch

```bash
# Try to register NORTH car in MAIN branch
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Bob Johnson",
    "mobile": "+63 934 567 8901",
    "carId": "PASTE_TESLA_ID_HERE",
    "branch": "MAIN",
    "purpose": "TEST_DRIVE"
  }'

# Expected: 400 error "The selected car model is not available at this branch"
```

### 6. Test Frontend

1. Open http://localhost:5173
2. **Expected**: Car dropdown shows "Loading models..."
3. **Expected**: After load, shows Toyota Camry and Honda Civic
4. **Expected**: Ford Mustang NOT shown (inactive)
5. Select "North Branch"
6. **Expected**: Dropdown reloads, shows Tesla Model 3
7. Select "South Branch" (no cars)
8. **Expected**: Shows "No models available for this branch"
9. Select "Main Branch" again
10. Select "Toyota Camry"
11. Fill other fields and submit
12. **Expected**: Registration successful

---

## 🔒 Security & Validation

### Server-Side Validation

✅ **Car ID Format**: Must be valid MongoDB ObjectId (24-char hex)  
✅ **Car Exists**: Must exist in database  
✅ **Car Active**: Must have `isActive: true`  
✅ **Branch Match**: Car's branch must match registration branch  
✅ **Branch Valid**: Branch must exist in settings  

### Client-Side Validation

✅ **Car Selection Required**: User must select a car  
✅ **Loading State**: Prevents submission while loading  
✅ **Empty State**: Shows message if no cars available  
✅ **Branch Change**: Reloads cars automatically  

---

## 📝 API Documentation Updates

### New Endpoint

**GET /api/cars**

Query Parameters:
- `branch` (required): Branch code (e.g., "MAIN", "NORTH")

Response:
```json
{
  "success": true,
  "data": {
    "branch": "MAIN",
    "cars": [
      {
        "carId": "string",
        "model": "string",
        "displayOrder": number,
        "imageUrl": "string|null"
      }
    ],
    "count": number
  }
}
```

Errors:
- 400: Missing or invalid branch parameter
- 500: Server error

### Updated Endpoint

**POST /api/register**

Request Body (updated):
```json
{
  "fullName": "string (required, 2-100 chars)",
  "mobile": "string (required, 8-20 chars)",
  "carId": "string (optional, MongoDB ObjectId)",
  "model": "string (optional, max 100 chars)",
  "branch": "string (required, uppercase)",
  "purpose": "string (optional, enum)"
}
```

New Errors:
- 400: Invalid car ID format
- 400: Car does not exist
- 400: Car is inactive
- 400: Car branch mismatch

---

## 🔄 Backward Compatibility

The system maintains backward compatibility:

1. **Old registrations** (without modelId) continue to work
2. **Model field** still accepts text input (fallback)
3. **API accepts both** carId and model parameters
4. **Existing data** not affected (modelId is nullable)

---

## 🚀 Deployment Notes

### Database Migration

No migration needed! The `modelId` field is optional (nullable), so existing registrations continue to work.

### Environment Variables

No new environment variables required.

### Testing Checklist

Before deploying:
- [ ] Create test cars in each branch
- [ ] Test public cars endpoint
- [ ] Test registration with carId
- [ ] Test inactive car rejection
- [ ] Test branch mismatch rejection
- [ ] Test frontend dropdown loading
- [ ] Test branch switching
- [ ] Test empty state (branch with no cars)
- [ ] Verify old registrations still work

---

## 📊 Benefits

### For Users
- ✅ Easier selection (dropdown vs typing)
- ✅ No typos in model names
- ✅ Only see available models
- ✅ Branch-specific models

### For Staff
- ✅ Consistent model names
- ✅ Can track popular models
- ✅ Can disable models temporarily
- ✅ Can reorder models by priority

### For System
- ✅ Data integrity (references)
- ✅ Better reporting (by model)
- ✅ Easier to update model details
- ✅ Validation at database level

---

## 🎯 Future Enhancements

Possible improvements:
- [ ] Show car images in dropdown
- [ ] Show car capacity/availability
- [ ] Filter by purpose (test drive vs service)
- [ ] Popular models first
- [ ] Search/filter in dropdown
- [ ] Model descriptions/specs

---

**Status: FULLY IMPLEMENTED ✅**

All requirements met:
- ✅ Public /api/cars endpoint
- ✅ Returns active cars sorted by displayOrder
- ✅ Registration accepts carId
- ✅ Validates car is active
- ✅ Rejects inactive cars (400)
- ✅ Stores modelId and model snapshot
- ✅ Frontend dropdown with loading state
- ✅ Branch-specific car loading
- ✅ Backward compatible

Ready for testing and deployment!
