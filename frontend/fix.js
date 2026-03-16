const fs = require('fs');
let c;
try {
    c = fs.readFileSync('src/pages/Home.tsx', 'utf16le');
    if (!c.includes('import')) {
        c = fs.readFileSync('src/pages/Home.tsx', 'utf8');
    }
} catch (e) {
    c = fs.readFileSync('src/pages/Home.tsx', 'utf8');
}
c = c.replace(/\.\.\/assets\/logos\/logos/g, '../assets/logos');
c = c.replace(/\.\.\/assets\/logos\.tsx/g, '../assets/logos');

fs.writeFileSync('src/pages/Home.tsx', c, 'utf8');
console.log('Fixed Home.tsx');
