/**
 * Firebase Admin SDK Configuration
 * Used for verifying Firebase ID tokens from mobile app
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with service account credentials
// You can either:
// 1. Set GOOGLE_APPLICATION_CREDENTIALS env variable pointing to service account JSON
// 2. Or directly initialize with credentials object

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) {
    return admin;
  }

  try {
    // Method 1: Using service account file path from environment variable
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID || 'coffeebeansworld-v1',
      });
      console.log('✅ Firebase Admin initialized with service account file');
    }
    // Method 2: Using service account JSON from environment variable
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'coffeebeansworld-v1',
      });
      console.log('✅ Firebase Admin initialized with service account JSON');
    }
    // Method 3: Manual configuration (for development)
    else {
      // For development - using project ID only (limited functionality)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'coffeebeansworld-v1',
      });
      console.warn('⚠️  Firebase Admin initialized without credentials - limited functionality');
    }

    firebaseInitialized = true;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    throw error;
  }

  return admin;
};

// Initialize Firebase on module load
const firebaseAdmin = initializeFirebase();

module.exports = firebaseAdmin;
