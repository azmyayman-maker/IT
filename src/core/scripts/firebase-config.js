import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBxl3XSV7-JY4akq7WoZX70C_iS0zBAv50",
    authDomain: "app-a2a4c555.firebaseapp.com",
    projectId: "app-a2a4c555",
    storageBucket: "app-a2a4c555.firebasestorage.app",
    messagingSenderId: "223971879590",
    appId: "1:223971879590:web:b209fc1c8592863bc0a267"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
