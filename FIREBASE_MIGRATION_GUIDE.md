# Firebase Migration Guide

This guide will help you complete the migration from MongoDB Atlas to Firebase Realtime Database.

## Prerequisites Completed ✓

1. ✓ Installed `firebase-admin` package
2. ✓ Created Firebase configuration file
3. ✓ Created Firebase-compatible models
4. ✓ Updated server.js to use Firebase

## Steps You Need to Complete

### 1. Set Up Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or select existing project
3. Give it a name (e.g., "queue-management-system")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Realtime Database

1. In Firebase Console, click "Realtime Database" in the left menu
2. Click "Create Database"
3. Choose a location (closest to your users)
4. Start in "Test mode" for now (we'll secure it later)
5. Click "Enable"

### 3. Get Database URL

1. In Realtime Database page, you'll see the URL at the top
2. It looks like: `https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com/`
3. Copy this URL

### 4. Generate Service Account Key

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Go to "Service accounts" tab
4. Click "Generate new private key"
5. Click "Generate key" in the dialog
6. A JSON file will download - this is your service account key

### 5. Configure Your Application

1. Rename the downloaded JSON file to `firebase-service-account.json`
2. Move it to `apps/api/` directory
3. Update `apps/api/.env` file:
   ```env
   FIREBASE_DATABASE_URL=https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com
   ```
   Replace `YOUR-PROJECT-ID` with your actual Firebase project ID

4. Add to `.gitignore` (already done):
   ```
   firebase-service-account.json
   ```

### 6. Update Controllers to Use Firebase Models

All controllers need to be updated to use the new Firebase models instead of Mongoose models.

**Change imports from:**
```javascript
import Registration from '../models/Registration.js';
import Car from '../models/Car.js';
import QueueState from '../models/QueueState.js';
import Settings from '../models/Settings.js';
```

**To:**
```javascript
import Registration from '../models/firebase/Registration.js';
import Car from '../models/firebase/Car.js';
import QueueState from '../models/firebase/QueueState.js';
import Settings from '../models/firebase/Settings.js';
```

**Files to update:**
- `apps/api/src/controllers/registrationController.js`
- `apps/api/src/controllers/carController.js`
- `apps/api/src/controllers/staffController.js`
- `apps/api/src/controllers/dashboardController.js`
- `apps/api/src/services/queueGenerator.js`
- `apps/api/src/services/ticketService.js`
- `apps/api/src/services/dashboardService.js`

### 7. Update Middleware

Update `apps/api/src/middleware/auth.js` to use Firebase Settings model.

### 8. Test the Connection

Run:
```bash
npm run dev --workspace=apps/api
```

You should see:
```
✓ Firebase initialized successfully
✓ Connected to Firebase Realtime Database
✓ Server running on port 3001
```

### 9. Initialize Database with Default Data

Create a test script to add initial data:
```bash
node apps/api/src/scripts/init-firebase.js
```

### 10. Set Firebase Security Rules (Production)

Once everything works, update Firebase security rules:

```json
{
  "rules": {
    "registrations": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "cars": {
      ".read": true,
      ".write": "auth != null"
    },
    "queueStates": {
      ".read": true,
      ".write": "auth != null"
    },
    "settings": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## Key Differences: MongoDB vs Firebase

### Data Structure
- **MongoDB**: Documents with `_id` field
- **Firebase**: JSON objects with push keys as IDs

### Queries
- **MongoDB**: `Model.find({ status: 'WAITING' })`
- **Firebase**: `ref.orderByChild('status').equalTo('WAITING')`

### Updates
- **MongoDB**: `Model.findByIdAndUpdate(id, updates)`
- **Firebase**: `ref.child(id).update(updates)`

### Transactions
- **MongoDB**: `session.startTransaction()`
- **Firebase**: `ref.transaction(callback)`

## Benefits of Firebase

1. **No IP Whitelisting**: Works from anywhere
2. **Real-time Updates**: Built-in real-time sync
3. **Free Tier**: Generous free tier for small apps
4. **Simple Setup**: No complex connection strings
5. **Automatic Scaling**: Handles traffic spikes automatically

## Next Steps

After migration is complete, you can:
1. Remove MongoDB dependencies: `npm uninstall mongoose --workspace=apps/api`
2. Delete old MongoDB model files
3. Update documentation
4. Test all endpoints thoroughly

## Troubleshooting

### Error: "FIREBASE_DATABASE_URL is not set"
- Make sure you updated `.env` file with your Firebase database URL

### Error: "Cannot find module firebase-service-account.json"
- Make sure the service account JSON file is in `apps/api/` directory
- Check the filename is exactly `firebase-service-account.json`

### Error: "Permission denied"
- Check Firebase security rules
- Make sure you're in test mode during development

## Need Help?

If you encounter issues, check:
1. Firebase Console for database activity
2. Server logs for detailed error messages
3. Firebase documentation: https://firebase.google.com/docs/database
