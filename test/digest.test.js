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

test('extracts semantic text from multi-field structured records and redacts secrets', () => {
  const structured = createDigest('fixtures/structured-run.jsonl');
  const markdown = renderMarkdown(structured);

  assert.deepEqual(structured.commands, ['git status']);
  assert.deepEqual(structured.files, ['README.md', 'CHANGELOG.md']);
  assert.ok(structured.redactions >= 2);
  assert.deepEqual(structured.actions, [
    'line 1: README.md git status success',
    'line 2: Updated CHANGELOG.md with [REDACTED] before release.',
  ]);
  assert.doesNotMatch(JSON.stringify(structured), /ghp_1234567890abcdef|ghp_abcdef1234567890/);
  assert.doesNotMatch(markdown, /ghp_1234567890abcdef|ghp_abcdef1234567890/);
  assert.match(markdown, /line 1: README\.md git status success/);
  assert.match(markdown, /line 2: Updated CHANGELOG\.md with \[REDACTED\] before release\./);
});

test('preserves physical line numbers while ignoring blank JSONL records', () => {
  const physicalLines = createDigest('fixtures/physical-lines.jsonl');

  assert.equal(physicalLines.eventCount, 2);
  assert.deepEqual(physicalLines.commands, ['npm test']);
  assert.deepEqual(physicalLines.actions, ['line 4: npm test']);
  assert.match(renderMarkdown(physicalLines), /line 4: .*npm test/);
});

test('preserves physical line numbers for plain text with whitespace-only records', () => {
  const physicalLines = createDigest('fixtures/physical-lines.txt');

  assert.equal(physicalLines.eventCount, 2);
  assert.deepEqual(physicalLines.commands, ['git status']);
  assert.deepEqual(physicalLines.actions, ['line 4: git status']);
});

test('json output cites the physical source line', () => {
  const result = spawnSync(
    'node',
    ['bin/agent-run-digest.js', 'fixtures/physical-lines.jsonl', '--format', 'json'],
    { encoding: 'utf8' },
  );

  assert.equal(result.status, 0);
  assert.deepEqual(JSON.parse(result.stdout).actions, [
    'line 4: npm test',
  ]);
});

test('cli reports usage when no transcript is supplied', () => {
  const result = spawnSync('node', ['bin/agent-run-digest.js'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: agent-run-digest/);
  assert.match(result.stderr, /--format markdown\|json/);
});
