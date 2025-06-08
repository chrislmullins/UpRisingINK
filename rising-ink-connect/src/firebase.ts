// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Use your config from your previous message:
const firebaseConfig = {
  apiKey: "AIzaSyAD3yZA7ymXo5RyaXCIF3MASCEDF8KxqmM",
  authDomain: "uprisinginkapp.firebaseapp.com",
  projectId: "uprisinginkapp",
  storageBucket: "uprisinginkapp.firebasestorage.app",
  messagingSenderId: "214379695954",
  appId: "1:214379695954:web:d1d87c91d9a9d5bd4af48b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
