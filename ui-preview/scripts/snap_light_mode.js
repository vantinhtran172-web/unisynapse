const { spawnSync } = require('child_process');
const fs = require('fs');

// We can launch Edge with a temporary user data dir and evaluate script or open page
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const topOut = 'C:\\Users\\TGDD\\.gemini\\antigravity-ide\\brain\\fc40d5b1-aa54-4bdf-aa86-3f46ed92790b\\light_mode_top.png';

// Let's create a small wrapper html that loads localhost:3001 in an iframe with light theme or direct URL
const runnerHtmlPath = 'C:\\Users\\TGDD\\.gemini\\antigravity-ide\\brain\\fc40d5b1-aa54-4bdf-aa86-3f46ed92790b\\test_light.html';
const runnerHtml = `<!DOCTYPE html>
<html>
<head>
<style>body,html{margin:0;padding:0;overflow:hidden;width:100%;height:100%;}</style>
</head>
<body>
<iframe id="f" src="http://localhost:3001/" style="width:100vw;height:100vh;border:0;"></iframe>
<script>
const f = document.getElementById('f');
f.onload = () => {
  try {
    f.contentWindow.localStorage.setItem('unisynapse_theme', 'light');
    f.contentDocument.documentElement.classList.add('light');
    f.contentDocument.documentElement.classList.remove('dark');
    f.contentDocument.documentElement.setAttribute('data-theme', 'light');
    // Dispatch mousemove
    const evt = new MouseEvent('mousemove', {
      clientX: 380,
      clientY: 320,
      bubbles: true
    });
    f.contentWindow.dispatchEvent(evt);
  } catch(e) {}
};
</script>
</body>
</html>`;

fs.writeFileSync(runnerHtmlPath, runnerHtml, 'utf8');

const args = [
  '--headless',
  '--disable-gpu',
  '--window-size=1904,850',
  '--screenshot=' + topOut,
  'file:///' + runnerHtmlPath.replace(/\\/g, '/')
];

spawnSync(edgePath, args, { stdio: 'inherit' });
console.log('Top screenshot exists:', fs.existsSync(topOut));
