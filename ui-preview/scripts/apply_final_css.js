const fs = require('fs');

const cssPath = 'c:/Users/TGDD/Downloads/unisynapse/ui-preview/src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Update gutter
css = css.replace(/--preview-gutter:[^;]+;/i, '--preview-gutter: clamp(14px, 1.5vw, 22px);');

// Clean out existing canvas rules
css = css.replace(/\/\* ── GLOBAL NET CANVAS FULL-PAGE COVERAGE ── \*\/[\s\S]*?(?=\/\*|\Z)/g, '');

const additionalCss = `
/* ── GLOBAL NET CANVAS FULL-PAGE COVERAGE ── */
#global-net-canvas {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  pointer-events: none !important;
  z-index: 1 !important;
  opacity: 1 !important;
}

html.light #global-net-canvas {
  opacity: 1 !important;
}

/* Translucent glassmorphism so canvas particles shine through all the way to footer */
.preview-stat,
.preview-challenge,
.preview-workspace,
.preview-doc-card,
.preview-auth-banner {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

html.light .preview-stat,
html.light .preview-challenge,
html.light .preview-workspace,
html.light .preview-doc-card,
html.light .preview-auth-banner {
  background: rgba(255, 255, 255, 0.72) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

html:not(.light) .preview-stat,
html:not(.light) .preview-challenge,
html:not(.light) .preview-workspace,
html:not(.light) .preview-doc-card,
html:not(.light) .preview-auth-banner {
  background: rgba(18, 28, 50, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.preview-footer {
  position: relative;
  z-index: 2;
  background: transparent !important;
}
`;

css += additionalCss;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated globals.css!');
