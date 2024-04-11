// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-SL5BdHNW4D8aSM6lQXt-GD5E0MF46nk",
  authDomain: "planet-music-98c38.firebaseapp.com",
  projectId: "planet-music-98c38",
  storageBucket: "planet-music-98c38.appspot.com",
  messagingSenderId: "981119710304",
  appId: "1:981119710304:web:fc501eea4ad0b0f4aeff05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export services
export { auth, db, storage };