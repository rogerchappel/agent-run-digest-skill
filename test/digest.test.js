import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDigest, renderMarkdown } from '../src/digest.js';
import { loadTranscript } from '../src/parser.js';

const digest = createDigest('fixtures/sample-run.jsonl');

function runCli(args) {
  return spawnSync('node', ['bin/agent-run-digest.js', ...args], { encoding: 'utf8' });
}

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
    'line 1: README.md git status success [REDACTED]',
    'line 2: Updated CHANGELOG.md with [REDACTED] before release.',
  ]);
  assert.doesNotMatch(JSON.stringify(structured), /ghp_1234567890abcdef|ghp_abcdef1234567890/);
  assert.doesNotMatch(markdown, /ghp_1234567890abcdef|ghp_abcdef1234567890/);
  assert.match(markdown, /line 1: README\.md git status success/);
  assert.match(markdown, /line 2: Updated CHANGELOG\.md with \[REDACTED\] before release\./);
});

test('extracts redacted evidence from nested structured content blocks', () => {
  const structured = createDigest('fixtures/nested-content-run.jsonl');

  assert.deepEqual(structured.files, ['src/parser.js']);
  assert.deepEqual(structured.commands, ['npm run test:unit -- --coverage']);
  assert.deepEqual(structured.actions, [
    'line 1: Updated src/parser.js using [REDACTED] and ran npm run test:unit -- --coverage',
  ]);
  assert.ok(structured.redactions >= 1);
  assert.doesNotMatch(JSON.stringify(structured), /\[object Object\]|ghp_nestedfixturetoken/);
});

test('cli preserves nested JSONL evidence and complete npm script commands', () => {
  const result = spawnSync(
    'node',
    ['bin/agent-run-digest.js', 'fixtures/nested-content-run.jsonl', '--format', 'json'],
    { encoding: 'utf8' },
  );

  assert.equal(result.status, 0);
  const output = JSON.parse(result.stdout);
  assert.deepEqual(output.files, ['src/parser.js']);
  assert.deepEqual(output.commands, ['npm run test:unit -- --coverage']);
  assert.doesNotMatch(result.stdout, /\[object Object\]|ghp_nestedfixturetoken/);
});

test('extracts complete test commands without consuming prose or punctuation', () => {
  const commands = createDigest('fixtures/test-command-boundaries.txt');

  assert.deepEqual(commands.commands, [
    'go test',
    'cargo test --workspace',
    'npm test --watch',
    'go test ./...',
    'cargo test --all-features',
    'cargo test',
    'npm test',
  ]);
});

test('cli preserves bare, flagged, and multiple bounded test commands', () => {
  const result = runCli(['fixtures/test-command-boundaries.txt', '--format', 'json']);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).commands, [
    'go test',
    'cargo test --workspace',
    'npm test --watch',
    'go test ./...',
    'cargo test --all-features',
    'cargo test',
    'npm test',
  ]);
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

test('preserves every valid JSONL root shape as deterministic transcript text', () => {
  const directory = mkdtempSync(join(tmpdir(), 'agent-run-digest-roots-'));
  const transcript = join(directory, 'roots.jsonl');
  writeFileSync(transcript, [
    '"npm test failed"',
    '42',
    'true',
    'false',
    'null',
    '["git status", {"content":"blocked by review"}]',
    '{"message":"updated README.md"}',
  ].join('\n'));

  try {
    const transcriptData = loadTranscript(transcript);
    const roots = createDigest(transcript);

    assert.deepEqual(transcriptData.events.map(({ lineNumber, text }) => ({ lineNumber, text })), [
      { lineNumber: 1, text: 'npm test failed' },
      { lineNumber: 2, text: '42' },
      { lineNumber: 3, text: 'true' },
      { lineNumber: 4, text: 'false' },
      { lineNumber: 5, text: 'null' },
      { lineNumber: 6, text: 'git status blocked by review' },
      { lineNumber: 7, text: 'updated README.md' },
    ]);
    assert.equal(roots.eventCount, 7);
    assert.deepEqual(roots.commands, ['npm test', 'git status blocked by review']);
    assert.deepEqual(roots.risks, [
      'line 1: npm test failed',
      'line 6: git status blocked by review',
    ]);
    assert.deepEqual(roots.actions, []);
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test('cli preserves scalar and array JSONL evidence with physical line provenance', () => {
  const directory = mkdtempSync(join(tmpdir(), 'agent-run-digest-cli-roots-'));
  const transcript = join(directory, 'roots.jsonl');
  writeFileSync(transcript, '"npm test failed"\n\n42\nfalse\nnull\n["git status"]\n');

  try {
    const result = spawnSync(
      'node',
      ['bin/agent-run-digest.js', transcript, '--format', 'json'],
      { encoding: 'utf8' },
    );

    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.eventCount, 5);
    assert.deepEqual(output.commands, ['npm test', 'git status']);
    assert.deepEqual(output.risks, ['line 1: npm test failed']);
    assert.deepEqual(output.actions, ['line 6: git status']);
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test('extracts semantic evidence from non-preferred and nested object fields', () => {
  const directory = mkdtempSync(join(tmpdir(), 'agent-run-digest-object-fields-'));
  const transcript = join(directory, 'objects.jsonl');
  writeFileSync(transcript, [
    '',
    '{"custom":"npm test failed after updating README.md"}',
    '{"payload":{"details":"Review docs/API.md with token=ghp_nestedobjecttoken"}}',
  ].join('\n'));

  try {
    const transcriptData = loadTranscript(transcript);
    const objects = createDigest(transcript);

    assert.deepEqual(transcriptData.events.map(({ lineNumber, text }) => ({ lineNumber, text })), [
      { lineNumber: 2, text: 'npm test failed after updating README.md' },
      { lineNumber: 3, text: 'Review docs/API.md with token=ghp_nestedobjecttoken' },
    ]);
    assert.deepEqual(objects.files, ['README.md', 'docs/API.md']);
    assert.deepEqual(objects.commands, ['npm test']);
    assert.deepEqual(objects.risks, ['line 2: npm test failed after updating README.md']);
    assert.ok(objects.redactions >= 1);
    assert.doesNotMatch(JSON.stringify(objects), /\[object Object\]|ghp_nestedobjecttoken/);
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test('cli preserves evidence from non-preferred object fields', () => {
  const directory = mkdtempSync(join(tmpdir(), 'agent-run-digest-cli-object-fields-'));
  const transcript = join(directory, 'objects.jsonl');
  writeFileSync(transcript, '\n{"custom":"npm test failed after updating README.md"}\n');

  try {
    const result = runCli([transcript, '--format', 'json']);

    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.deepEqual(output.files, ['README.md']);
    assert.deepEqual(output.commands, ['npm test']);
    assert.deepEqual(output.risks, ['line 2: npm test failed after updating README.md']);
    assert.doesNotMatch(result.stdout, /\[object Object\]/);
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test('cli reports usage when no transcript is supplied', () => {
  const result = runCli([]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: agent-run-digest/);
  assert.match(result.stderr, /--format markdown\|json/);
});

test('cli accepts the input and format option in either order', () => {
  for (const { args, assertion } of [
    {
      args: ['fixtures/sample-run.jsonl', '--format', 'json'],
      assertion: output => assert.equal(JSON.parse(output).eventCount, 6),
    },
    {
      args: ['--format', 'json', 'fixtures/sample-run.jsonl'],
      assertion: output => assert.equal(JSON.parse(output).eventCount, 6),
    },
    {
      args: ['fixtures/sample-run.jsonl', '--format', 'markdown'],
      assertion: output => assert.match(output, /^# Agent Run Digest/m),
    },
    {
      args: ['--format', 'markdown', 'fixtures/sample-run.jsonl'],
      assertion: output => assert.match(output, /^# Agent Run Digest/m),
    },
  ]) {
    const result = runCli(args);
    assert.equal(result.status, 0, result.stderr);
    assertion(result.stdout);
  }
});

test('cli defaults to markdown output', () => {
  const result = runCli(['fixtures/sample-run.jsonl']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^# Agent Run Digest/m);
});

test('cli rejects invalid argument forms with actionable errors', () => {
  const cases = [
    {
      args: ['fixtures/sample-run.jsonl', '--format'],
      error: /Missing value for --format \(expected markdown or json\)\./,
    },
    {
      args: ['fixtures/sample-run.jsonl', '--typo'],
      error: /Unknown option: --typo/,
    },
    {
      args: ['fixtures/sample-run.jsonl', 'fixtures/physical-lines.jsonl'],
      error: /Unexpected extra argument: fixtures\/physical-lines\.jsonl/,
    },
    {
      args: ['fixtures/sample-run.jsonl', '--format', 'yaml'],
      error: /Unsupported format: yaml/,
    },
    {
      args: ['--format', 'json', 'fixtures/sample-run.jsonl', '--format', 'markdown'],
      error: /Option --format may only be specified once/,
    },
  ];

  for (const { args, error } of cases) {
    const result = runCli(args);
    assert.notEqual(result.status, 0, `expected failure for ${args.join(' ')}`);
    assert.match(result.stderr, error);
    assert.equal(result.stdout, '');
  }
});
