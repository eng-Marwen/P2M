// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIRE_BASE_API_KEY,
  authDomain: "web-project-8d1ab.firebaseapp.com",
  projectId: "web-project-8d1ab",
  storageBucket: "web-project-8d1ab.firebasestorage.app",
  messagingSenderId: "109048466545",
  appId: "1:109048466545:web:96fa8d57632a8cbbd4dfd0",
  measurementId: "G-SF5TP7X02W"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);