const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

// Summary card
code = code.replace(
  "    </div>\n\n      {chargingStats && (",
  `    </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="glass-card p-5 h-full flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-white mb-2 text-xs font-bold uppercase tracking-widest">
            <BatteryCharging className="h-4 w-4 text-[#00D1FF] shrink-0" /> Distance per % SOC
          </div>
          <div className="stat-value text-3xl mb-2 truncate">{stats.avgKmPerPct} <span className="text-xs font-normal opacity-60">km/%</span></div>
          <div className="text-[10px] text-slate-400 font-normal mt-auto leading-tight">Average odometre distance travelled per 1% of battery state-of-charge used.</div>
        </div>
      </div>

      {chargingStats && (`
);

// Season
code = code.replace(
  '<span className="text-sm font-bold text-[#00D1FF]">{season.efficiency} <span className="text-[10px] opacity-60 text-white">kWh/100km</span></span>\n                  </div>',
  '<span className="text-sm font-bold text-[#00D1FF]">{season.efficiency} <span className="text-[10px] opacity-60 text-white">kWh/100km</span></span>\n                  </div>\n                  <div className="flex justify-between items-end border-b border-white/5 pb-2 pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">km / % SOC</span>\n                    <span className="text-sm font-bold text-white">{season.avgKmPerPct} <span className="text-[10px] opacity-60">km/%</span></span>\n                  </div>'
);

// Category
code = code.replace(
  /`\}\>\{cat\.efficiency\} \<span className\=\"text\-\[10px\] opacity\-60 text\-white\"\>kWh\/100km\<\/span\>\<\/span\>\n                  \<\/div\>/,
  `}>{cat.efficiency} <span className="text-[10px] opacity-60 text-white">kWh/100km</span></span>\n                  </div>\n                  <div className="flex justify-between items-end border-b border-white/5 pb-2 pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">km / % SOC</span>\n                    <span className="text-sm font-bold text-white">{cat.avgKmPerPct} <span className="text-[10px] opacity-60">km/%</span></span>\n                  </div>`
);

// Speed
code = code.replace(
  '<span className="text-sm font-bold text-[#00D1FF]">{speed.efficiency} <span className="text-[10px] opacity-60 text-white">kWh/100km</span></span>\n                  </div>\n                </div>',
  '<span className="text-sm font-bold text-[#00D1FF]">{speed.efficiency} <span className="text-[10px] opacity-60 text-white">kWh/100km</span></span>\n                  </div>\n                  <div className="flex justify-between items-end pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">km / % SOC</span>\n                    <span className="text-sm font-bold text-white">{speed.avgKmPerPct} <span className="text-[10px] opacity-60">km/%</span></span>\n                  </div>\n                </div>'
);

// Payload
code = code.replace(
  '<span className="text-sm font-bold text-[#00D1FF]">{payload.efficiency} <span className="text-[10px] opacity-60 text-white">kWh/100km</span></span>\n                  </div>\n                </div>',
  '<span className="text-sm font-bold text-[#00D1FF]">{payload.efficiency} <span className="text-[10px] opacity-60 text-white">kWh/100km</span></span>\n                  </div>\n                  <div className="flex justify-between items-end pt-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">km / % SOC</span>\n                    <span className="text-sm font-bold text-white">{payload.avgKmPerPct} <span className="text-[10px] opacity-60">km/%</span></span>\n                  </div>\n                </div>'
);

fs.writeFileSync('src/components/AnalyticsTab.tsx', code);
