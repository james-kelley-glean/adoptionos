import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAdoptionOsDevAgent } from './adoption-os-dev-agent.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const configPath = path.join(repoRoot, 'orchestration', 'slices.json');
const allowedModes = new Set(['plan', 'review', 'runtime-review']);

function usage() {
  return [
    'Usage: npm run agent:slice -- <slice-id> [plan|review|runtime-review]',
    '',
    'Examples:',
    '  npm run agent:slice -- roster-verification plan',
    '  npm run agent:slice -- strategic-action-module review'
  ].join('\n');
}

function readConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function findSlice(config, sliceId) {
  const slice = config.slices.find(item => item.id === sliceId);
  if (!slice) {
    const known = config.slices.map(item => item.id).join(', ');
    throw new Error(`Unknown slice "${sliceId}". Known slices: ${known}`);
  }
  return slice;
}

function buildSlicePrompt(config, slice, mode) {
  const modeInstruction = {
    plan: 'Create an execution plan for this slice. Do not edit files. Focus on sequencing, risks, and exact acceptance checks.',
    review: 'Review the current repo against this slice. Do not edit files. Return findings, gaps, and whether the slice is ready to implement or complete.',
    'runtime-review': 'Review this slice for Glean runtime safety. Do not edit files. Focus on single-file artifact safety, guarded GleanBridge usage, and validation gaps.'
  }[mode];

  return [
    'You are the optional OpenAI-assisted slice orchestrator for the Glean Adoption OS repo.',
    'This is a development accelerator only; the artifact itself must remain model-agnostic and live inside the Glean product.',
    '',
    modeInstruction,
    '',
    `Hard constraint: ${config.hardConstraint}`,
    `Validation gate: ${config.validationGate}`,
    '',
    `Slice: ${slice.id} — ${slice.title}`,
    `Priority: ${slice.priority}`,
    `Owner lane: ${slice.ownerLane}`,
    `Goal: ${slice.goal}`,
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
    'Return a concise, execution-oriented answer James can hand to Codex sub-agents.'
  ].join('\n');
}

async function main() {
  const [sliceId, requestedMode = 'plan'] = process.argv.slice(2);

  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY. Set it before running npm run agent:slice.');
    process.exit(1);
  }

  if (!sliceId || !allowedModes.has(requestedMode)) {
    console.error(usage());
    process.exit(1);
  }

  const config = readConfig();
  const slice = findSlice(config, sliceId);
  const prompt = buildSlicePrompt(config, slice, requestedMode);
  const result = await runAdoptionOsDevAgent(prompt, { maxTurns: 10 });
  console.log(result.finalOutput);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
