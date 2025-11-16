// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyAj0L_lucIXR4CpaPg9AbUZCglB3aAmnEs",
  authDomain: "ai-mock-interview-test.firebaseapp.com",
  projectId: "ai-mock-interview-test",
  storageBucket: "ai-mock-interview-test.firebasestorage.app",
  messagingSenderId: "482644141869",
  appId: "1:482644141869:web:10c52f02c98e2eaf58d5a4"
};


const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);