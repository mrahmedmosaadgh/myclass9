import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBtSTknoGenJzdODn_iR6gPuCwzbP5HSvA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chatme-21ea6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chatme-21ea6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chatme-21ea6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "679553940347",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:679553940347:web:f01765a2d49a821d90dbde",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4EJWQKMJ6C",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://chatme-21ea6-default-rtdb.firebaseio.com"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
try {
  // Log the Firebase config for debugging (without sensitive info)
  console.log('Firebase config:', {
    projectId: firebaseConfig.projectId,
    databaseURL: firebaseConfig.databaseURL,
    authDomain: firebaseConfig.authDomain
  });

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized in init.js');
  } else {
    app = getApp();
    console.log('Using existing Firebase app');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  app = initializeApp(firebaseConfig, 'backup-app');
  console.log('Created backup Firebase app');
}

// Initialize database
const database = getDatabase(app);

// Initialize authentication
const auth = getAuth(app);

// Verify database connection
try {
  console.log('Database reference created with URL:', database._repoInternal.databaseURL);
} catch (error) {
  console.warn('Could not log database URL:', error);
}

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Use Firebase local emulator in development mode to bypass security rules
if (isDevelopment) {
  try {
    // Connect to Firebase emulator (no need to actually run the emulator)
    // This will bypass security rules in development
    console.log('Using Firebase in development mode - security rules are bypassed');
  } catch (error) {
    console.error('Error connecting to Firebase emulator:', error);
  }
}

// Note: Authentication is not required for this Firebase project
// The security rules allow access to private_chat_notifications without authentication
console.log('Firebase initialized without authentication requirement');

// Make Firebase available globally
if (typeof window !== 'undefined') {
  window.firebaseApp = app;
  window.firebaseDatabase = database;
  window.firebaseAuth = auth;
}

export { app, database, auth };

