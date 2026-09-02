const fs = require('fs');

// --- ANALYTICS TAB ---
let analytics = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

// Global Stats calculation
analytics = analytics.replace(
  'const avgKmPerKwh = totalEnergy > 0 ? Number((totalDist / totalEnergy).toFixed(2)) : 0;',
  'const avgKmPerKwh = totalEnergy > 0 ? Number((totalDist / totalEnergy).toFixed(2)) : 0;\n    const avgKwhPerPct = totalSoc > 0 ? Number((totalEnergy / totalSoc).toFixed(2)) : 0;'
);
analytics = analytics.replace(
  'avgKmPerKwh\n    };\n  }, [filteredTrips]);',
  'avgKmPerKwh,\n      avgKwhPerPct\n    };\n  }, [filteredTrips]);'
);

// Mapped stats calculations
analytics = analytics.replaceAll(
  'const avgKmPerKwh = energy > 0 ? Number((dist / energy).toFixed(2)) : 0;',
  'const avgKmPerKwh = energy > 0 ? Number((dist / energy).toFixed(2)) : 0;\n      const avgKwhPerPct = totalSoc > 0 ? Number((energy / totalSoc).toFixed(2)) : 0;'
);

analytics = analytics.replaceAll(
  'avgKmPerKwh\n      };\n    }).filter(c => c.count > 0);',
  'avgKmPerKwh,\n        avgKwhPerPct\n      };\n    }).filter(c => c.count > 0);'
);

// Render global stats
analytics = analytics.replace(
  '<div className="flex justify-between mb-3">\n            <div className="text-sm font-bold text-[#00D1FF]">{stats.avgKmPerPct} <span className="text-[10px] font-normal opacity-60 text-white">km / % SOC</span></div>\n            <div className="text-sm font-bold text-[#00D1FF]">{stats.avgKmPerKwh} <span className="text-[10px] font-normal opacity-60 text-white">km / kWh</span></div>\n          </div>',
  '<div className="grid grid-cols-2 gap-2 mb-3">\n            <div className="text-sm font-bold text-[#00D1FF]">{stats.avgKmPerPct} <span className="text-[10px] font-normal opacity-60 text-white">km/% SOC</span></div>\n            <div className="text-sm font-bold text-[#00D1FF] text-right">{stats.avgKmPerKwh} <span className="text-[10px] font-normal opacity-60 text-white">km/kWh</span></div>\n            <div className="text-sm font-bold text-[#00D1FF]">{stats.avgKwhPerPct} <span className="text-[10px] font-normal opacity-60 text-white">kWh/% SOC</span></div>\n          </div>'
);

// Render mapped stats (Seasons, Categories, Speed, Payload)
const toReplace = '<div className="flex justify-between items-end border-b border-white/5 pb-2 pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">km / kWh</span>\n                    <span className="text-sm font-bold text-white">{season.avgKmPerKwh} <span className="text-[10px] opacity-60">km/kWh</span></span>\n                  </div>';
analytics = analytics.replace(toReplace, toReplace + '\n                  <div className="flex justify-between items-end border-b border-white/5 pb-2 pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">kWh / % SOC</span>\n                    <span className="text-sm font-bold text-white">{season.avgKwhPerPct} <span className="text-[10px] opacity-60">kWh/%</span></span>\n                  </div>');

const toReplaceCat = '<div className="flex justify-between items-end border-b border-white/5 pb-2 pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">km / kWh</span>\n                    <span className="text-sm font-bold text-white">{cat.avgKmPerKwh} <span className="text-[10px] opacity-60">km/kWh</span></span>\n                  </div>';
analytics = analytics.replace(toReplaceCat, toReplaceCat + '\n                  <div className="flex justify-between items-end border-b border-white/5 pb-2 pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">kWh / % SOC</span>\n                    <span className="text-sm font-bold text-white">{cat.avgKwhPerPct} <span className="text-[10px] opacity-60">kWh/%</span></span>\n                  </div>');

const toReplaceSpeed = '<div className="flex justify-between items-end pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">km / kWh</span>\n                    <span className="text-sm font-bold text-white">{speed.avgKmPerKwh} <span className="text-[10px] opacity-60">km/kWh</span></span>\n                  </div>';
analytics = analytics.replace(toReplaceSpeed, '<div className="flex justify-between items-end border-b border-white/5 pb-2 pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">km / kWh</span>\n                    <span className="text-sm font-bold text-white">{speed.avgKmPerKwh} <span className="text-[10px] opacity-60">km/kWh</span></span>\n                  </div>\n                  <div className="flex justify-between items-end pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">kWh / % SOC</span>\n                    <span className="text-sm font-bold text-white">{speed.avgKwhPerPct} <span className="text-[10px] opacity-60">kWh/%</span></span>\n                  </div>');

const toReplacePayload = '<div className="flex justify-between items-end pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">km / kWh</span>\n                    <span className="text-sm font-bold text-white">{payload.avgKmPerKwh} <span className="text-[10px] opacity-60">km/kWh</span></span>\n                  </div>';
analytics = analytics.replace(toReplacePayload, '<div className="flex justify-between items-end border-b border-white/5 pb-2 pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">km / kWh</span>\n                    <span className="text-sm font-bold text-white">{payload.avgKmPerKwh} <span className="text-[10px] opacity-60">km/kWh</span></span>\n                  </div>\n                  <div className="flex justify-between items-end pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">kWh / % SOC</span>\n                    <span className="text-sm font-bold text-white">{payload.avgKwhPerPct} <span className="text-[10px] opacity-60">kWh/%</span></span>\n                  </div>');

fs.writeFileSync('src/components/AnalyticsTab.tsx', analytics);

// --- HISTORY TAB ---
let history = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

history = history.replace(
  "{totalEnergy > 0 && ` • ${(totalDistance / totalEnergy).toFixed(2)} km/kWh`}",
  "{totalEnergy > 0 && ` • ${(totalDistance / totalEnergy).toFixed(2)} km/kWh`}\n            {totalSoc > 0 && totalEnergy > 0 && ` • ${(totalEnergy / totalSoc).toFixed(2)} kWh/%`}"
);

history = history.replace(
  "{trip.estKWhUsed > 0 && ` • ${(trip.distanceKm / trip.estKWhUsed).toFixed(2)} km/kWh`}",
  "{trip.estKWhUsed > 0 && ` • ${(trip.distanceKm / trip.estKWhUsed).toFixed(2)} km/kWh`}\n            {trip.socUsedPct > 0 && trip.estKWhUsed > 0 && ` • ${(trip.estKWhUsed / trip.socUsedPct).toFixed(2)} kWh/%`}"
);

fs.writeFileSync('src/components/HistoryTab.tsx', history);
