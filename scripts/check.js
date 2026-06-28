import { readFileSync, existsSync } from 'node:fs';

const required = ['README.md', 'SKILL.md', 'docs/PRD.md', 'docs/TASKS.md', 'docs/ORCHESTRATION.md', 'docs/RELEASE_CANDIDATE.md'];
const missing = required.filter(path => !existsSync(path));
if (missing.length) fail(`Missing required files: ${missing.join(', ')}`);
const skill = readFileSync('SKILL.md', 'utf8');
for (const phrase of ['When To Use', 'Side-Effect Boundaries', 'Approval Requirements', 'Validation Workflow']) {
  if (!skill.includes(phrase)) fail(`SKILL.md missing ${phrase}`);
}
console.log('check ok');
function fail(message) { console.error(message); process.exit(1); }
