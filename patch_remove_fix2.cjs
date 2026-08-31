const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

const startIdx = code.indexOf('  useEffect(() => {\n    if (!trips || trips.length === 0) return;\n    const runFix');
if (startIdx !== -1) {
    const endIdxStr = '    runFix();\n  }, [trips]);\n';
    const endIdx = code.indexOf(endIdxStr, startIdx);
    if (endIdx !== -1) {
       code = code.substring(0, startIdx) + code.substring(endIdx + endIdxStr.length);
       fs.writeFileSync('src/components/HistoryTab.tsx', code);
       console.log("Success");
    } else {
       console.log("End not found");
    }
} else {
    console.log("Start not found");
}
