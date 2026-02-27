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
    // Load service account from file
    const serviceAccountPath = join(__dirname, '../../firebase-service-account.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

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
