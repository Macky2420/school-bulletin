// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQETiMI1oA83sYko7KfjUsDAPiAhcVLvk",
  authDomain: "school-bulletin-91ead.firebaseapp.com",
  projectId: "school-bulletin-91ead",
  storageBucket: "school-bulletin-91ead.appspot.com",
  messagingSenderId: "776934134242",
  appId: "1:776934134242:web:ed7229170100062cdda9bb",
  measurementId: "G-348RWL9WBC",
  databaseURL: "https://school-bulletin-91ead-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics = null;

// Only initialize analytics in browser environment
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Analytics initialization error:", error);
  }
}

const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

export { app, analytics, auth, db, realtimeDb }; 