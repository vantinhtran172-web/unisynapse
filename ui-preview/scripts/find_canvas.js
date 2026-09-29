const fs = require('fs');
const html = fs.readFileSync('c:/Users/TGDD/Downloads/unisynapse/UniSynapse_ChuaCoChucNang/index.html', 'utf8');
const search = 'global-net-canvas';
let pos = 0;
while (true) {
  const idx = html.indexOf(search, pos);
  if (idx === -1) break;
  console.log(`\n=== Match at ${idx} ===`);
  console.log(html.slice(Math.max(0, idx - 80), Math.min(html.length, idx + 400)));
  pos = idx + search.length;
}
