const fs = require('fs');
const code = fs.readFileSync('src/components/HistoryTab.tsx', 'utf8');

let stack = [];
for (let i = 0; i < code.length; i++) {
  if (code[i] === '(') stack.push({ char: '(', line: code.substring(0, i).split('\n').length });
  if (code[i] === ')') {
     if (stack.length === 0) { console.log('Extra ) at line', code.substring(0, i).split('\n').length); }
     else { stack.pop(); }
  }
}
console.log("Unclosed ( at lines:", stack.map(x => x.line));
