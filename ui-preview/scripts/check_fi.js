const fs = require('fs');
const html = fs.readFileSync('c:/Users/TGDD/Downloads/unisynapse/UniSynapse_ChuaCoChucNang/index.html', 'utf8');

// search for intersection observer or fade-in in script
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
console.log('Script count:', scripts ? scripts.length : 0);
if (scripts) {
  scripts.forEach((s, idx) => {
    if (s.includes('IntersectionObserver') || s.includes('opacity') || s.includes('.fi') || s.includes('active')) {
      console.log(`Script ${idx} has observers/classes`);
    }
  });
}

// Check css for .fi or opacity:0
const style = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i)[1];
const fiMatch = style.match(/\.fi\s*\{[^}]*\}/g);
console.log('.fi rules:', fiMatch);
