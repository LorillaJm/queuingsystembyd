# Staff Panel Testing Guide

Quick guide to test the staff control panel implementation.

---

## ✅ Implementation Status

All requirements have been implemented:
- ✅ PIN modal on first load
- ✅ PIN stored in sessionStorage
- ✅ x-staff-pin header in all requests
- ✅ Branch selector
- ✅ Call Next button
- ✅ Call Specific input
- ✅ Mark Done button
- ✅ Mark No-Show button
- ✅ Waiting list table with all details
- ✅ Current serving display
- ✅ Real-time Socket.io updates
- ✅ Robust error handling

---

## 🚀 Quick Start Testing

### 1. Start the Servers

```bash
# Terminal 1 - API Server
cd apps/api
npm run dev

# Terminal 2 - Web App
cd apps/web
npm run dev
```

### 2. Initialize MongoDB Settings

If not already done, connect to MongoDB and run:

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

### 3. Create Test Registrations

Open http://localhost:5173 and register 3-5 test customers:

**Customer 1:**
- Full Name: John Doe
- Mobile: +63 912 345 6789
- Model: Toyota Camry
- Branch: MAIN
- Purpose: Test Drive

**Customer 2:**
- Full Name: Jane Smith
- Mobile: +63 923 456 7890
- Model: Honda Civic
- Branch: MAIN
- Purpose: Service

**Customer 3:**
- Full Name: Bob Johnson
- Mobile: +63 934 567 8901
- Model: Ford Mustang
- Branch: MAIN
- Purpose: Inquiry

---

## 🧪 Test Scenarios

### Test 1: PIN Authentication

1. Open http://localhost:5173/staff
2. **Expected**: PIN modal appears
3. Enter wrong PIN (e.g., "0000")
4. **Expected**: Error message "Invalid PIN"
5. Enter correct PIN: "1234"
6. **Expected**: Modal closes, staff panel loads

**✅ Pass Criteria:**
- Modal appears on first load
- Wrong PIN shows error
- Correct PIN authenticates
- Panel loads after authentication

---

### Test 2: Branch Selection

1. In staff panel, check branch selector
2. **Expected**: Shows "Main Branch" selected
3. Change to "North Branch"
4. **Expected**: Ticket list updates (should be empty if no North tickets)
5. Change back to "Main Branch"
6. **Expected**: Shows Main branch tickets again

**✅ Pass Criteria:**
- Branch selector shows all branches
- Changing branch updates ticket list
- Socket.io switches rooms

---

### Test 3: Waiting List Display

1. View the waiting list table
2. **Expected**: Shows all 3 registered customers
3. Check columns: Queue No, Name, Mobile, Model, Purpose, Time, Action
4. **Expected**: All data displays correctly
5. Check first row has "NEXT" badge
6. **Expected**: Blue badge visible on first customer

**✅ Pass Criteria:**
- All waiting customers shown
- All columns display correct data
- First customer has "NEXT" badge
- Times formatted correctly (12-hour format)

---

### Test 4: Call Next

1. Click "Call Next" button
2. **Expected**: Button shows "Calling..."
3. Wait for response
4. **Expected**: 
   - First customer moves to "NOW SERVING" section
   - Customer removed from waiting list
   - Green box appears at top
5. Check "NOW SERVING" section shows:
   - Queue number (large)
   - Full name
   - Model and mobile
   - "Called at" time

**✅ Pass Criteria:**
- Call Next works
- Customer moves to serving
- UI updates immediately
- Current serving displays correctly

---

### Test 5: Call Specific (Input)

1. Note a queue number from waiting list (e.g., A-003)
2. Type queue number in "Call Specific" input
3. Click "Call" button
4. **Expected**:
   - That specific customer moves to serving
   - Previous serving customer marked as done
   - Input field clears

**✅ Pass Criteria:**
- Can call specific queue number
- Input accepts queue number format
- Previous serving moves to done
- Input clears after success

---

### Test 6: Call Specific (Table Button)

1. Find a customer in waiting list
2. Click "Call Now" button in their row
3. **Expected**:
   - That customer moves to serving
   - Previous serving marked as done
   - Table updates

**✅ Pass Criteria:**
- "Call Now" buttons work
- Correct customer is called
- UI updates properly

---

### Test 7: Mark Done

1. With a customer in "NOW SERVING"
2. Click "Mark Done" button
3. **Expected**:
   - Customer removed from serving
   - "NOW SERVING" section disappears
   - Customer status changed to DONE in database

**✅ Pass Criteria:**
- Mark Done works
- Serving section clears
- Customer marked as done

---

### Test 8: Mark No-Show

1. Call next customer
2. Click "Mark No-Show" button
3. **Expected**:
   - Customer removed from serving
   - "NOW SERVING" section disappears
   - Customer status changed to NOSHOW

**✅ Pass Criteria:**
- Mark No-Show works
- Serving section clears
- Customer marked as no-show

---

### Test 9: Real-time Updates

1. Open staff panel in two browser tabs
2. In Tab 1, call next customer
3. **Expected**: Tab 2 updates automatically
4. In Tab 2, mark customer as done
5. **Expected**: Tab 1 updates automatically

**✅ Pass Criteria:**
- Both tabs update in real-time
- Socket.io events working
- No manual refresh needed

---

### Test 10: Error Handling

1. Stop the API server
2. Try to call next customer
3. **Expected**: Error message appears in red banner
4. Click X to dismiss error
5. **Expected**: Error banner disappears
6. Restart API server
7. Try calling next again
8. **Expected**: Works normally

**✅ Pass Criteria:**
- Errors display in banner
- Error banner is dismissible
- System recovers when API returns

---

### Test 11: Session Persistence

1. Authenticate with PIN
2. Refresh the page (F5)
3. **Expected**: Automatically logs back in (no PIN modal)
4. Click "Logout"
5. **Expected**: PIN modal appears
6. Refresh page
7. **Expected**: PIN modal appears (session cleared)

**✅ Pass Criteria:**
- PIN persists in sessionStorage
- Auto-login on refresh
- Logout clears session
- PIN required after logout

---

### Test 12: Empty States

1. Mark all customers as done
2. **Expected**: Waiting list shows empty state with emoji
3. Check "Call Next" button
4. **Expected**: Button disabled, shows "No Waiting Customers"

**✅ Pass Criteria:**
- Empty state displays correctly
- Call Next disabled when empty
- Clear messaging

---

### Test 13: Loading States

1. Click "Call Next"
2. **Expected**: Button shows "Calling..." and is disabled
3. Try clicking again
4. **Expected**: Nothing happens (double-click prevented)
5. Wait for response
6. **Expected**: Button returns to normal

**✅ Pass Criteria:**
- Loading states show
- Double-clicks prevented
- UI responsive

---

### Test 14: Branch Isolation

1. Register customer in MAIN branch
2. Register customer in NORTH branch
3. In staff panel, select MAIN
4. **Expected**: Only MAIN customers shown
5. Select NORTH
6. **Expected**: Only NORTH customers shown

**✅ Pass Criteria:**
- Branches are isolated
- Tickets filtered correctly
- No cross-branch interference

---

## 🔍 API Verification

### Check Request Headers

Open browser DevTools → Network tab:

1. Call any staff action
2. Check request headers
3. **Expected**: `x-staff-pin: 1234` (lowercase)

### Check Request Bodies

1. Call Next request body:
```json
{ "branch": "MAIN" }
```

2. Call Specific request body:
```json
{ "branch": "MAIN", "queueNo": "A-001" }
```

3. Mark Done request body:
```json
{ "branch": "MAIN", "queueNo": "A-001" }
```

---

## 📊 Database Verification

### Check Registration Status Changes

```javascript
// Connect to MongoDB
use queue-system

// Check ticket statuses
db.registrations.find({}, { queueNo: 1, status: 1, calledAt: 1, completedAt: 1 })

// Expected statuses:
// WAITING - Not yet called
// SERVING - Currently being served
// DONE - Service completed
// NOSHOW - Customer didn't appear
```

---

## 🐛 Common Issues & Solutions

### Issue: PIN Modal Doesn't Appear
**Solution**: Check browser console for errors, verify sessionStorage is enabled

### Issue: "Failed to fetch tickets"
**Solution**: 
- Verify API is running on port 3001
- Check CORS settings in API
- Verify MongoDB connection

### Issue: Real-time Updates Not Working
**Solution**:
- Check Socket.io connection in browser console
- Verify PUBLIC_SOCKET_URL in .env
- Check API server logs for socket connections

### Issue: "Invalid PIN" with Correct PIN
**Solution**:
- Verify Settings collection has staffPin: "1234"
- Check API logs for authentication errors
- Verify x-staff-pin header is being sent

### Issue: Tickets Not Showing
**Solution**:
- Verify branch parameter is correct
- Check MongoDB for registrations
- Verify tickets have status WAITING or SERVING

---

## ✅ Final Checklist

Before marking as complete, verify:

- [ ] PIN modal appears on first load
- [ ] PIN stored in sessionStorage
- [ ] Branch selector works
- [ ] Call Next works
- [ ] Call Specific (input) works
- [ ] Call Specific (table) works
- [ ] Mark Done works
- [ ] Mark No-Show works
- [ ] Waiting list displays all data
- [ ] Current serving displays correctly
- [ ] Real-time updates work
- [ ] Error handling works
- [ ] Loading states work
- [ ] Empty states work
- [ ] Session persistence works
- [ ] Logout works
- [ ] Branch isolation works

---

## 📝 Test Results Template

```
Date: _______________
Tester: _______________

Test 1 - PIN Authentication: [ ] Pass [ ] Fail
Test 2 - Branch Selection: [ ] Pass [ ] Fail
Test 3 - Waiting List Display: [ ] Pass [ ] Fail
Test 4 - Call Next: [ ] Pass [ ] Fail
Test 5 - Call Specific (Input): [ ] Pass [ ] Fail
Test 6 - Call Specific (Table): [ ] Pass [ ] Fail
Test 7 - Mark Done: [ ] Pass [ ] Fail
Test 8 - Mark No-Show: [ ] Pass [ ] Fail
Test 9 - Real-time Updates: [ ] Pass [ ] Fail
Test 10 - Error Handling: [ ] Pass [ ] Fail
Test 11 - Session Persistence: [ ] Pass [ ] Fail
Test 12 - Empty States: [ ] Pass [ ] Fail
Test 13 - Loading States: [ ] Pass [ ] Fail
Test 14 - Branch Isolation: [ ] Pass [ ] Fail

Overall Result: [ ] All Pass [ ] Some Failures

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Ready for Testing!** 🚀

All features implemented and ready to test. Follow the scenarios above to verify complete functionality.
