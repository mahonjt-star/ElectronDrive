const fs = require('fs');
let content = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');
content = content.replace(
  "let totalRangeDiff = 0;\n  let hasRangeDiff = false;\n  cluster.trips.forEach(t => {\n    if (t.estRangeUsed && t.estRangeUsed > 0) {\n      const diff = (t.rangeDiffKm !== undefined && t.rangeDiffKm !== null) ? t.rangeDiffKm : (t.distanceKm - t.estRangeUsed);\n      totalRangeDiff += diff;\n      hasRangeDiff = true;\n    }\n  });",
  `let totalRangeDiff = 0;
  let totalEstRangeUsed = 0;
  let hasRangeDiff = false;
  cluster.trips.forEach(t => {
    if (t.estRangeUsed && t.estRangeUsed > 0) {
      const diff = (t.rangeDiffKm !== undefined && t.rangeDiffKm !== null) ? t.rangeDiffKm : (t.distanceKm - t.estRangeUsed);
      totalRangeDiff += diff;
      totalEstRangeUsed += t.estRangeUsed;
      hasRangeDiff = true;
    }
  });
  const totalRangeAccuracy = totalEstRangeUsed > 0 ? Number(((totalRangeDiff / totalEstRangeUsed) * 100).toFixed(1)) : 0;`
);

content = content.replace(
  "{totalRangeDiff === 0 ? 'Exact Match' : `${Math.abs(Number(totalRangeDiff.toFixed(1)))} km ${totalRangeDiff < 0 ? 'Overestimate' : 'Underestimate'}`}",
  "{totalRangeDiff === 0 ? 'Exact Match' : `${Math.abs(Number(totalRangeDiff.toFixed(1)))} km (${Math.abs(totalRangeAccuracy)}%) ${totalRangeDiff < 0 ? 'Overestimate' : 'Underestimate'}`}"
);

fs.writeFileSync('src/components/HistoryTab.tsx', content);
