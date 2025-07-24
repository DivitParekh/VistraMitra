// firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBvmh9DZobjF_vFR_71gL2NkwK8Oga18uw",
  authDomain: "vastramitra-b1cd0.firebaseapp.com",
  projectId: "vastramitra-b1cd0",
  storageBucket: "vastramitra-b1cd0.firebasestorage.app",
  messagingSenderId: "982643274182",
  appId: "1:982643274182:web:ddab7eda90b3b52ecd82c7",
  measurementId: "G-SQ7JKTBGP3"
};

const app = initializeApp(firebaseConfig);

// ✅ Add correct async storage persistence here 👇
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
