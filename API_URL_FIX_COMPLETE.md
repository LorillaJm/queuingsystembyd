# API URL Fix - Complete ✅

## Problem Fixed

Your deployed app was trying to connect to `http://localhost:3001` instead of the production API. This caused "ERR_CONNECTION_REFUSED" errors in production.

## What Was Changed

### 1. Exported API_URL from api.js
**File**: `apps/web/src/lib/api.js`

```javascript
// Before
const API_URL = import.meta.env.PUBLIC_API_URL || 'https://queuingsystembyd-api.onrender.com';

// After
const API_URL = import.meta.env.PUBLIC_API_URL || 'https://queuingsystembyd-api.onrender.com';
export { API_URL }; // ✅ Now exported
```

### 2. Updated All Hardcoded URLs

#### apps/web/src/routes/+page.svelte
- ✅ Imported `API_URL` from `$lib/api`
- ✅ Changed test drive documents: `localhost:3001` → `${API_URL}`
- ✅ Changed reservation documents: `localhost:3001` → `${API_URL}`

#### apps/web/src/routes/staff/+page.svelte
- ✅ Imported `API_URL` from `$lib/api`
- ✅ Changed staff auth: `localhost:3001` → `${API_URL}`
- ✅ Changed registrations fetch: `localhost:3001` → `${API_URL}`
- ✅ Changed next-model: `localhost:3001` → `${API_URL}`
- ✅ Changed mark-done: `localhost:3001` → `${API_URL}`

#### apps/web/src/routes/mc/+page.svelte
- ✅ Imported `API_URL` from `$lib/api`
- ✅ Changed registrations fetch: `localhost:3001` → `${API_URL}`

#### apps/web/src/routes/screen/+page.svelte
- ✅ Imported `API_URL` from `$lib/api`
- ✅ Removed local `API_URL` definition
- ✅ Now uses imported `API_URL`

#### apps/web/src/routes/summary/+page.svelte
- ✅ Imported `API_URL` from `$lib/api`
- ✅ Removed local `API_URL` definition
- ✅ Now uses imported `API_URL`

## How It Works Now

### Development (localhost:5173)
```javascript
// Uses environment variable or defaults to production
const API_URL = import.meta.env.PUBLIC_API_URL || 'https://queuingsystembyd-api.onrender.com';
```

If you set `PUBLIC_API_URL=http://localhost:3001` in `.env.local`, it uses local API.
Otherwise, it uses production API.

### Production (Firebase Hosting)
```javascript
// Always uses production API
const API_URL = 'https://queuingsystembyd-api.onrender.com';
```

No environment variable set, so it defaults to production.

## Deployment Status

✅ **Code Updated**: All hardcoded URLs replaced
✅ **Built**: Production build completed
✅ **Deployed**: Firebase Hosting updated
✅ **Live**: https://testdrive-17e53.web.app

## Testing

### Test in Production
1. Open: https://testdrive-17e53.web.app
2. Open DevTools (F12) → Console
3. Try these features:
   - ✅ Car dropdown (loads from Firebase)
   - ⏳ Registration form (needs Render API)
   - ⏳ Test Drive modal (needs Render API)
   - ⏳ Reservation modal (needs Render API)

### Expected Behavior

**If Render API is working**:
- No "ERR_CONNECTION_REFUSED" errors
- Registration submits successfully
- Queue number displayed

**If Render API is NOT working** (current state):
- CORS errors or 404 errors
- "Failed to fetch" errors
- Registration fails

## Next Steps

The frontend is now fixed and will connect to the correct API. However, the Render API still needs to be configured:

1. ✅ Go to Render dashboard
2. ✅ Set Root Directory to `apps/api`
3. ✅ Add environment variables (especially CORS_ORIGIN)
4. ✅ Upload firebase-service-account.json
5. ✅ Manual redeploy

Once Render is configured, everything will work end-to-end!

## Files Changed

- `apps/web/src/lib/api.js` - Exported API_URL
- `apps/web/src/routes/+page.svelte` - Updated 2 URLs
- `apps/web/src/routes/staff/+page.svelte` - Updated 4 URLs
- `apps/web/src/routes/mc/+page.svelte` - Updated 1 URL
- `apps/web/src/routes/screen/+page.svelte` - Updated to use imported API_URL
- `apps/web/src/routes/summary/+page.svelte` - Updated to use imported API_URL

## Summary

**Before**: Hardcoded `localhost:3001` in 6 files → Production broken
**After**: Single `API_URL` source → Works in dev and production

The app now automatically uses the correct API URL based on environment!
