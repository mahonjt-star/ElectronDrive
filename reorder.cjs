const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsTab.tsx', 'utf8');

const categoryRegex = /(?:\s*)\{categoryStats\.length > 0 && \(\s*<div className="space-y-4">[\s\S]*?<\/div>\s*\)\}/;
const categoryMatch = code.match(categoryRegex);

const seasonRegex = /(?:\s*)\{seasonStats\.length > 0 && \(\s*<div className="space-y-4">[\s\S]*?<\/div>\s*\)\}/;
const seasonMatch = code.match(seasonRegex);

if (categoryMatch && seasonMatch) {
  // modify season block grid cols
  let seasonBlock = seasonMatch[0].replace('lg:grid-cols-3', 'lg:grid-cols-4');
  
  // replace categoryBlock position with seasonBlock + categoryBlock
  code = code.replace(categoryMatch[0], seasonBlock + categoryMatch[0]);
  
  // replace original seasonBlock position with empty string
  code = code.replace(seasonMatch[0], '');
  
  fs.writeFileSync('src/components/AnalyticsTab.tsx', code);
  console.log('Reordered successfully');
} else {
  console.log('Could not find matches');
}
