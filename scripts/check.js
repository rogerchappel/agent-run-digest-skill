import { readFileSync, existsSync } from 'node:fs';

const required = ['README.md', 'SKILL.md', 'docs/PRD.md', 'docs/TASKS.md', 'docs/ORCHESTRATION.md', 'docs/RELEASE_CANDIDATE.md'];
const missing = required.filter(path => !existsSync(path));
if (missing.length) fail(`Missing required files: ${missing.join(', ')}`);
const skill = readFileSync('SKILL.md', 'utf8');
for (const phrase of ['When To Use', 'Side-Effect Boundaries', 'Approval Requirements', 'Validation Workflow']) {
  if (!skill.includes(phrase)) fail(`SKILL.md missing ${phrase}`);
}
// Keep the CI matrix and the declared engines floor in agreement.
const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
const matrixBlock = ci.match(/node-version:\n((?:\s+-\s+\d+\n?)+)/);
if (!matrixBlock) fail('CI workflow missing node-version matrix');
const matrixVersions = matrixBlock[1].match(/\d+/g).map(Number);
const enginesFloor = JSON.parse(readFileSync('package.json', 'utf8')).engines.node.match(/>=(\d+)/);
if (!enginesFloor) fail('package.json engines must declare a ">=NN" node floor');
if (Math.min(...matrixVersions) !== Number(enginesFloor[1])) {
  fail(`CI matrix minimum Node ${Math.min(...matrixVersions)} contradicts engines >=${enginesFloor[1]}`);
}
console.log('check ok');
function fail(message) { console.error(message); process.exit(1); }
