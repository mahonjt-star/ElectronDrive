import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const tripsRef = collection(db, 'trips');
  const snapshot = await getDocs(tripsRef);
  
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const todayTrips = [];
  snapshot.forEach(d => {
    const data = d.data();
    const startTime = data.startTime?.toDate ? data.startTime.toDate() : new Date(data.startTime);
    if (startTime >= startOfToday) {
      todayTrips.push({ id: d.id, data, startTime });
    }
  });
  
  todayTrips.sort((a, b) => a.startTime - b.startTime);
  
  if (todayTrips.length >= 2) {
    const leg1 = todayTrips[0];
    await updateDoc(doc(db, 'trips', leg1.id), {
      "weather.end.temp": 14,
      "weather.end.condition": "Partly Cloudy"
    });
    console.log("Leg 1 updated successfully.");
  } else {
    console.log("Could not find 2 legs for today.");
  }
  process.exit(0);
}
run();
