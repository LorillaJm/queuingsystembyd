# Customer Summary Page

## Overview
The Customer Summary page has been separated from the Staff Control panel and is now accessible at `/summary` with its own PIN protection.

## Access Information

- **URL**: `/summary` (e.g., `http://localhost:5173/summary`)
- **PIN**: `9999` (hardcoded in the page)
- **Purpose**: View all customer registrations with email addresses and download Excel reports

## Features

1. **PIN Protection**: Separate PIN (9999) from staff PIN (1234)
2. **Customer List**: Shows all active customers (WAITING and SERVING status)
3. **Columns Displayed**:
   - Queue #
   - Full Name
   - Email
   - Mobile
   - Vehicle Model
   - SC (Sales Consultant)
   - Test Drive (Yes/No)
   - Reservation (Yes/No)
   - Status (Waiting/Serving)

4. **Excel Download**: Export all customer data to CSV file
5. **Auto-refresh**: Data refreshes every 30 seconds
6. **Manual Refresh**: Button to refresh data on demand

## Changing the PIN

To change the summary page PIN, edit the file:
`apps/web/src/routes/summary/+page.svelte`

Find this line:
```javascript
const SUMMARY_PIN = '9999'; // Secret PIN for summary page
```

Change `'9999'` to your desired PIN.

## Staff Control vs Summary Page

### Staff Control (`/staff`)
- PIN: 1234
- Purpose: Queue management and calling customers
- Features: Call next, mark done, view serving status
- No email column
- No Excel download

### Summary Page (`/summary`)
- PIN: 9999
- Purpose: View customer data and generate reports
- Features: View all customers, download Excel
- Includes email column
- Read-only (no queue management)

## Security Note

The PIN is currently hardcoded in the frontend. For production use, consider:
1. Moving PIN validation to the backend API
2. Using environment variables for the PIN
3. Implementing proper authentication with tokens
