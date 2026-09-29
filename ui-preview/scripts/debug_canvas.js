const { spawnSync } = require('child_process');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const inspectHtml = 'C:\\Users\\TGDD\\.gemini\\antigravity-ide\\brain\\fc40d5b1-aa54-4bdf-aa86-3f46ed92790b\\inspect_canvas.html';

const html = `<!DOCTYPE html>
<html>
<body>
<iframe id="f" src="http://localhost:3001/?theme=light" style="width:1000px;height:700px;"></iframe>
<pre id="out"></pre>
<script>
window.onload = () => {
  setTimeout(() => {
    try {
      const doc = document.getElementById('f').contentDocument;
      const cvs = doc.getElementById('global-net-canvas');
      const res = {
        canvasFound: !!cvs,
        width: cvs ? cvs.width : null,
        height: cvs ? cvs.height : null,
        styleWidth: cvs ? cvs.style.width : null,
        styleHeight: cvs ? cvs.style.height : null,
        zIndex: cvs ? getComputedStyle(cvs).zIndex : null,
        opacity: cvs ? getComputedStyle(cvs).opacity : null,
        display: cvs ? getComputedStyle(cvs).display : null,
        bodyBg: getComputedStyle(doc.body).background,
        shellBg: doc.querySelector('.preview-shell') ? getComputedStyle(doc.querySelector('.preview-shell')).background : null,
        containerBg: doc.querySelector('.preview-container') ? getComputedStyle(doc.querySelector('.preview-container')).background : null,
        htmlClass: doc.documentElement.className,
      };
      document.getElementById('out').textContent = JSON.stringify(res, null, 2);
      console.log('RESULT:' + JSON.stringify(res));
    } catch(e) {
      document.getElementById('out').textContent = 'Error: ' + e.message;
    }
  }, 1500);
};
</script>
</body>
</html>`;

fs.writeFileSync(inspectHtml, html, 'utf8');

const out = spawnSync(edgePath, [
  '--headless',
  '--disable-gpu',
  '--dump-dom',
  'file:///' + inspectHtml.replace(/\\/g, '/')
], { encoding: 'utf8' });

console.log('Inspect output:\n', out.stdout.slice(out.stdout.indexOf('<pre id="out">')));
