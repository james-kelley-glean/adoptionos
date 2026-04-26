const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const artifactPath = path.join(root, 'dist', 'glean_adoption_os.html');

function escapeSrcdoc(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  if (!fs.existsSync(artifactPath)) {
    throw new Error('Missing dist/glean_adoption_os.html. Run npm run build first.');
  }

  const artifactHtml = fs.readFileSync(artifactPath, 'utf8');
  const hostHtml = `<!DOCTYPE html>
    <html>
      <body style="margin:0">
        <iframe
          id="glean-canvas"
          sandbox="allow-scripts"
          style="width:1440px;height:1200px;border:0"
          srcdoc="${escapeSrcdoc(artifactHtml)}"></iframe>
      </body>
    </html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  try {
    // Parent: wait for the outer document. Child srcdoc: wait for 'load' so inline boot
    // (renderAll) has run; static panels like #strategicActionPanel can appear before
    // the bottom script, so we must not advance on those alone.
    await page.setContent(hostHtml, { waitUntil: 'load' });
    const frameHandle = await page.waitForSelector('#glean-canvas');
    const frame = await frameHandle.contentFrame();
    assert(frame, 'Glean Canvas iframe did not load');
    await frame.waitForLoadState('load');
    // Empty portfolio still gets one tr from renderPortfolio; this gates boot completion.
    await frame.waitForSelector('#portfolioTableBody tr', { state: 'attached', timeout: 60_000 });

    await frame.waitForSelector('#strategicActionPanel', { state: 'visible' });
    await frame.waitForSelector('#phaseBackbonePanel', { state: 'visible' });
    assert(await frame.locator('.tab.active').textContent() === 'Overview', 'Overview tab should render first');

    await frame.locator('[data-tab="portfolio"]').click();
    await frame.waitForSelector('#portfolio.active', { state: 'visible' });

    await frame.locator('#rosterClientList input[type="checkbox"]').first().check();
    await frame.locator('#confirmRosterBtn').click();
    await frame.waitForSelector('#portfolioTableBody tr', { state: 'attached', timeout: 60_000 });

    const payload = '<img src=x onerror="window.__adoptionOsXss=1">';
    await frame.locator('#missingClientInput').fill(payload);
    await frame.locator('#addMissingClientBtn').click();
    await frame.waitForTimeout(100);

    const xssFlag = await frame.evaluate(() => window.__adoptionOsXss);
    const injectedImages = await frame.locator('#rosterClientList img, #portfolioTableBody img').count();
    const escapedPayloadVisible = await frame.locator('#rosterClientList').textContent();
    assert(!xssFlag, 'Manual roster input executed script');
    assert(injectedImages === 0, 'Manual roster input created an HTML image element');
    assert(escapedPayloadVisible.includes(payload), 'Manual roster input should render as text');

    await frame.locator('[data-tab="tools"]').click();
    await frame.waitForSelector('#tools.active', { state: 'visible' });
    assert(await frame.locator('#toolsGrid .tool-card').count() > 0, 'Tools tab did not render tool cards');

    console.log('PASS iframe smoke test');
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(`FAIL iframe smoke test: ${error.message}`);
  process.exit(1);
});
