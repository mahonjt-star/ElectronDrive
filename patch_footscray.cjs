const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

code = code.replace(
  "const homeLoc = '4 Elphinstone Street West footscray';",
  "const homeLoc = 'West Footscray';"
);

// We should also force the script to run one more time if it already thinks it's done. 
// Right now it checks: if (trip1.weather?.end?.lat === -37.798174 && trip1.weather?.end?.locationName === 'Fitzroy') return;
// We can change that to check if the START location of trip1 is correct too.
code = code.replace(
  "if (trip1.weather?.end?.lat === -37.798174 && trip1.weather?.end?.locationName === 'Fitzroy') return;",
  "if (trip1.weather?.end?.lat === -37.798174 && trip1.weather?.end?.locationName === 'Fitzroy' && trip1.weather?.start?.locationName === 'West Footscray') return;"
);

fs.writeFileSync('src/components/HistoryTab.tsx', code);
