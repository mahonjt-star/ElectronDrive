const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

// Since I don't have auth, I can't write from node script if it's protected by user auth.
