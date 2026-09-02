const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

// Update RoadTripCard
code = code.replace(
  "{totalSoc > 0 && ` • ${(totalDistance / totalSoc).toFixed(1)} km/%`}",
  "{totalSoc > 0 && ` • ${(totalDistance / totalSoc).toFixed(1)} km/%`}\n            {totalEnergy > 0 && ` • ${(totalDistance / totalEnergy).toFixed(2)} km/kWh`}"
);

// Update TripCard (which is what renders individual trips)
code = code.replace(
  "{trip.socUsedPct > 0 && ` • ${(trip.distanceKm / trip.socUsedPct).toFixed(1)} km/%`}",
  "{trip.socUsedPct > 0 && ` • ${(trip.distanceKm / trip.socUsedPct).toFixed(1)} km/%`}\n            {trip.estKWhUsed > 0 && ` • ${(trip.distanceKm / trip.estKWhUsed).toFixed(2)} km/kWh`}"
);

fs.writeFileSync('src/components/HistoryTab.tsx', code);
