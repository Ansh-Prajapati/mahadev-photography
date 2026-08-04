// ========================================
// FIREBASE CONFIGURATION
// ========================================

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB0oQ5jckK83kCPpYpQRqCtg1POW1Wr83k",
    authDomain: "mahadev-photography.firebaseapp.com",
    projectId: "mahadev-photography",
    storageBucket: "mahadev-photography.firebasestorage.app",
    messagingSenderId: "584518739767",
    appId: "1:584518739767:web:64d7461ba46dba83d85cb2",
    measurementId: "G-1G5YDP7M4D"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore (Database)
const db = firebase.firestore();

// Initialize Storage (for image uploads)
const storage = firebase.storage();

console.log('🔥 Firebase initialized successfully!');
console.log('📁 Project: mahadev-photography');
console.log('🗄️ Firestore ready!');
console.log('📸 Storage ready!');