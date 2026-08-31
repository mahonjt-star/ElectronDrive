const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

// Function to inject count row
function addCountRow(htmlStr, typeName) {
  return htmlStr.replace(
    /(<div className="space-y-3">)/,
    `$1\n                  <div className="flex justify-between items-end border-b border-white/5 pb-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Trips</span>\n                    <span className="text-sm font-bold">{${typeName}.count} <span className="text-[10px] opacity-60 text-white">({Math.round((${typeName}.count / filteredTrips.length) * 100)}%)</span></span>\n                  </div>`
  );
}

const originalSeason = `<div className="space-y-3">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">`;
                  
const originalCat = `<div className="space-y-3">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">`;

code = code.replace(/\{seasonStats\.map\(season => \([\s\S]*?<\/div>\s*<\/div>\s*\)\)\}/g, (match) => {
  return match.replace(/<div className="space-y-3">/, 
    `<div className="space-y-3">\n                  <div className="flex justify-between items-end border-b border-white/5 pb-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Trips</span>\n                    <span className="text-sm font-bold">{season.count} <span className="text-[10px] opacity-60 text-white">({Math.round((season.count / filteredTrips.length) * 100)}%)</span></span>\n                  </div>`
  );
});

code = code.replace(/\{categoryStats\.map\(cat => \([\s\S]*?<\/div>\s*<\/div>\s*\)\)\}/g, (match) => {
  return match.replace(/<div className="space-y-3">/, 
    `<div className="space-y-3">\n                  <div className="flex justify-between items-end border-b border-white/5 pb-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Trips</span>\n                    <span className="text-sm font-bold">{cat.count} <span className="text-[10px] opacity-60 text-white">({Math.round((cat.count / filteredTrips.length) * 100)}%)</span></span>\n                  </div>`
  );
});

code = code.replace(/\{speedStats\.map\(speed => \([\s\S]*?<\/div>\s*<\/div>\s*\)\)\}/g, (match) => {
  return match.replace(/<div className="space-y-3">/, 
    `<div className="space-y-3">\n                  <div className="flex justify-between items-end border-b border-white/5 pb-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Trips</span>\n                    <span className="text-sm font-bold">{speed.count} <span className="text-[10px] opacity-60 text-white">({Math.round((speed.count / filteredTrips.length) * 100)}%)</span></span>\n                  </div>`
  );
});

code = code.replace(/\{payloadStats\.map\(payload => \([\s\S]*?<\/div>\s*<\/div>\s*\)\)\}/g, (match) => {
  return match.replace(/<div className="space-y-3">/, 
    `<div className="space-y-3">\n                  <div className="flex justify-between items-end border-b border-white/5 pb-2">\n                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">Trips</span>\n                    <span className="text-sm font-bold">{payload.count} <span className="text-[10px] opacity-60 text-white">({Math.round((payload.count / filteredTrips.length) * 100)}%)</span></span>\n                  </div>`
  );
});

fs.writeFileSync('src/components/AnalyticsTab.tsx', code);
