import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App safely with singleton pattern
export const app = !getApps().length
  ? initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    })
  : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore Database
// Using the specified databaseId from configuration if present
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connectivity check
let hasTestedConnection = false;
export async function testFirestoreConnection() {
  if (hasTestedConnection) return;
  hasTestedConnection = true;
  try {
    await getDocFromServer(doc(db, '_connection_probe', 'test'));
    console.log('Firebase Firestore connection verified successfully');
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firebase Firestore client is operating offline:', error.message);
    } else {
      // Permission-denied or document-not-found is normal for connection probe and means online
      console.log('Firebase Firestore reachable');
    }
  }
}
