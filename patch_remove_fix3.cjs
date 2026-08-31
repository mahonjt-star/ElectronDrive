const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

const runFixStart = code.indexOf('const runFix = async () => {');
if (runFixStart !== -1) {
    // Find the enclosing useEffect
    const useEffectStart = code.lastIndexOf('  useEffect(() => {', runFixStart);
    const endStr = '    runFix();\n  }, [trips]);\n';
    const endIdx = code.indexOf(endStr, runFixStart);
    if (useEffectStart !== -1 && endIdx !== -1) {
        code = code.substring(0, useEffectStart) + code.substring(endIdx + endStr.length);
        fs.writeFileSync('src/components/HistoryTab.tsx', code);
        console.log("Success");
    } else {
        console.log("Could not find boundaries");
    }
} else {
    console.log("Not found");
}
