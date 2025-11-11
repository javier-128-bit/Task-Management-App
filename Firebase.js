import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDL-ZORFkniQIGSshljfmCmKjy_0E8np3Y",
  authDomain: "taskmanagementapp-c39fd.firebaseapp.com",
  projectId: "taskmanagementapp-c39fd",
  storageBucket: "taskmanagementapp-c39fd.firebasestorage.app",
  messagingSenderId: "765373804186",
  appId: "1:765373804186:web:592b3d6dc49535b9247923",
  measurementId: "G-8N9Q3K0WJN",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
