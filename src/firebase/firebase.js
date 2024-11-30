import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5TGUyL8v9rkm5WANKA9-CHYET8WA0br0",
  authDomain: "mlm-system-5f2ec.firebaseapp.com",
  projectId: "mlm-system-5f2ec",
  storageBucket: "mlm-system-5f2ec.firebasestorage.app",
  messagingSenderId: "60549127971",
  appId: "1:60549127971:web:8149accf21c29775873696",
  measurementId: "G-59CPT3J9MD"
};

// Initialize Firebase if not already initialized
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
