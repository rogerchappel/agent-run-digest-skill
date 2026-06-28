#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { createDigest, renderMarkdown } from '../src/digest.js';

const args = process.argv.slice(2);
const input = args.find(arg => !arg.startsWith('--'));
const format = readOption(args, '--format') || 'markdown';

if (!input || !existsSync(input)) {
  console.error('Usage: agent-run-digest <transcript.jsonl|txt> [--format markdown|json]');
  process.exit(1);
}

const digest = createDigest(input);
if (format === 'json') {
  console.log(JSON.stringify(digest, null, 2));
} else if (format === 'markdown') {
  console.log(renderMarkdown(digest));
} else {
  console.error(`Unsupported format: ${format}`);
  process.exit(1);
}

function readOption(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}
