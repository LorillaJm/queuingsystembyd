import adapterAuto from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Use static adapter for Firebase Hosting, auto adapter for other platforms
const isFirebase = process.env.FIREBASE_BUILD === 'true';

const adapter = isFirebase 
  ? adapterStatic({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: false
    })
  : adapterAuto({
      runtime: 'nodejs20.x'
    });

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter
  }
};

export default config;
