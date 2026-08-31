const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

const regex = /  useEffect\(\) => \{\n    if \(!trips \|\| trips\.length === 0\) return;\n    \n      useEffect\(\) => \{\n    if \(!trips \|\| trips\.length === 0\) return;\n    \n      useEffect\(\) => \{\n    if \(!trips \|\| trips\.length === 0\) return;\n/g;

// I will just use string replacement on a chunk of text
const targetChunk = `  useEffect(() => {
    if (!trips || trips.length === 0) return;
    
      useEffect(() => {
    if (!trips || trips.length === 0) return;
    
      useEffect(() => {
    if (!trips || trips.length === 0) return;`;

const newChunk = `  useEffect(() => {
    if (!trips || trips.length === 0) return;`;

code = code.replace(targetChunk, newChunk);
fs.writeFileSync('src/components/HistoryTab.tsx', code);
