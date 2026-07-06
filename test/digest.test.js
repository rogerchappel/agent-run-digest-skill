import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createDigest, renderMarkdown } from '../src/digest.js';

const digest = createDigest('fixtures/sample-run.jsonl');

test('creates digest from jsonl transcript', () => {
  assert.equal(digest.eventCount, 6);
  assert.ok(digest.files.includes('src/digest.js'));
  assert.ok(digest.commands.includes('npm test'));
  assert.ok(digest.redactions >= 1);
});

test('renders markdown sections', () => {
  const markdown = renderMarkdown(digest);
  assert.match(markdown, /## Verification Commands/);
  assert.match(markdown, /\[REDACTED\]/);
});

test('cli reports usage when no transcript is supplied', () => {
  const result = spawnSync('node', ['bin/agent-run-digest.js'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: agent-run-digest/);
  assert.match(result.stderr, /--format markdown\|json/);
});
