import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDigest, renderMarkdown } from '../src/digest.js';

const examples = readFileSync('docs/EXAMPLES.md', 'utf8');
const api = readFileSync('docs/API.md', 'utf8');
const exampleCommands = [...examples.matchAll(/^node bin\/agent-run-digest\.js (\S+) --format (markdown|json)$/gm)];
assert.ok(exampleCommands.length, 'EXAMPLES.md must contain runnable CLI examples');
for (const [, input, format] of exampleCommands) {
  const output = createDigest(input);
  assert.ok(format === 'markdown' ? renderMarkdown(output).startsWith('# Agent Run Digest') : JSON.stringify(output).length > 0,
    `EXAMPLES.md command must produce ${format} output: ${input}`);
}
assert.match(api, /import\s+\{\s*createDigest\s*\}\s+from\s+'agent-run-digest-skill'/,
  'API.md must document the supported package import');
assert.match(readFileSync('src/digest.js', 'utf8'), /export function createDigest/);
assert.match(readFileSync('src/digest.js', 'utf8'), /export function renderMarkdown/);
console.log(`docs check ok: ${exampleCommands.length} CLI examples and API exports`);
