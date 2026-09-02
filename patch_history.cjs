const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

// RoadTripCard
code = code.replace(
  "const totalEnergy = cluster.trips.reduce((acc, t) => acc + t.estKWhUsed, 0);",
  "const totalEnergy = cluster.trips.reduce((acc, t) => acc + t.estKWhUsed, 0);\n  const totalSoc = cluster.trips.reduce((acc, t) => acc + (t.socUsedPct || 0), 0);"
);

code = code.replace(
  "{avgSpeed && ` • ${avgSpeed} km/h`}",
  "{avgSpeed && ` • ${avgSpeed} km/h`}\n            {totalSoc > 0 && ` • ${(totalDistance / totalSoc).toFixed(1)} km/%`}"
);

// TripCard
code = code.replace(
  "{trip.averageSpeedKph && ` • ${trip.averageSpeedKph} km/h`}",
  "{trip.averageSpeedKph && ` • ${trip.averageSpeedKph} km/h`}\n            {trip.socUsedPct > 0 && ` • ${(trip.distanceKm / trip.socUsedPct).toFixed(1)} km/%`}"
);

fs.writeFileSync('src/components/HistoryTab.tsx', code);
