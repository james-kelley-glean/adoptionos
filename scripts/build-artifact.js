const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'src', 'glean_adoption_os.html');
const distPath = path.join(root, 'dist', 'glean_adoption_os.html');

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Missing source artifact: ${sourcePath}`);
}

fs.mkdirSync(path.dirname(distPath), { recursive: true });
fs.copyFileSync(sourcePath, distPath);

const bytes = fs.statSync(distPath).size;
console.log(`Built ${path.relative(root, distPath)} (${bytes.toLocaleString()} bytes)`);
