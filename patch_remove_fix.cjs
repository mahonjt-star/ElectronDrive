const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

const regex = /  useEffect\(\(\) => \{\n    if \(!trips \|\| trips\.length === 0\) return;\n    const runFix = async \(\) => \{[\s\S]*?runFix\(\);\n  \}, \[trips\]\);\n/m;

code = code.replace(regex, '');

fs.writeFileSync('src/components/HistoryTab.tsx', code);
