const { spawnSync } = require('child_process');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const out = spawnSync(edgePath, [
  '--headless',
  '--disable-gpu',
  '--enable-logging=stderr',
  '--v=1',
  'http://localhost:3001/?theme=light'
], { encoding: 'utf8', timeout: 5000 });

console.log('Edge stdout:', out.stdout);
console.log('Edge stderr:', out.stderr);
