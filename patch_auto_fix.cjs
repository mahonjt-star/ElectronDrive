const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

const oldFixCode = /const runFix = async \(\) => \{[\s\S]*?runFix\(\);\n  \}, \[trips\]\);/;

const newFixCode = `  useEffect(() => {
    if (!trips || trips.length === 0) return;
    
    const runFix = async () => {
      // Find trips that need location names
      const tripsToFix = trips.filter(t => 
        (t.weather?.start?.lat && !t.weather?.start?.locationName) || 
        (t.weather?.end?.lat && !t.weather?.end?.locationName)
      );

      if (tripsToFix.length === 0) return;

      for (const trip of tripsToFix) {
        let startLoc = trip.weather?.start?.locationName;
        let endLoc = trip.weather?.end?.locationName;
        let updates = {};

        // Custom override for the specific coordinates mentioned by user
        const isFootscray = (lat) => Math.abs(lat - (-37.7946)) < 0.01;
        const isRoyalPark = (lat) => Math.abs(lat - (-37.798174)) < 0.01;

        if (trip.weather?.start?.lat && !startLoc) {
            if (isFootscray(trip.weather.start.lat)) {
               startLoc = '4 Elphinstone Street West footscray';
            } else if (isRoyalPark(trip.weather.start.lat)) {
               startLoc = 'Royal Park, Melbourne';
            } else {
               try {
                 const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${trip.weather.start.lat}&lon=\${trip.weather.start.lon}\`);
                 const data = await res.json();
                 if (data && data.address) {
                    startLoc = data.address.suburb || data.address.town || data.address.city || data.name || 'Map';
                 }
               } catch(e) {}
            }
            if (startLoc) updates['weather.start.locationName'] = startLoc;
        }

        if (trip.weather?.end?.lat && !endLoc) {
            if (isFootscray(trip.weather.end.lat)) {
               endLoc = '4 Elphinstone Street West footscray';
            } else if (isRoyalPark(trip.weather.end.lat)) {
               endLoc = 'Royal Park, Melbourne';
            } else {
               try {
                 const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${trip.weather.end.lat}&lon=\${trip.weather.end.lon}\`);
                 const data = await res.json();
                 if (data && data.address) {
                    endLoc = data.address.suburb || data.address.town || data.address.city || data.name || 'Map';
                 }
               } catch(e) {}
            }
            if (endLoc) updates['weather.end.locationName'] = endLoc;
        }

        if (Object.keys(updates).length > 0) {
           try {
             await updateDoc(doc(db, 'trips', trip.id), updates);
           } catch (e) {
             console.error("Failed to update trip locations", e);
           }
        }
      }
    };
    runFix();
  }, [trips]);`;

code = code.replace(oldFixCode, newFixCode);
fs.writeFileSync('src/components/HistoryTab.tsx', code);
