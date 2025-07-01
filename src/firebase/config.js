// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from "firebase/auth"
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJcmBs6d-mSBKlYt2d-h_nlY3pdIfI1_M",
  authDomain: "furs-project-7a0a3.firebaseapp.com",
  projectId: "furs-project-7a0a3",
  storageBucket: "furs-project-7a0a3.firebasestorage.app",
  messagingSenderId: "60959085391",
  appId: "1:60959085391:web:e46ad3606ca064d0e12b3a",
  measurementId: "G-TWEWQKBHZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export {db, auth, storage};
export default app;