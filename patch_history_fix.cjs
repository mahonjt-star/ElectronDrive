const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

const fixCode = `  const { trips, loading } = useTrips(user?.uid);

  useEffect(() => {
    if (!trips || trips.length === 0) return;
    
    const runFix = async () => {
      const todayStr = '2026-08-30';
      const todaysTrips = trips.filter(t => t.tripType !== 'Road Trip' && format(t.startTime, 'yyyy-MM-dd') === todayStr);
      if (todaysTrips.length !== 2) return;
      
      todaysTrips.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      const [trip1, trip2] = todaysTrips;

      if (trip1.weather?.end?.lat === -37.798174) return;

      const yesterdayTrips = trips.filter(t => format(t.startTime, 'yyyy-MM-dd') === '2026-08-29');
      let homeLat = -37.7946; 
      let homeLon = 144.8724;
      let homeLoc = '4 Elphinstone Street West footscray';

      if (yesterdayTrips.length > 0) {
         const yTrip = yesterdayTrips.find(t => t.weather?.start?.locationName?.toLowerCase().includes('elphinstone')) || yesterdayTrips[0];
         if (yTrip.weather?.start?.lat) homeLat = yTrip.weather.start.lat;
         if (yTrip.weather?.start?.lon) homeLon = yTrip.weather.start.lon;
         if (yTrip.weather?.start?.locationName) homeLoc = yTrip.weather.start.locationName;
      }

      const destLat = -37.798174;
      const destLon = 144.978447;
      
      let destLoc = 'Melbourne';
      try {
        const nomRes = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${destLat}&lon=\${destLon}\`, {
          headers: { 'User-Agent': 'AI-Studio-Electron-App' }
        });
        const nomData = await nomRes.json();
        if (nomData && nomData.address) {
          const { suburb, city, town, village, road } = nomData.address;
          destLoc = suburb || town || village || city || road || nomData.name || "Melbourne";
        }
      } catch (err) {}

      try {
        await updateDoc(doc(db, 'trips', trip1.id!), {
          'weather.start.lat': homeLat,
          'weather.start.lon': homeLon,
          'weather.start.locationName': homeLoc,
          'weather.end.lat': destLat,
          'weather.end.lon': destLon,
          'weather.end.locationName': destLoc,
        });

        await updateDoc(doc(db, 'trips', trip2.id!), {
          'weather.start.lat': destLat,
          'weather.start.lon': destLon,
          'weather.start.locationName': destLoc,
          'weather.end.lat': homeLat,
          'weather.end.lon': homeLon,
          'weather.end.locationName': homeLoc,
        });
      } catch (err) {
        console.error('Failed to update trips:', err);
      }
    };
    runFix();
  }, [trips]);`;

code = code.replace("  const { trips, loading } = useTrips(user?.uid);", fixCode);

fs.writeFileSync('src/components/HistoryTab.tsx', code);
