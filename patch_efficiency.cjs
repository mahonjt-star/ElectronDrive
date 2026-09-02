const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

// 1. In stats
code = code.replace(
  'const avgKmPerPct = totalSoc > 0 ? Number((totalDist / totalSoc).toFixed(1)) : 0;',
  'const avgKmPerPct = totalSoc > 0 ? Number((totalDist / totalSoc).toFixed(1)) : 0;\n    const avgKmPerKwh = totalEnergy > 0 ? Number((totalDist / totalEnergy).toFixed(2)) : 0;'
);
code = code.replace(
  'avgKmPerPct\\n    };',
  'avgKmPerPct,\n      avgKmPerKwh\n    };'
);

// 2. In categoryStats
code = code.replace(
  'const avgKmPerPct = totalSoc > 0 ? Number((dist / totalSoc).toFixed(1)) : 0;\\n      const eff = dist > 0 ? Number(((energy / dist) * 100).toFixed(1)) : 0;',
  'const avgKmPerPct = totalSoc > 0 ? Number((dist / totalSoc).toFixed(1)) : 0;\n      const avgKmPerKwh = energy > 0 ? Number((dist / energy).toFixed(2)) : 0;\n      const eff = dist > 0 ? Number(((energy / dist) * 100).toFixed(1)) : 0;'
);
code = code.replace(
  'avgKmPerPct\\n      };',
  'avgKmPerPct,\n        avgKmPerKwh\n      };'
);

// 3. In seasonStats
code = code.replace(
  'const avgKmPerPct = totalSoc > 0 ? Number((dist / totalSoc).toFixed(1)) : 0;\\n      const eff = dist > 0 ? Number(((energy / dist) * 100).toFixed(1)) : 0;',
  'const avgKmPerPct = totalSoc > 0 ? Number((dist / totalSoc).toFixed(1)) : 0;\n      const avgKmPerKwh = energy > 0 ? Number((dist / energy).toFixed(2)) : 0;\n      const eff = dist > 0 ? Number(((energy / dist) * 100).toFixed(1)) : 0;'
);
// note: code.replace only replaces the first instance if we use a string, but we need to replace it everywhere where `eff` is calculated, or we can use regex
