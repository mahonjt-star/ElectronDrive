const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

// For stats
code = code.replace(
  "const totalDur = filteredTrips.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);",
  "const totalSoc = filteredTrips.reduce((acc, t) => acc + (t.socUsedPct || 0), 0);\n    const avgKmPerPct = totalSoc > 0 ? Number((totalDist / totalSoc).toFixed(1)) : 0;\n    const totalDur = filteredTrips.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);"
);

code = code.replace(
  "avgSpeed\n    };",
  "avgSpeed,\n      avgKmPerPct\n    };"
);

// For categoryStats, seasonStats, speedStats, payloadStats
// We can just regex replace the "const energy = ... reduce(...estKWhUsed, 0);" 
// with that + "\n      const totalSoc = ____.reduce((acc, t) => acc + (t.socUsedPct || 0), 0);\n      const avgKmPerPct = totalSoc > 0 ? Number((dist / totalSoc).toFixed(1)) : 0;"

code = code.replace(/const energy = (\w+)\.reduce\(\(acc, t\) => acc \+ t\.estKWhUsed, 0\);/g, 
  "const energy = $1.reduce((acc, t) => acc + t.estKWhUsed, 0);\n      const totalSoc = $1.reduce((acc, t) => acc + (t.socUsedPct || 0), 0);\n      const avgKmPerPct = totalSoc > 0 ? Number((dist / totalSoc).toFixed(1)) : 0;"
);

// And append avgKmPerPct to the return object in those
// return { name: ..., distance: ..., efficiency: ..., ... }
code = code.replace(/(count: \w+\.length,?\n?[ \t]*rangeBiasPct: [^,\n]+,?\n?[ \t]*totalRangeDiff: [^,\n]+)\n[ \t]*\}/g, 
  "$1,\n        avgKmPerPct\n      }"
);
code = code.replace(/(count: \w+\.length)\n[ \t]*\}/g, 
  "$1,\n        avgKmPerPct\n      }"
);

fs.writeFileSync('src/components/AnalyticsTab.tsx', code);
