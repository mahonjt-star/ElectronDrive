const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

// Replace Fleet Analytics
code = code.replace(
  '<h2 className="text-xs font-bold text-white uppercase tracking-widest">Fleet Analytics</h2>',
  '<h2 className="text-xs font-bold text-white uppercase tracking-widest">Vehicle Analytics</h2>'
);

// Add sub-heading
const timeframesDivEnd = `          </button>
        ))}
      </div>`;

const timeframesDivEndWithHeading = `          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mt-2 px-1">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Vehicle Performance (All Trips)</h3>
      </div>`;

code = code.replace(timeframesDivEnd, timeframesDivEndWithHeading);

fs.writeFileSync('src/components/AnalyticsTab.tsx', code);
