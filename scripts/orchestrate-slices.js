const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const configPath = path.join(root, 'orchestration', 'slices.json');

function readConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing orchestration config: ${path.relative(root, configPath)}`);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function validateConfig(config) {
  const errors = [];
  if (!config.name) errors.push('Missing name');
  if (!config.hardConstraint || !config.hardConstraint.includes('Glean product')) {
    errors.push('hardConstraint must mention the Glean product');
  }
  if (!config.validationGate) errors.push('Missing validationGate');
  if (!Array.isArray(config.slices) || !config.slices.length) errors.push('Missing slices');

  const ids = new Set();
  for (const slice of config.slices || []) {
    if (!slice.id) errors.push('Slice missing id');
    if (ids.has(slice.id)) errors.push(`Duplicate slice id: ${slice.id}`);
    ids.add(slice.id);
    if (!slice.title) errors.push(`${slice.id}: missing title`);
    if (!slice.goal) errors.push(`${slice.id}: missing goal`);
    if (!slice.ownerLane) errors.push(`${slice.id}: missing ownerLane`);
    if (!Array.isArray(slice.writeScope) || !slice.writeScope.length) errors.push(`${slice.id}: missing writeScope`);
    if (!Array.isArray(slice.requirements) || !slice.requirements.length) errors.push(`${slice.id}: missing requirements`);
    if (!Array.isArray(slice.acceptanceCriteria) || !slice.acceptanceCriteria.length) errors.push(`${slice.id}: missing acceptanceCriteria`);
  }

  const required = ['roster-verification', 'strategic-action-module', 'glean-runtime-readiness'];
  for (const id of required) {
    if (!ids.has(id)) errors.push(`Missing required slice: ${id}`);
  }

  return errors;
}

function findSlice(config, sliceId) {
  const slice = config.slices.find(item => item.id === sliceId);
  if (!slice) {
    const known = config.slices.map(item => item.id).join(', ');
    throw new Error(`Unknown slice "${sliceId}". Known slices: ${known}`);
  }
  return slice;
}

function printPlan(config) {
  console.log(`${config.name} (${config.version})`);
  console.log(`Gate: ${config.validationGate}`);
  console.log('');
  for (const slice of [...config.slices].sort((a, b) => a.priority - b.priority)) {
    console.log(`${slice.priority}. ${slice.id} — ${slice.title}`);
    console.log(`   Lane: ${slice.ownerLane}`);
    console.log(`   Goal: ${slice.goal}`);
    console.log(`   Writes: ${slice.writeScope.join(', ')}`);
  }
}

function buildPrompt(config, slice, role) {
  const roleIntro = {
    implementer: 'You are the worker sub-agent implementing this Adoption OS slice.',
    'spec-reviewer': 'You are the spec reviewer sub-agent checking this slice against requirements and acceptance criteria.',
    'runtime-reviewer': 'You are the Glean runtime reviewer sub-agent checking whether this slice remains safe inside the Glean product.'
  }[role];

  if (!roleIntro) {
    throw new Error('Role must be one of: implementer, spec-reviewer, runtime-reviewer');
  }

  const action = role === 'implementer'
    ? 'Edit files directly in your forked workspace. List every file you changed in your final answer.'
    : 'Do not edit files. Return findings, risks, and pass/fail status.';

  return [
    roleIntro,
    '',
    'You are not alone in the codebase. Do not revert edits made by others; adapt to existing changes.',
    `Hard constraint: ${config.hardConstraint}`,
    `Validation gate: ${config.validationGate}`,
    '',
    `Slice: ${slice.id} — ${slice.title}`,
    `Goal: ${slice.goal}`,
    `Owner lane: ${slice.ownerLane}`,
    '',
    'Write scope:',
    ...slice.writeScope.map(item => `- ${item}`),
    '',
    'Requirements:',
    ...slice.requirements.map(item => `- ${item}`),
    '',
    'Acceptance criteria:',
    ...slice.acceptanceCriteria.map(item => `- ${item}`),
    '',
    'Global guardrails:',
    ...config.globalGuardrails.map(item => `- ${item}`),
    '',
    action,
    '',
    'Final response format:',
    '- Status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED',
    '- Files changed or reviewed',
    '- Validation run and result',
    '- Risks or follow-ups'
  ].join('\n');
}

function main() {
  const command = process.argv[2] || 'plan';
  const config = readConfig();

  if (command === 'validate') {
    const errors = validateConfig(config);
    if (errors.length) {
      errors.forEach(error => console.error(`FAIL ${error}`));
      process.exit(1);
    }
    console.log('PASS orchestration config');
    return;
  }

  if (command === 'plan') {
    const errors = validateConfig(config);
    if (errors.length) {
      errors.forEach(error => console.error(`FAIL ${error}`));
      process.exit(1);
    }
    printPlan(config);
    return;
  }

  if (command === 'prompt') {
    const sliceId = process.argv[3];
    const role = process.argv[4] || 'implementer';
    if (!sliceId) throw new Error('Usage: npm run orchestrator:prompt -- <slice-id> <implementer|spec-reviewer|runtime-reviewer>');
    const errors = validateConfig(config);
    if (errors.length) {
      errors.forEach(error => console.error(`FAIL ${error}`));
      process.exit(1);
    }
    console.log(buildPrompt(config, findSlice(config, sliceId), role));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
