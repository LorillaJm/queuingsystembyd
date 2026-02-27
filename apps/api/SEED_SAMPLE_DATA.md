# Seed Sample Data

## Overview
This script adds 5 realistic sample registrations to test the Customer Summary page and Excel download functionality.

## Sample Data Includes
- Full names (Filipino names)
- Email addresses
- Mobile numbers (Philippine format)
- Vehicle models (ATTO 3, DOLPHIN, SEAL)
- Sales consultants
- Purpose (Test Drive and/or Reservation)
- Remarks (realistic customer notes)

## How to Run

```bash
cd apps/api
npm run seed:sample
```

## Sample Registrations

1. **Juan Dela Cruz**
   - Email: juan.delacruz@email.com
   - Mobile: 09171234567
   - Model: ATTO 3
   - SC: Maria Santos
   - Purpose: Test Drive
   - Remarks: Interested in financing options

2. **Maria Garcia**
   - Email: maria.garcia@email.com
   - Mobile: 09281234567
   - Model: DOLPHIN
   - SC: John Reyes
   - Purpose: Reservation
   - Remarks: Prefers white color

3. **Pedro Santos**
   - Email: pedro.santos@email.com
   - Mobile: 09391234567
   - Model: SEAL
   - SC: Ana Cruz
   - Purpose: Test Drive + Reservation
   - Remarks: Trade-in inquiry

4. **Ana Reyes**
   - Email: ana.reyes@email.com
   - Mobile: 09451234567
   - Model: ATTO 3
   - SC: Maria Santos
   - Purpose: Test Drive
   - Remarks: First time buyer

5. **Carlos Mendoza**
   - Email: carlos.mendoza@email.com
   - Mobile: 09561234567
   - Model: DOLPHIN
   - SC: John Reyes
   - Purpose: Reservation
   - Remarks: Corporate fleet purchase

## What It Does

1. Connects to Firebase
2. Gets current queue counter
3. Creates 5 registrations with sequential queue numbers
4. Sets status to WAITING
5. Updates the queue counter
6. All registrations are for MAIN branch

## Testing the Summary Page

After running the seed script:

1. Go to `http://localhost:5173/summary`
2. Enter PIN: `9999`
3. You should see all 5 customers with:
   - Queue numbers
   - Full names
   - Email addresses
   - Mobile numbers
   - Vehicle models
   - Sales consultants
   - Test Drive/Reservation status
   - Remarks

4. Click "Download Excel" to export the data to CSV

## Notes

- The script uses the current date for queue number prefix (MMDD format)
- Queue numbers are sequential (e.g., 02270001, 02270002, etc.)
- All registrations start with WAITING status
- The script automatically updates the queue counter
- Safe to run multiple times (will create new registrations each time)
