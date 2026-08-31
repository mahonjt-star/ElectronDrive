const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "gen-lang-client-0790793418",
  appId: "1:818499731518:web:83ca9d0e36d522d3be116f",
  apiKey: "AIzaSyBjwaz2AJmuAfNP_3aICuhuhQXAmNSFKdQ",
  authDomain: "gen-lang-client-0790793418.firebaseapp.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-75aaf437-186c-44b2-a889-15b342ecc1fe");

async function check() {
  const q = query(collection(db, 'trips'));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    const data = doc.data();
    if (data.tripType !== 'Road Trip') {
        const date = new Date(data.startTime.seconds * 1000).toISOString();
        if (date.startsWith('2026-08-30')) {
             console.log("Trip ID", doc.id, "Date", date);
             console.log("Start Weather:", data.weather?.start);
             console.log("End Weather:", data.weather?.end);
        }
    }
  });
}
check();
