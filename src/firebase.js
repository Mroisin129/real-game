import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyANreEsvoEl8WxOUv1XAORJEqAfzZvqTvY",
  authDomain: "puzzle-b631a.firebaseapp.com",
  projectId: "puzzle-b631a",
  storageBucket: "puzzle-b631a.firebasestorage.app",
  messagingSenderId: "387323217022",
  appId: "1:387323217022:web:722965792b4564b7b1c42f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
