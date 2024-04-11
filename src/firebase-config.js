import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC-SL5BdHNW4D8aSM6lQXt-GD5E0MF46nk",
  authDomain: "planet-music-98c38.firebaseapp.com",
  projectId: "planet-music-98c38",
  storageBucket: "planet-music-98c38.appspot.com",
  messagingSenderId: "981119710304",
  appId: "1:981119710304:web:fc501eea4ad0b0f4aeff05"

};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export services
export { auth, db, storage };