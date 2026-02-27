import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

export function initializeFirebase() {
  if (db) return db;

  try {
    let serviceAccount;

    // Try to load from environment variable first (for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('Loading Firebase credentials from environment variable...');
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      // Fall back to file (for local development)
      console.log('Loading Firebase credentials from file...');
      const serviceAccountPath = join(__dirname, '../../firebase-service-account.json');
      serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    db = admin.database();
    console.log('✅ Firebase initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
}

export default { initializeFirebase, getDatabase };
