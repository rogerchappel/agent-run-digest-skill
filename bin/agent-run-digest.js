#!/usr/bin/env node
import { accessSync, constants, existsSync, statSync } from 'node:fs';
import { createDigest, renderMarkdown } from '../src/digest.js';

const args = process.argv.slice(2);
const { input, format } = parseArgs(args);

if (!input) {
  console.error('Usage: agent-run-digest <transcript.jsonl|txt> [--format markdown|json]');
  process.exit(1);
}

if (format !== 'json' && format !== 'markdown') {
  fail(`Unsupported format: ${format}`);
}

if (!existsSync(input)) {
  fail(`Input file not found: ${input}`);
}

try {
  if (!statSync(input).isFile()) {
    fail(`Input path is not a file: ${input}`);
  }
  accessSync(input, constants.R_OK);
} catch (error) {
  if (error?.code === 'ENOENT') fail(`Input file not found: ${input}`);
  if (error?.code === 'EACCES' || error?.code === 'EPERM') fail(`Input file is not readable: ${input}`);
  if (typeof error?.code === 'number') throw error;
  fail(`Unable to inspect input file: ${input}`);
}

let digest;
try {
  digest = createDigest(input);
} catch (error) {
  if (error?.code === 'ENOENT') fail(`Input file not found: ${input}`);
  if (error?.code === 'EACCES' || error?.code === 'EPERM') fail(`Input file is not readable: ${input}`);
  fail(`Unable to read input file: ${input}`);
}

if (format === 'json') {
  console.log(JSON.stringify(digest, null, 2));
} else {
  console.log(renderMarkdown(digest));
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
