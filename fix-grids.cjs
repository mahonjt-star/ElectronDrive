const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

// Replace using an exact function string match or indices
code = code.replace(/<h3 className="text-xs font-bold text-white uppercase tracking-widest">Seasonal Performance<\/h3>\s*<\/div>\s*<div className="grid grid-cols-1 md:grid-cols-\d gap-4">/g, '<h3 className="text-xs font-bold text-white uppercase tracking-widest">Seasonal Performance</h3>\n          </div>\n          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">');

code = code.replace(/<h3 className="text-xs font-bold text-white uppercase tracking-widest">Category Performance<\/h3>\s*<\/div>\s*<div className="grid grid-cols-1 md:grid-cols-\d gap-4">/g, '<h3 className="text-xs font-bold text-white uppercase tracking-widest">Category Performance</h3>\n          </div>\n          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">');

fs.writeFileSync('src/components/AnalyticsTab.tsx', code);
