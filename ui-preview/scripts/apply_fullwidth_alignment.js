const fs = require('fs');

const cssPath = 'c:/Users/TGDD/Downloads/unisynapse/ui-preview/src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Replace --preview-max-w and --preview-gutter in :root
css = css.replace(
  /--preview-gutter:[^;]+;\s*--preview-max-w:[^;]+;/i,
  '--preview-gutter: clamp(24px, 2.5vw, 48px);\n  --preview-max-w: 100%;'
);

// Ensure #global-net-canvas style is present
if (!css.includes('#global-net-canvas')) {
  css += `
/* Global Neural Network Background Canvas */
#global-net-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  opacity: 0.65;
  transition: opacity 0.3s ease;
}
html.light #global-net-canvas {
  opacity: 0.32;
}
`;
}

// Ensure .preview-shell is relative and sits above the canvas
css = css.replace(
  /\.preview-shell\s*\{[^}]*\}/,
  `.preview-shell {\n  position: relative;\n  z-index: 2;\n  min-height: 100vh;\n  padding-top: 102px;\n  background: transparent;\n  color: var(--preview-text);\n}`
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated globals.css with full-width alignment and background canvas!');
