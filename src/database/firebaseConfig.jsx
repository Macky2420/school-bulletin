// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Cloudinary Configuration (directly in the file)
const cloudinaryConfig = {
  cloudName: "dvr3kabnv",
  uploadPreset: "quicknote"
};

// Your web app's Firebase configuration
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

// Initialize analytics only in browser environment
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

// Cloudinary Upload Function
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('cloud_name', cloudinaryConfig.cloudName);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
};

export { 
  app, 
  analytics, 
  auth, 
  db, 
  realtimeDb,
  uploadToCloudinary 
};