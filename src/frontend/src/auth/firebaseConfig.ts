import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCS05uStMUKoeumwcsF7Mc34MYg5DEbFTQ",
  authDomain: "goat-88bf5.firebaseapp.com",
  projectId: "goat-88bf5",
  storageBucket: "goat-88bf5.firebasestorage.app",
  messagingSenderId: "628428969124",
  appId: "1:628428969124:web:30d24f321c253f2bbf8231",
  measurementId: "G-6T8J49TWEY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;


