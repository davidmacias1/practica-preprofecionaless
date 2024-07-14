import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {

    apiKey: "AIzaSyCSdiKzExfIRJG2btS4Yh8A95f6QjnDHMA",
  
    authDomain: "practias-prep.firebaseapp.com",
  
    projectId: "practias-prep",
  
    storageBucket: "practias-prep.appspot.com",
  
    messagingSenderId: "539368940640",
  
    appId: "1:539368940640:web:cf94f47f7a6685d8c20f05"
  
  };
  

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
export const db = getFirestore(app);

// Inicializa Firebase Auth
export const auth = getAuth(app);
