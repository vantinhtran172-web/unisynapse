const fs = require('fs');
const html = fs.readFileSync('c:/Users/TGDD/Downloads/unisynapse/UniSynapse_ChuaCoChucNang/index.html', 'utf8');

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (bodyMatch) {
  const body = bodyMatch[1];
  // Find all opening tags at top level
  const regex = /<([a-z0-9]+)(\s+id="([^"]+)")?(\s+class="([^"]+)")?[^>]*>/gi;
  let match;
  while ((match = regex.exec(body)) !== null) {
    const tag = match[1];
    const id = match[3] || '';
    const cls = match[5] || '';
    if (['header', 'section', 'footer', 'main'].includes(tag) || (tag === 'div' && (cls.includes('container') || cls.includes('row') || cls.includes('studio') || cls.includes('grid')))) {
      console.log(`<${tag} id="${id}" class="${cls}">`);
    }
  }
}
