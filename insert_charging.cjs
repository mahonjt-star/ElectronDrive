const fs = require('fs');
let content = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

const chargingUI = `
              {trip.charging && (
                <div className="bg-black/20 p-3 rounded-xl border border-white/5 mt-3">
                  <div className="text-[10px] uppercase font-bold text-white tracking-widest mb-1 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-400" /> Charging Session
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest">Added</div>
                      <div className="text-sm font-bold text-white">{trip.charging.kwhAdded} <span className="text-[10px] opacity-60">kWh</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest">New SOC</div>
                      <div className="text-sm font-bold text-white">{trip.charging.newSoc} <span className="text-[10px] opacity-60">%</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest">Cost</div>
                      <div className="text-sm font-bold text-white">$\{trip.charging.cost.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
`;

content = content.replace(
  "{trip.payload && (",
  chargingUI + "{trip.payload && ("
);

fs.writeFileSync('src/components/HistoryTab.tsx', content);
