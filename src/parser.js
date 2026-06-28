import { readFileSync } from 'node:fs';
import { redactRecord } from './redact.js';

export function loadTranscript(path) {
  const raw = readFileSync(path, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const events = [];
  let redactions = 0;
  for (const [index, line] of lines.entries()) {
    const parsed = parseLine(line, index + 1);
    const redacted = redactRecord(parsed.raw);
    redactions += redacted.count;
    events.push({ ...parsed, redactedText: redacted.text });
  }
  return { path, events, redactions };
}

function parseLine(line, lineNumber) {
  try {
    const data = JSON.parse(line);
    return {
      lineNumber,
      kind: data.type || data.kind || data.event || 'event',
      actor: data.actor || data.role || data.tool || 'agent',
      text: stringifyEvent(data),
      raw: data,
    };
  } catch {
    return { lineNumber, kind: classifyText(line), actor: 'transcript', text: line, raw: line };
  }
}

function stringifyEvent(data) {
  return [data.message, data.content, data.command, data.path, data.status, data.result, data.error]
    .filter(Boolean)
    .map(String)
    .join(' ');
}

function classifyText(line) {
  if (/\b(error|failed|blocked|risk)\b/i.test(line)) return 'risk';
  if (/\b(npm|node|bash|git|pytest|cargo|go test)\b/i.test(line)) return 'command';
  if (/\b(decided|selected|chose|will)\b/i.test(line)) return 'decision';
  return 'note';
}
