const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const artifactPath = path.join(root, 'dist', 'glean_adoption_os.html');
const dataLayerDocPath = path.join(root, 'docs', 'v1-data-layer.md');
const orchestrationConfigPath = path.join(root, 'orchestration', 'slices.json');
const orchestrationReadmePath = path.join(root, 'orchestration', 'README.md');
const orchestratorScriptPath = path.join(root, 'scripts', 'orchestrate-slices.js');
const sliceAgentRunnerPath = path.join(root, 'integrations', 'openai-agents', 'run-slice-orchestrator.mjs');
const packageJsonPath = path.join(root, 'package.json');

function pass(label) {
  console.log(`PASS ${label}`);
}

function fail(label, detail) {
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ''}`);
  process.exitCode = 1;
}

if (!fs.existsSync(artifactPath)) {
  fail('artifact exists', 'run npm run build first');
  process.exit(1);
}

const html = fs.readFileSync(artifactPath, 'utf8');
const dataLayerDoc = fs.existsSync(dataLayerDocPath) ? fs.readFileSync(dataLayerDocPath, 'utf8') : '';
const orchestrationConfig = fs.existsSync(orchestrationConfigPath) ? fs.readFileSync(orchestrationConfigPath, 'utf8') : '';
const orchestrationReadme = fs.existsSync(orchestrationReadmePath) ? fs.readFileSync(orchestrationReadmePath, 'utf8') : '';
const packageJson = fs.existsSync(packageJsonPath) ? fs.readFileSync(packageJsonPath, 'utf8') : '';

const checks = [
  ['starts with doctype', html.startsWith('<!DOCTYPE html>')],
  ['ends with html close', html.trimEnd().endsWith('</html>')],
  ['no CDATA wrapper', !html.includes('<![CDATA[') && !html.includes(']]>')],
  ['no artifact wrapper residue', !html.includes('</artifact>') && !html.includes('artifact_edit')],
  ['GleanBridge is runtime guarded', html.includes('if (window.GleanBridge && typeof window.GleanBridge.postMessage') && html.includes("typeof window.GleanBridge.onMessage === 'function'")],
  ['Prism inline workspace is rendered', html.includes('renderPrismWorkspace(account);')],
  ['AI Fluency future placeholder is present', html.includes('AI Fluency layer') && html.includes('Q2/Q3') && html.includes('not required for V1')],
  ['V1 data layer doc exists', fs.existsSync(dataLayerDocPath)],
  ['V1 data layer doc keeps Glean product constraint', dataLayerDoc.includes('inside the Glean product')],
  ['artifact includes data layer model', html.includes('Adoption OS Intelligence data layer')],
  ['artifact includes what-was/is/could-be spine', html.includes('what_was') && html.includes('what_is') && html.includes('what_could_be')],
  ['artifact includes strategic action fields', html.includes('strategicAction') && html.includes('bestNextStep')],
  ['artifact includes expanded strategic fields', html.includes('decisionOwner') && html.includes('targetFunction') && html.includes('confidenceReason') && html.includes('actionOutcome') && html.includes('primaryFrictionType') && html.includes('packageEntitlements') && html.includes('supportingSources')],
  ['artifact renders strategic action UI fields', html.includes('id="strategicAction"') && html.includes('id="strategicRationale"') && html.includes('id="bestNextStep"') && html.includes('id="decisionOwner"') && html.includes('id="targetFunction"') && html.includes('id="primaryFrictionType"') && html.includes('id="capturePrompt"')],
  ['strategic action panel is first overview surface', html.indexOf('id="strategicActionPanel"') > -1 && html.indexOf('id="strategicActionPanel"') < html.indexOf('id="phaseBackbonePanel"')],
  ['artifact uses AIOM-native action language', html.includes('Strategic action') && html.includes('Best next step') && html.includes('Why this matters') && html.includes('Recommended Glean resource') && html.includes('What to capture in Prism')],
  ['artifact includes Prism health input fields', html.includes('prismHealthSignal') && html.includes('prismRiskPattern') && html.includes('priorActionOutcome') && html.includes('repeatedBlocker') && html.includes('momentumSinceLastTouch') && html.includes('recommendedPlayFromHistory') && html.includes('healthImpact')],
  ['artifact renders Prism health input UI', html.includes('id="prismHealthInputPanel"') && html.includes('id="prismHealthSignal"') && html.includes('id="prismRiskPattern"') && html.includes('id="priorActionOutcome"') && html.includes('id="repeatedBlocker"') && html.includes('id="momentumSinceLastTouch"') && html.includes('id="recommendedPlayFromHistory"') && html.includes('id="healthImpact"')],
  ['artifact renders Prism outcome capture fields', html.includes('id="prismActionTakenInput"') && html.includes('id="prismActionOutcomeInput"') && html.includes('id="prismRemainingBlockerInput"') && html.includes('id="prismCommitmentsInput"') && html.includes('id="prismWorkedInput"') && html.includes('id="prismDidNotWorkInput"') && html.includes('id="prismRecommendedFollowupInput"')],
  ['artifact explains Prism copy/save loop', html.includes('Copy into Prism') && html.includes('Action taken') && html.includes('Action outcome') && html.includes('Remaining blocker') && html.includes('Owner/date commitments') && html.includes('What worked') && html.includes('What did not work') && html.includes('Recommended follow-up')],
  ['artifact includes resource catalog mapping', html.includes('resourceCatalog') && html.includes('getRecommendedResource(account)') && html.includes('AIOM Account Ramp Companion') && html.includes('Meeting Summarizer + Follow Up') && html.includes('Optimal Agent Use Case Recommender')],
  ['artifact resource fallback copies instructions', html.includes("type: 'copy'") && html.includes("type: 'link-copy'") && html.includes('Copy resource prompt') && html.includes('No direct launch is available')],
  ['artifact copy fallback remains recoverable', html.includes('function copyWithPromptFallback') && html.includes("navigator.clipboard && typeof navigator.clipboard.writeText === 'function'") && html.includes("window.prompt('Copy this prompt:', text)")],
  ['V1 data layer doc includes expanded strategic fields', dataLayerDoc.includes('decisionOwner') && dataLayerDoc.includes('targetFunction') && dataLayerDoc.includes('confidenceReason') && dataLayerDoc.includes('actionOutcome') && dataLayerDoc.includes('primaryFrictionType') && dataLayerDoc.includes('packageEntitlements') && dataLayerDoc.includes('supportingSources')],
  ['V1 data layer doc includes Prism memory and health loop', dataLayerDoc.includes('Prism Memory + Health Loop') && dataLayerDoc.includes('prismHealthSignal') && dataLayerDoc.includes('prismRiskPattern') && dataLayerDoc.includes('priorActionOutcome') && dataLayerDoc.includes('repeatedBlocker') && dataLayerDoc.includes('momentumSinceLastTouch') && dataLayerDoc.includes('recommendedPlayFromHistory') && dataLayerDoc.includes('healthImpact')],
  ['V1 data layer doc includes Prism outcome capture fields', dataLayerDoc.includes('actionTaken') && dataLayerDoc.includes('actionOutcome') && dataLayerDoc.includes('remainingBlocker') && dataLayerDoc.includes('ownerDateCommitments') && dataLayerDoc.includes('whatWorked') && dataLayerDoc.includes('whatDidNotWork') && dataLayerDoc.includes('recommendedFollowup')],
  ['V1 data layer doc includes action resource behavior', dataLayerDoc.includes('Resource Catalog') && dataLayerDoc.includes('AIOM Account Ramp Companion') && dataLayerDoc.includes('Missing direct URLs must degrade to copyable prompt behavior')],
  ['artifact includes aggregation status model', html.includes('sourceCoverageStatus') && html.includes('missingSources') && html.includes('buildSourceCoverageStatus') && html.includes('getMissingSources(account)')],
  ['artifact includes required source categories', html.includes('Salesforce') && html.includes('AIOM Staffing Sheet') && html.includes('Rocketlane') && html.includes('Sigma') && html.includes('Slack') && html.includes('Gong/meetings') && html.includes('Docs/Drive') && html.includes('Prism')],
  ['artifact includes source coverage UI', html.includes('source categories available') && html.includes('Missing or verification-needed sources') && html.includes('Seeded aggregation status only, not live data')],
  ['artifact includes confidence reason near recommendation', html.includes('id="confidenceReason"') && html.includes('Confidence reason: ${getConfidenceReason(account)}')],
  ['artifact includes provisional and missing source statuses', html.includes("coverage('provisional'") && html.includes("coverage('missing'") && html.includes("coverage('needs verification'")],
  ['artifact avoids seeded availability as live class', !html.includes('pill.live') && html.includes('pill.available')],
  ['V1 data layer doc includes aggregation status layer', dataLayerDoc.includes('Aggregation Status Layer') && dataLayerDoc.includes('sourceCoverageStatus') && dataLayerDoc.includes('missingSources') && dataLayerDoc.includes('Seeded data must be labeled')],
  ['artifact includes roster verification UI', html.includes('id="rosterVerificationPanel"') && html.includes('id="selectAllRosterBtn"') && html.includes('id="confirmRosterBtn"') && html.includes('id="missingClientInput"')],
  ['artifact includes roster verification state model', html.includes('rosterVerification:') && html.includes('verifiedRoster') && html.includes('aggregationStatus') && html.includes('suggestedBy')],
  ['portfolio uses verified roster', html.includes('getVerifiedPortfolioAccounts()') && html.includes('renderRosterVerification()')],
  ['V1 data layer doc includes roster verification', dataLayerDoc.includes('Roster Verification') && dataLayerDoc.includes('verifiedRoster') && dataLayerDoc.includes('aggregationStatus')],
  ['artifact includes software source taxonomy', html.includes('source_taxonomy') && html.includes('systems_of_record') && html.includes('workstream_context') && html.includes('glean_native_intelligence_action')],
  ['V1 data layer doc includes software source taxonomy', dataLayerDoc.includes('Systems Of Record') && dataLayerDoc.includes('Workstream Context') && dataLayerDoc.includes('Glean-Native Intelligence And Action')],
  ['artifact includes phase objective model', html.includes('phaseObjective') && html.includes('currentMilestone')],
  ['artifact includes open adoption activities model', html.includes('openAdoptionActivities') && html.includes('overdueAdoptionActivities')],
  ['artifact includes phase assets model', html.includes('phaseAssets')],
  ['artifact includes function-level phase status model', html.includes('functionPhaseStatus')],
  ['artifact renders phase backbone overview', html.includes('id="phaseBackbonePanel"') && html.includes('id="phaseObjective"') && html.includes('id="openActivitiesList"') && html.includes('id="overdueActivitiesList"') && html.includes('id="phaseAssetsList"') && html.includes('id="functionPhaseStatusList"')],
  ['artifact preserves open and overdue activity semantics', html.includes('ui.overdueActivitiesList') && html.includes('${openActivities.length} open · ${overdueActivities.length} overdue') && html.includes('No overdue Adoption OS activities')],
  ['V1 data layer doc includes phase backbone fields', dataLayerDoc.includes('phaseObjective') && dataLayerDoc.includes('currentMilestone') && dataLayerDoc.includes('openAdoptionActivities') && dataLayerDoc.includes('overdueAdoptionActivities') && dataLayerDoc.includes('phaseAssets') && dataLayerDoc.includes('functionPhaseStatus')],
  ['agentic orchestration config exists', fs.existsSync(orchestrationConfigPath)],
  ['agentic orchestration docs exist', fs.existsSync(orchestrationReadmePath)],
  ['agentic orchestrator script exists', fs.existsSync(orchestratorScriptPath)],
  ['optional slice agent runner exists', fs.existsSync(sliceAgentRunnerPath)],
  ['agentic orchestration config includes required slices', orchestrationConfig.includes('roster-verification') && orchestrationConfig.includes('strategic-action-module') && orchestrationConfig.includes('glean-runtime-readiness')],
  ['agentic orchestration docs keep Glean product constraint', orchestrationReadme.includes('inside the Glean product')],
  ['package exposes orchestrator scripts', packageJson.includes('orchestrator:plan') && packageJson.includes('orchestrator:validate') && packageJson.includes('agent:slice')],
  ['no missing phase button listener', !html.includes("getElementById('phaseBtn')")],
  ['no nested iframe elements', !/<iframe\b/i.test(html)],
  ['no browser storage APIs', !/\b(localStorage|sessionStorage)\b/.test(html)],
  ['no external CSS imports', !/@import\s+url\(/i.test(html)],
  ['no network APIs', !/\b(fetch|XMLHttpRequest|WebSocket|EventSource)\b/.test(html)],
  ['no external script tags', !/<script\b[^>]*\bsrc=/i.test(html)]
];

checks.forEach(([label, ok]) => (ok ? pass(label) : fail(label)));

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
if (!scripts.length) fail('script block exists');
else pass(`found ${scripts.length} script block(s)`);

scripts.forEach((script, index) => {
  try {
    new vm.Script(script, { filename: `artifact-script-${index + 1}.js` });
    pass(`script-${index + 1} syntax`);
  } catch (error) {
    fail(`script-${index + 1} syntax`, error.message);
  }
});

if (process.exitCode) process.exit(process.exitCode);
