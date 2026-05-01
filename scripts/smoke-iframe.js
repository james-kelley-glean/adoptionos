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
    assert(await frame.locator('#overviewCurrentStatePanel').isVisible(), 'Overview should render Current State panel');
    assert(await frame.locator('#overviewRecentActionsPanel').isVisible(), 'Overview should render Last 10 actions panel');
    assert(await frame.locator('#overviewPriorityActions .overview-action-card').count() === 3, 'Overview should render three priority actions');
    assert(await frame.locator('#overviewActivityTimeline .activity-node').count() === 10, 'Overview should render last 10 actions as a visual timeline');
    assert(await frame.locator('#overviewChangeStrip .change-tile').count() >= 4, 'Overview should render visual changed-since-last-read strip');
    assert(await frame.locator('[data-overview-open-task]').count() === 3, 'Overview actions should route into Tasks instead of owning completion state');
    await frame.locator('[data-overview-open-task]').first().click();
    await frame.waitForSelector('#tasks.active', { state: 'visible' });
    assert(await frame.locator('#taskKanbanBoard .task-card').count() > 0, 'Tasks tab should render task cards');
    assert(await frame.locator('#taskKanbanBoard .task-chip').count() > 0, 'Task cards should expose type, freshness, and completion-check chips');
    assert(await frame.locator('#taskSummaryGrid').textContent().then(text => text.includes('Check freshness')), 'Task summary should surface completion/source review needs');
    assert(await frame.locator('#taskKanbanBoard [data-task-status]').count() > 0, 'Tasks tab should own task state controls');
    await frame.locator('#taskKanbanBoard [data-task-status][data-next-status="done"]').first().click();
    assert(await frame.locator('#taskKanbanBoard .task-column').last().textContent().then(text => text.includes('Done') || text.includes('closed')), 'Tasks tab should move tasks to Done / closed');
    await frame.locator('[data-tab="overview"]').click();
    await frame.waitForSelector('#overview.active', { state: 'visible' });
    const motionState = await frame.evaluate(() => ({
      title: document.querySelector('#phaseMotionTitle')?.textContent || '',
      cta: document.querySelector('#openMotionWorkspaceBtn')?.textContent || '',
      actions: document.querySelectorAll('[data-motion-action]').length
    }));
    assert(motionState.title.length > 0, 'missing recommended motion title');
    assert(motionState.cta === 'Run recommended motion', 'missing recommended motion CTA');
    assert(await frame.locator('[data-overview-card-action]').count() === 4, 'expected four clickable Account Read cards');
    await frame.locator('[data-overview-card-action="readiness"]').click();
    await frame.waitForSelector('#motionWorkspaceOverlay.open', { state: 'visible' });
    assert(await frame.locator('#motionWorkspaceOverlay [data-motion-action]').count() === 4, 'expected four phase motion actions in Motion Workspace');
    await frame.locator('#closeMotionWorkspaceBtn').click();
    await frame.waitForSelector('#motionWorkspaceOverlay.open', { state: 'hidden' });
    await frame.locator('[data-overview-card-action="risk"]').click();
    await frame.waitForSelector('#clientHealth.active', { state: 'visible' });
    await frame.locator('[data-tab="overview"]').click();
    await frame.waitForSelector('#overview.active', { state: 'visible' });
    assert(await frame.locator('#accountEvidencePanel').isHidden(), 'Evidence should be tucked behind operating context by default');
    assert(await frame.locator('#phaseBackbonePanel').isHidden(), 'Phase backbone should be tucked behind operating context by default');
    await frame.locator('#overviewSecondaryDetails').evaluate(details => { details.open = true; });
    await frame.waitForSelector('.account-details-guide', { state: 'visible' });
    assert(await frame.locator('.account-details-guide').textContent().then(text => text.includes('Account Context') && text.includes('Need evidence?') && text.includes('Need an asset or agent?')), 'Account Context should route repeated widgets to their correct tabs');
    assert(await frame.locator('[data-context-route="health"]').count() === 1, 'Account Context should include a Client Health route');
    assert(await frame.locator('[data-context-route="tasks"]').count() === 1, 'Account Context should include a Tasks route');
    await frame.locator('[data-context-route="tasks"]').click();
    await frame.waitForSelector('#tasks.active', { state: 'visible' });
    assert(await frame.locator('#taskKanbanBoard .task-card').count() > 0, 'Task route should open the task board');
    await frame.locator('[data-tab="clientHealth"]').click();
    await frame.waitForSelector('#clientHealth.active', { state: 'visible' });
    assert(await frame.locator('#sourceGrid .source-card').count() > 0, 'Client Health should render source registry');
    assert(await frame.locator('#platformHealthGrid .risk-card').count() > 0, 'Client Health should render platform and Prism health');
    await frame.locator('[data-tab="overview"]').click();
    await frame.waitForSelector('#overview.active', { state: 'visible' });
    await frame.locator('#overviewSecondaryDetails').evaluate(details => { details.open = true; });
    await frame.waitForSelector('.account-details-guide', { state: 'visible' });
    assert(await frame.locator('#accountEvidencePanel').isHidden(), 'Evidence should stay out of visible Account Details');
    assert(await frame.locator('#taskOwnershipPanel').count() === 0, 'Task ownership panel should be removed from Account Details');
    assert(await frame.locator('#accountHealthOverlayPanel').isHidden(), 'Health overlay should stay out of visible Account Details');
    await frame.waitForSelector('#phaseBackbonePanel', { state: 'visible' });
    await frame.waitForSelector('#accountPlanPanel', { state: 'visible' });
    await frame.waitForSelector('#packagePosturePanel', { state: 'visible' });
    await frame.waitForSelector('#topWorkflowsPanel', { state: 'visible' });
    await frame.waitForSelector('#seatDistributionPanel', { state: 'visible' });
    assert(await frame.locator('.tab.active').textContent() === 'Overview', 'Overview tab should render first');

    await frame.locator('#clientSelect').selectOption('__portfolio__');
    await frame.waitForSelector('#portfolio.active', { state: 'visible' });
    assert(await frame.locator('#clientSelect option:checked').textContent() === 'My Portfolio', 'Portfolio should open from account dropdown');

    await frame.locator('#rosterClientList input[type="checkbox"]').first().check();
    await frame.locator('#confirmRosterBtn').click();
    await frame.waitForSelector('#portfolioTableBody tr', { state: 'attached', timeout: 60_000 });
    assert(await frame.locator('#globalAdoptionReviewPanel').isVisible(), 'Portfolio should render Global Adoption Review');
    assert(await frame.locator('#globalAdoptionSummaryGrid .global-review-summary-card').count() === 5, 'Global Adoption Review should render five fixed summary buckets');
    assert(await frame.locator('#globalAdoptionAccountGrid .global-review-account-card').count() > 0, 'Global Adoption Review should render account operator rows');
    assert(await frame.locator('#globalAdoptionAccountGrid svg.trend-chart').count() > 0, 'Global Adoption Review should preserve trend line graphs');
    assert(await frame.locator('#globalAdoptionAccountGrid .adoption-bar').count() > 0, 'Global Adoption Review should render adoption bars');

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

    await frame.locator('[data-tab="clientHealth"]').click();
    await frame.waitForSelector('#clientHealth.active', { state: 'visible' });
    assert(await frame.locator('#clientHealthUsageGrid .health-driver').count() >= 4, 'Client Health did not render health drivers');
    assert(await frame.locator('#clientHealthWorryList .health-read-card').count() > 0, 'Client Health did not render the health read');
    assert(await frame.locator('#prismInlineSignalList .evidence-card').count() >= 3, 'Client Health did not render evidence signals');

    await frame.locator('[data-tab="contacts"]').click();
    await frame.waitForSelector('#contacts.active', { state: 'visible' });
    assert(await frame.locator('#contactMapPanel').isVisible(), 'Contacts tab did not render contact map');
    assert(await frame.locator('#contactMapList .list-item').count() > 0, 'Contacts tab did not render contacts');

    await frame.locator('[data-tab="phaseResources"]').click();
    await frame.waitForSelector('#phaseResources.active', { state: 'visible' });
    assert(await frame.locator('#templateRecommendedGrid .template-card').count() > 0, 'Phase Resources did not render recommended resources');
    assert(await frame.locator('#templateSupportingGrid .template-card').count() > 0, 'Phase Resources did not render supporting resources');
    await frame.locator('#phaseResources details > summary').click();
    await frame.waitForSelector('#templateMoreGrid .template-card', { state: 'visible' });
    assert(await frame.locator('#templateSourceGapsList li').count() > 0, 'Phase Resources did not render source catalog gaps');
    assert(await frame.locator('#toolsGrid .tool-card').count() > 0, 'Phase Resources did not render tool cards');
    const firstToolCardText = await frame.locator('#toolsGrid .tool-card').first().textContent();
    assert(firstToolCardText.includes('Recommended') && firstToolCardText.includes('Client Adoption Strategy Chatbot'), 'Phase Resources should pin recommended tools to the top');

    await frame.locator('[data-tab="fluency"]').click();
    await frame.waitForSelector('#fluency.active', { state: 'visible' });
    assert(await frame.locator('#fluencyHeroBadgeValue').textContent(), 'AI Fluency tab did not render');

    console.log('PASS iframe smoke test');
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(`FAIL iframe smoke test: ${error.message}`);
  process.exit(1);
});
