# Deploying to Vercel

## Important Note

This is a **monorepo** with two separate apps:
- `apps/web` - SvelteKit frontend (can be deployed to Vercel)
- `apps/api` - Express.js backend (needs a different hosting service)

## Deploy Frontend (Web App) to Vercel

### Step 1: Push Changes to GitHub

```bash
git add .
git commit -m "Add Vercel configuration"
git push
```

### Step 2: Configure Vercel Project

1. Go to https://vercel.com/new
2. Import your repository: `LorillaJm/queuingsystembyd`
3. Configure the project:

**Framework Preset:** SvelteKit

**Root Directory:** `apps/web` (IMPORTANT!)

**Build Command:** `npm run build`

**Output Directory:** `.svelte-kit` (leave default)

**Install Command:** `npm install`

### Step 3: Add Environment Variables

In Vercel project settings, add:

```
PUBLIC_API_URL=https://your-api-url.com
```

(You'll need to deploy the API first to get this URL)

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

## Deploy Backend (API) - Recommended Options

Since Vercel is primarily for frontend apps, deploy your API to one of these:

### Option 1: Railway (Recommended)

1. Go to https://railway.app/
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `LorillaJm/queuingsystembyd`
5. Set Root Directory: `apps/api`
6. Add environment variables:
   - `FIREBASE_DATABASE_URL`
   - `STAFF_PIN`
   - `PORT=3001`
7. Add Firebase service account JSON as environment variable
8. Deploy!

### Option 2: Render

1. Go to https://render.com/
2. New → Web Service
3. Connect GitHub repository
4. Set Root Directory: `apps/api`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables
8. Deploy!

### Option 3: Heroku

1. Install Heroku CLI
2. Create new app
3. Set buildpack to Node.js
4. Configure environment variables
5. Deploy

## After Deployment

1. Get your API URL from Railway/Render/Heroku
2. Update Vercel environment variable `PUBLIC_API_URL` with your API URL
3. Redeploy the frontend on Vercel

## Environment Variables Needed

### Frontend (Vercel)
```
PUBLIC_API_URL=https://your-api-url.com
```

### Backend (Railway/Render/Heroku)
```
FIREBASE_DATABASE_URL=https://testdrive-17e53-default-rtdb.asia-southeast1.firebasedatabase.app
STAFF_PIN=1234
PORT=3001
NODE_ENV=production
```

Plus your Firebase service account JSON content.

## Testing Deployment

After both are deployed:

1. Visit your Vercel URL (frontend)
2. Try registering a customer
3. Check if it connects to your API
4. Test the staff panel, MC view, and display screen

## Troubleshooting

**Frontend can't connect to API:**
- Check `PUBLIC_API_URL` environment variable
- Make sure API is running
- Check CORS settings in API

**API not starting:**
- Check environment variables
- Verify Firebase credentials
- Check logs in Railway/Render dashboard

**Build fails:**
- Make sure Root Directory is set correctly
- Check that all dependencies are in package.json
- Review build logs for specific errors

## Alternative: Deploy Both on Railway

Railway can host both frontend and backend:

1. Create two services in Railway
2. Service 1: Frontend (apps/web)
3. Service 2: Backend (apps/api)
4. Link them with environment variables
5. Deploy both!

This is simpler as everything is in one place.
