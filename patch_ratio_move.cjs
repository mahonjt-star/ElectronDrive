const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

code = code.replace(
  '<div className="grid grid-cols-2 gap-2 mb-3">\n            <div className="text-sm font-bold text-[#00D1FF]">{stats.avgKmPerPct} <span className="text-[10px] font-normal opacity-60 text-white">km/% SOC</span></div>\n            <div className="text-sm font-bold text-[#00D1FF] text-right">{stats.avgKmPerKwh} <span className="text-[10px] font-normal opacity-60 text-white">km/kWh</span></div>\n            <div className="text-sm font-bold text-[#00D1FF]">{stats.avgKwhPerPct} <span className="text-[10px] font-normal opacity-60 text-white">kWh/% SOC</span></div>\n          </div>',
  '<div className="flex justify-between mb-3">\n            <div className="text-sm font-bold text-[#00D1FF]">{stats.avgKmPerPct} <span className="text-[10px] font-normal opacity-60 text-white">km / % SOC</span></div>\n            <div className="text-sm font-bold text-[#00D1FF] text-right">{stats.avgKmPerKwh} <span className="text-[10px] font-normal opacity-60 text-white">km / kWh</span></div>\n          </div>'
);

code = code.replace(
  '<div className="stat-value text-3xl mb-2 truncate">{stats.totalEnergy.toLocaleString()} <span className="text-xs font-normal opacity-60">kWh</span></div>',
  '<div className="stat-value text-3xl mb-2 truncate">{stats.totalEnergy.toLocaleString()} <span className="text-xs font-normal opacity-60">kWh</span></div>\n          <div className="text-sm font-bold text-[#00D1FF] mb-3">{stats.avgKwhPerPct} <span className="text-[10px] font-normal opacity-60 text-white">kWh / % SOC</span></div>'
);

fs.writeFileSync('src/components/AnalyticsTab.tsx', code);
