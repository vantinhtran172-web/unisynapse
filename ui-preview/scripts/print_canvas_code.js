const fs = require('fs');
const html = fs.readFileSync('c:/Users/TGDD/Downloads/unisynapse/UniSynapse_ChuaCoChucNang/index.html', 'utf8');
console.log(html.slice(163850, 168000));
