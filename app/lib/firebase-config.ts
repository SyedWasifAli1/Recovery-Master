// // lib/firebase-config.ts
// import { initializeApp, getApps, getApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';  // For Firebase Authentication
// import { getFirestore } from 'firebase/firestore';  // For Firestore database

// const firebaseConfig = {

//     apiKey: "AIzaSyDNnJlrCfZqpsJMdyc4QMvRCRaReVusrIc",
//     authDomain: "londoncomputers-9aedc.firebaseapp.com",
//     projectId: "londoncomputers-9aedc",
//     storageBucket: "londoncomputers-9aedc.firebasestorage.app",
//     messagingSenderId: "50579533609",
//     appId: "1:50579533609:web:4eb19338a02c0d5150d138"

//     // apiKey: "AIzaSyBybBOO1xADsLYshB1hKZy-H6DfbbSz7nM",
//     // authDomain: "paypointrecovery.firebaseapp.com",
//     // projectId: "paypointrecovery",
//     // storageBucket: "paypointrecovery.firebasestorage.app",
//     // messagingSenderId: "775548967805",
//     // appId: "1:775548967805:web:a3dff79c9206fd9a26ca14",
//     // measurementId: "G-K8E5HYRNQH"



//     // apiKey: "AIzaSyAYZih8F1tdsCNzRZt5hkG3rrdmMWHtlNI",
//     // authDomain: "osbazar.firebaseapp.com",
//     // projectId: "osbazar",
//     // storageBucket: "osbazar.firebasestorage.app",
//     // messagingSenderId: "745174758013",
//     // appId: "1:745174758013:web:878d3c0b4dcb5c4a6af714"
// };

// // Initialize Firebase if not already initialized
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// // Get Auth and Firestore instances
// const auth = getAuth(app);
// const firestore = getFirestore(app);

// export { app, auth, firestore };
// lib/firebase-config.ts




import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBovfy1NcNkPmassTgjl3XHqR2Fl6kAOCQ",
  authDomain: "recovery-master-316a9.firebaseapp.com",
  projectId: "recovery-master-316a9",
  storageBucket: "recovery-master-316a9.firebasestorage.app",
  messagingSenderId: "89070756912",
  appId: "1:89070756912:web:95c896c9d57e809093b9f5",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);

// Auth functions
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};

// Export all needed instances
export { app, auth, firestore };
