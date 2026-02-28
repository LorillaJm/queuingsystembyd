# Firebase Configuration Setup

## Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `testdrive-17e53`
3. Click the gear icon ⚙️ > Project settings
4. Scroll down to "Your apps"
5. Click the web icon `</>` or select your existing web app
6. Copy the `firebaseConfig` object

## Update the Configuration

Open `apps/web/src/lib/firebase.js` and replace the firebaseConfig with your actual values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "testdrive-17e53.firebaseapp.com",
  databaseURL: "https://testdrive-17e53-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testdrive-17e53",
  storageBucket: "testdrive-17e53.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Security Note

The Firebase API key is safe to expose in client-side code because:
- It only identifies your Firebase project
- Security is enforced by Firebase Security Rules
- Your database rules control who can read/write data

## Test the Connection

After updating the config:

```bash
cd apps/web
npm run dev
```

Visit http://localhost:5173 and check:
1. The "Vehicle of Interest" dropdown should load
2. Check browser console for "Loaded cars from Firebase:" message
3. Cars should appear in the dropdown

## Troubleshooting

### "Permission denied" error
- Check Firebase Database Rules
- Ensure read access is allowed for cars

### "Firebase not initialized" error  
- Verify all config values are correct
- Check that databaseURL matches your Firebase project

### No cars showing
- Check Firebase Console > Realtime Database
- Verify cars exist under `/cars` path
- Verify cars have `isActive: true` and correct `branch`

## Alternative: Use Environment Variables

For better security, you can use environment variables:

1. Create `apps/web/.env.local`:
```env
PUBLIC_FIREBASE_API_KEY=your_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=testdrive-17e53.firebaseapp.com
PUBLIC_FIREBASE_DATABASE_URL=https://testdrive-17e53-default-rtdb.asia-southeast1.firebasedatabase.app
PUBLIC_FIREBASE_PROJECT_ID=testdrive-17e53
PUBLIC_FIREBASE_STORAGE_BUCKET=testdrive-17e53.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id
```

2. Update `firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.PUBLIC_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
};
```
