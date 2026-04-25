import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const defaultModel = process.env.OPENAI_AGENT_MODEL || 'gpt-5.4';

const readableRoots = new Set(['AGENTS.md', 'README.md', 'docs', 'prompts', 'src', 'scripts', 'integrations']);

function resolveRepoPath(filePath) {
  const normalized = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
  const firstPart = normalized.split(path.sep)[0];

  if (!readableRoots.has(firstPart)) {
    throw new Error(`Path is outside the allowed repo context: ${filePath}`);
  }

  const resolved = path.resolve(repoRoot, normalized);
  if (!resolved.startsWith(repoRoot)) {
    throw new Error(`Path escapes repo root: ${filePath}`);
  }
  return resolved;
}

const listRepoFiles = tool({
  name: 'list_repo_files',
  description: 'List the key editable files in the Adoption OS repo.',
  parameters: z.object({}),
  execute: async () => {
    const output = execFileSync('find', ['.', '-maxdepth', '3', '-type', 'f', '-not', '-path', './.git/*', '-not', '-path', './node_modules/*', '-print'], {
      cwd: repoRoot,
      encoding: 'utf8'
    });
    return output.trim();
  }
});

const readRepoFile = tool({
  name: 'read_repo_file',
  description: 'Read an allowed repo file. Use this before making recommendations about implementation or copy.',
  parameters: z.object({
    filePath: z.string().describe('Repo-relative path, such as AGENTS.md or src/glean_adoption_os.html')
  }),
  execute: async ({ filePath }) => {
    const resolved = resolveRepoPath(filePath);
    const content = fs.readFileSync(resolved, 'utf8');
    const maxChars = 20000;
    if (content.length <= maxChars) return content;
    return `${content.slice(0, maxChars)}\n\n[Truncated at ${maxChars} characters. Ask for a narrower file section if needed.]`;
  }
});

const runArtifactCheck = tool({
  name: 'run_artifact_check',
  description: 'Run the repo build and validation checks for the Glean-ready artifact.',
  parameters: z.object({}),
  execute: async () => {
    try {
      return execFileSync('npm', ['run', 'check'], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      });
    } catch (error) {
      return `${error.stdout || ''}\n${error.stderr || ''}`.trim();
    }
  }
});

const sharedInstructions = `
You are helping develop Glean Adoption OS, a Glean-hosted single-file artifact for AI Outcomes Managers.

Honor the repo hierarchy:
1. AGENTS.md is the startup source of truth.
2. prompts/premises.md contains durable product and model premises.
3. docs/glean-artifact-runtime.md defines artifact runtime expectations.

Keep advice practical, bounded, and tied to adoption workflow. Preserve model-agnostic core design unless the user explicitly asks for provider-specific implementation.
`;

const productStrategistAgent = new Agent({
  name: 'Adoption OS Product Strategist',
  model: defaultModel,
  handoffDescription: 'Clarifies product direction, AIOM workflow fit, adoption value, and next useful slice.',
  instructions: `${sharedInstructions}
Focus on product strategy, workflow adoption, and user value. Recommend the smallest useful slice. Call out weak assumptions and what to validate first.`
});

const implementationReviewerAgent = new Agent({
  name: 'Adoption OS Implementation Reviewer',
  model: defaultModel,
  handoffDescription: 'Reviews artifact implementation, repo structure, validation, and maintainability.',
  instructions: `${sharedInstructions}
Focus on code structure, validation, runtime safety, and maintainability. Prioritize findings that could break the artifact inside Glean or make future development fragile.`
});

const gleanRuntimeReviewerAgent = new Agent({
  name: 'Glean Artifact Runtime Reviewer',
  model: defaultModel,
  handoffDescription: 'Reviews whether the artifact remains safe to place back inside Glean.',
  instructions: `${sharedInstructions}
Focus on Glean runtime readiness. Check that Glean-specific APIs are guarded, the output remains single-file, and the local development path still matches Glean placement needs.`
});

export const adoptionOsDevAgent = new Agent({
  name: 'Adoption OS Development Orchestrator',
  model: defaultModel,
  instructions: `${sharedInstructions}
You coordinate development help for this repo. Start by reading AGENTS.md and relevant premises/docs when needed. Use specialist agents as tools when their perspective will improve the answer. Prefer concise, ranked recommendations and clear next steps.`,
  tools: [
    listRepoFiles,
    readRepoFile,
    runArtifactCheck,
    productStrategistAgent.asTool({
      toolName: 'consult_product_strategy',
      toolDescription: 'Use for product direction, adoption workflow, and prioritization questions.'
    }),
    implementationReviewerAgent.asTool({
      toolName: 'consult_implementation_review',
      toolDescription: 'Use for implementation risks, validation gaps, and maintainability questions.'
    }),
    gleanRuntimeReviewerAgent.asTool({
      toolName: 'consult_glean_runtime',
      toolDescription: 'Use for Glean artifact packaging, runtime, and placement-back-into-Glean questions.'
    })
  ]
});

export async function runAdoptionOsDevAgent(input, options = {}) {
  return run(adoptionOsDevAgent, input, {
    maxTurns: options.maxTurns || 8,
    tracing: options.tracing,
    context: options.context
  });
}
