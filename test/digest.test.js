import test from 'node:test';
import assert from 'node:assert/strict';
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
