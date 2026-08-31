const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

const oldFixCode = /const runFix = async \(\) => \{[\s\S]*?runFix\(\);\n  \}, \[trips\]\);/;

const newFixCode = `  useEffect(() => {
    if (!trips || trips.length === 0) return;
    
    const runFix = async () => {
      // Find the two most recent trips (which should be today's trips)
      const recentTrips = trips.filter(t => t.tripType !== 'Road Trip').slice(0, 2);
      if (recentTrips.length !== 2) return;
      
      // Sort them chronologically so [0] is the outbound, [1] is the return
      recentTrips.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      const [trip1, trip2] = recentTrips;

      // Check if already fixed by seeing if trip1 ends at Royal Park exact coordinates
      if (trip1.weather?.end?.lat === -37.798174 && trip1.weather?.end?.locationName === 'Royal Park, Melbourne') return;

      const homeLat = -37.7946; 
      const homeLon = 144.8724;
      const homeLoc = '4 Elphinstone Street West footscray';

      const destLat = -37.798174;
      const destLon = 144.978447;
      const destLoc = 'Royal Park, Melbourne';

      try {
        await updateDoc(doc(db, 'trips', trip1.id), {
          'weather.start.lat': homeLat,
          'weather.start.lon': homeLon,
          'weather.start.locationName': homeLoc,
          'weather.end.lat': destLat,
          'weather.end.lon': destLon,
          'weather.end.locationName': destLoc,
        });

        await updateDoc(doc(db, 'trips', trip2.id), {
          'weather.start.lat': destLat,
          'weather.start.lon': destLon,
          'weather.start.locationName': destLoc,
          'weather.end.lat': homeLat,
          'weather.end.lon': homeLon,
          'weather.end.locationName': homeLoc,
        });
        
        // Also fix any other trips that have missing location names
        for (const trip of trips) {
           if (trip.id === trip1.id || trip.id === trip2.id) continue;
           
           let updates = {};
           if (trip.weather?.start?.lat && !trip.weather?.start?.locationName) {
              updates['weather.start.locationName'] = 'Melbourne';
           }
           if (trip.weather?.end?.lat && !trip.weather?.end?.locationName) {
              updates['weather.end.locationName'] = 'Melbourne';
           }
           if (Object.keys(updates).length > 0) {
              await updateDoc(doc(db, 'trips', trip.id), updates);
           }
        }
      } catch (err) {
        console.error('Failed to update trips:', err);
      }
    };
    runFix();
  }, [trips]);`;

code = code.replace(oldFixCode, newFixCode);
fs.writeFileSync('src/components/HistoryTab.tsx', code);
