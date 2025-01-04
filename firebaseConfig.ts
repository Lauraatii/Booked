// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqHNcLaOntFBNrSCp-ExFAjiy9IiYHrGI",
  authDomain: "booked-b3c5c.firebaseapp.com",
  projectId: "booked-b3c5c",
  storageBucket: "booked-b3c5c.firebasestorage.app",
  messagingSenderId: "755347349698",
  appId: "1:755347349698:web:29329ded08458da2a89b5b",
  measurementId: "G-8SWEP4PHCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);