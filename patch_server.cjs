const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "headers: { 'User-Agent': 'AI-Studio-Electron-App' }",
  "headers: { 'User-Agent': 'EV-Trip-Logger-App/1.0 (mahonjt@gmail.com)' }"
);

fs.writeFileSync('server.ts', code);
