import { runAdoptionOsDevAgent } from './adoption-os-dev-agent.mjs';

const input = process.argv.slice(2).join(' ').trim();

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY. Set it before running npm run agent:dev.');
  process.exit(1);
}

if (!input) {
  console.error('Usage: npm run agent:dev -- "Review the artifact and recommend the next slice."');
  process.exit(1);
}

const result = await runAdoptionOsDevAgent(input);
console.log(result.finalOutput);
