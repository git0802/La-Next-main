// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPFd0X5PQO-h9ie5nK0icVJ6vc_kFTLvo",
  authDomain: "learnanything-187c4.firebaseapp.com",
  projectId: "learnanything-187c4",
  storageBucket: "learnanything-187c4.appspot.com",
  messagingSenderId: "418520906644",
  appId: "1:418520906644:web:ab4624e8c08c9fc1852d81",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider("microsoft.com");
export default auth;
