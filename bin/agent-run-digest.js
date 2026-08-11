#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { createDigest, renderMarkdown } from '../src/digest.js';

const args = process.argv.slice(2);
const { input, format } = parseArgs(args);

if (!input) {
  console.error('Usage: agent-run-digest <transcript.jsonl|txt> [--format markdown|json]');
  process.exit(1);
}

if (!existsSync(input)) {
  console.error(`Input file not found: ${input}`);
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

function parseArgs(args) {
  let input;
  let format = 'markdown';
  let hasFormat = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--format') {
      if (hasFormat) {
        fail('Option --format may only be specified once.');
      }
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        fail('Missing value for --format (expected markdown or json).');
      }
      format = value;
      hasFormat = true;
      index += 1;
    } else if (arg.startsWith('--')) {
      fail(`Unknown option: ${arg}`);
    } else if (input) {
      fail(`Unexpected extra argument: ${arg}`);
    } else {
      input = arg;
    }
  }

  return { input, format };
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
