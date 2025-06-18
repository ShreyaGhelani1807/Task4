// firebase.js
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js");

// ✅ Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAzXCwBBPwZ0AARylfavXKb150kVz09J2k",
    authDomain: "time-tracker-project-3cb42.firebaseapp.com",
    projectId: "time-tracker-project-3cb42",
    storageBucket: "time-tracker-project-3cb42.firebasestorage.app",
    messagingSenderId: "218065979781",
    appId: "1:218065979781:web:1c658ede5f8241ab845cec"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ✅ Function to sync data
function syncToFirebase(data) {
  const today = new Date().toISOString().split("T")[0];
  db.collection("time_tracking").doc(today).set(data, { merge: true })
    .then(() => console.log("✅ Synced with Firebase"))
    .catch(err => console.error("❌ Firebase sync error:", err));
}
