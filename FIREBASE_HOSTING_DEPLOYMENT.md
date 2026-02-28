# Firebase Hosting Deployment Guide

This guide explains how to deploy the web app to Firebase Hosting.

## Prerequisites

1. Firebase CLI installed globally:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

## Configuration Files

The following files have been created for Firebase Hosting:

- `firebase.json` - Firebase Hosting configuration
- `.firebaserc` - Firebase project configuration
- `apps/web/.env.production` - Production environment variables

## Deployment Steps

### 1. Install Dependencies

```bash
cd apps/web
npm install
```

This will install the `@sveltejs/adapter-static` package needed for Firebase Hosting.

### 2. Update Production Environment Variables

Edit `apps/web/.env.production` and set your production API URL:

```env
PUBLIC_API_URL=https://your-api-domain.com
PUBLIC_SOCKET_URL=https://your-api-domain.com
```

Replace `your-api-domain.com` with your actual API endpoint (e.g., Render.com URL).

### 3. Build the Application

From the web app directory:

```bash
cd apps/web
npm run build:firebase
```

This creates a static build in `apps/web/build/` directory using the static adapter.

For Vercel deployment, use the regular build command:
```bash
npm run build
```

### 4. Test Locally (Optional)

```bash
firebase serve
```

This serves your app locally at `http://localhost:5000` to test before deploying.

### 5. Deploy to Firebase Hosting

From the project root:

```bash
firebase deploy --only hosting
```

Or with a custom message:

```bash
firebase deploy --only hosting -m "Initial deployment"
```

## Post-Deployment

After deployment, your app will be available at:
- `https://testdrive-17e53.web.app`
- `https://testdrive-17e53.firebaseapp.com`

### Custom Domain (Optional)

To add a custom domain:

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration steps

## Important Notes

### SPA Routing

The `firebase.json` includes a rewrite rule that routes all requests to `index.html`, enabling client-side routing for SvelteKit.

### Environment Variables

- Development: Uses `apps/web/.env` (localhost:8080)
- Production: Uses `apps/web/.env.production` (your production API)

Make sure to update the production env file before building.

### Caching

Static assets (JS, CSS, images) are cached for 1 year. HTML files are not cached to ensure users get the latest version.

## Troubleshooting

### Build Fails

If the build fails with adapter errors:

```bash
cd apps/web
npm install @sveltejs/adapter-static
npm run build
```

### API Connection Issues

Check that:
1. `PUBLIC_API_URL` in `.env.production` is correct
2. Your API server allows CORS from your Firebase Hosting domain
3. Update `apps/api/.env` CORS_ORIGIN to include your Firebase domain:

```env
CORS_ORIGIN=http://localhost:5173,https://testdrive-17e53.web.app,https://testdrive-17e53.firebaseapp.com
```

### 404 Errors

If you get 404 errors on page refresh, verify the rewrite rule in `firebase.json` is present.

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/firebase-hosting.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd apps/web
          npm install
          
      - name: Build
        run: |
          cd apps/web
          npm run build
          
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: testdrive-17e53
```

## Comparison: Firebase Hosting vs Vercel

| Feature | Firebase Hosting | Vercel |
|---------|-----------------|--------|
| Deployment | Manual via CLI | Auto from Git |
| Build Type | Static (SPA) | SSR + Static |
| CDN | Google CDN | Vercel Edge Network |
| Custom Domain | Free | Free |
| SSL | Free | Free |
| Analytics | Firebase Analytics | Vercel Analytics |
| Cost | Free tier generous | Free tier generous |

Both platforms work well for this SvelteKit app. Firebase Hosting is simpler for static sites, while Vercel offers better Git integration and SSR support.
