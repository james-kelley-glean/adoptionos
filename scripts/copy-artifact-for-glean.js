const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const artifactPath = path.join(root, 'dist', 'glean_adoption_os.html');

if (!fs.existsSync(artifactPath)) {
  console.error('Missing dist/glean_adoption_os.html. Run npm run build first.');
  process.exit(1);
}

const html = fs.readFileSync(artifactPath, 'utf8');
const prompt = `Create interactive content from the HTML below.

Use the HTML exactly as provided. Do not rewrite the product, remove JavaScript, add external dependencies, add network calls, add iframes, or convert this into a document. This is a single-file Glean interactive artifact for testing the Glean Adoption OS with seeded account data.

After rendering, I should be able to test:
- Overview strategic action
- Adoption OS phase backbone
- Portfolio roster verification
- Add missing client
- Tools and recommended Glean resource cards
- Prism health and capture workspace

HTML:

\`\`\`html
${html}
\`\`\`
`;

if (process.platform !== 'darwin') {
  console.log(prompt);
  console.error('Clipboard copy is only automated on macOS. Printed prompt instead.');
  process.exit(0);
}

const result = spawnSync('pbcopy', { input: prompt, encoding: 'utf8' });
if (result.status !== 0) {
  console.error(result.stderr || 'Failed to copy prompt to clipboard.');
  process.exit(result.status || 1);
}

console.log(`Copied Glean Canvas prompt + artifact HTML to clipboard (${prompt.length.toLocaleString()} chars).`);
