const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

// First, remove the new card
const newCardStr = `
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="glass-card p-5 h-full flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-white mb-2 text-xs font-bold uppercase tracking-widest">
            <BatteryCharging className="h-4 w-4 text-[#00D1FF] shrink-0" /> Distance per % SOC
          </div>
          <div className="stat-value text-3xl mb-2 truncate">{stats.avgKmPerPct} <span className="text-xs font-normal opacity-60">km/%</span></div>
          <div className="text-[10px] text-slate-400 font-normal mt-auto leading-tight">Average odometre distance travelled per 1% of battery state-of-charge used.</div>
        </div>
      </div>`;

code = code.replace(newCardStr, '');

// Second, modify the "Distance Travelled" card to include the value
const distCardStr = `        <div className="glass-card p-5 h-full flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-white mb-2 text-xs font-bold uppercase tracking-widest">
            <Navigation className="h-4 w-4 text-[#00D1FF] shrink-0" /> Distance Travelled
          </div>
          <div className="stat-value text-3xl mb-2 truncate">{stats.totalDist.toLocaleString()} <span className="text-xs font-normal opacity-60">km</span></div>
          <div className="text-[10px] text-slate-400 font-normal mt-auto leading-tight">Actual odometre kilometres driven across selected trips.</div>
        </div>`;

const newDistCardStr = `        <div className="glass-card p-5 h-full flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-white mb-2 text-xs font-bold uppercase tracking-widest">
            <Navigation className="h-4 w-4 text-[#00D1FF] shrink-0" /> Distance Travelled
          </div>
          <div className="stat-value text-3xl mb-2 truncate">{stats.totalDist.toLocaleString()} <span className="text-xs font-normal opacity-60">km</span></div>
          <div className="text-sm font-bold text-[#00D1FF] mb-3">{stats.avgKmPerPct} <span className="text-[10px] font-normal opacity-60 text-white">km / % SOC</span></div>
          <div className="text-[10px] text-slate-400 font-normal mt-auto leading-tight">Actual odometre kilometres driven across selected trips.</div>
        </div>`;

code = code.replace(distCardStr, newDistCardStr);

fs.writeFileSync('src/components/AnalyticsTab.tsx', code);
