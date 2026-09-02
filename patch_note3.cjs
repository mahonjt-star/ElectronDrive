const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

const regex = /            \}\)\}\n          <\/div>\n        <\/div>\n      \)\}\n\n      \{speedStats\.length > 0 && \(/;

const rep = `            ))}
          </div>
          <div className="text-[10px] text-white/70 italic mt-2">
            Note: Peri-Urban and Medium Speed trips are most efficient as the vehicle neither pays a penalty for (1) the fixed cost of software and other ancillary functions, or (2) decreased aerodynamic efficiency.
          </div>
        </div>
      )}

      {speedStats.length > 0 && (`

code = code.replace(regex, rep);
fs.writeFileSync('src/components/AnalyticsTab.tsx', code);
