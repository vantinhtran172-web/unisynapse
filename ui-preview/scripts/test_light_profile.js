const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const userDir = 'C:\\Users\\TGDD\\.gemini\\antigravity-ide\\brain\\fc40d5b1-aa54-4bdf-aa86-3f46ed92790b\\edge_profile';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outPath = 'C:\\Users\\TGDD\\.gemini\\antigravity-ide\\brain\\fc40d5b1-aa54-4bdf-aa86-3f46ed92790b\\light_mode_verified.png';

// 1. First run: Set localStorage on localhost:3001
const setScriptHtml = 'C:\\Users\\TGDD\\.gemini\\antigravity-ide\\brain\\fc40d5b1-aa54-4bdf-aa86-3f46ed92790b\\set_light.html';
fs.writeFileSync(setScriptHtml, `<!DOCTYPE html><html><body><script>
localStorage.setItem('unisynapse_theme', 'light');
location.href = 'http://localhost:3001/';
</script></body></html>`, 'utf8');

// Launch edge to load localhost:3001 with 1904x850
const args = [
  '--headless',
  '--disable-gpu',
  '--window-size=1904,850',
  '--user-data-dir=' + userDir,
  '--screenshot=' + outPath,
  'http://localhost:3001/'
];

// In layout.tsx or url query, can we also support ?theme=light?
// That would make testing and viewing light mode instant!
spawnSync(edgePath, args, { stdio: 'inherit' });
console.log('Light mode screenshot exists:', fs.existsSync(outPath), 'Size:', fs.existsSync(outPath) ? fs.statSync(outPath).size : 0);
