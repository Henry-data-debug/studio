
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Make sure to import getAuth
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For more information on how to get this object, see the link below
// https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyBmM3eJxNrPWHzbjbfY2wWlEMEJHFKcTCA",
  authDomain: "studio-3511865139-8f049.firebaseapp.com",
  projectId: "studio-3511865139-8f049",
  storageBucket: "studio-3511865139-8f049.firebasestorage.app",
  messagingSenderId: "259711668664",
  appId: "1:259711668664:web:e31d57597dc555df68bf4d",
  measurementId: "G-L5B9L3B033"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and db
export const db = getFirestore(app);
export const auth = getAuth(app);
