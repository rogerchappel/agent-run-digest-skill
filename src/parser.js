import { readFileSync } from 'node:fs';
import { redactRecord, redactText } from './redact.js';

export function loadTranscript(path) {
  const raw = readFileSync(path, 'utf8');
  const events = [];
  let redactions = 0;
  for (const [index, line] of raw.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    const parsed = parseLine(line, index + 1);
    const redactedRecord = redactRecord(parsed.raw);
    const redactedText = redactText(parsed.text);
    redactions += redactedRecord.count;
    events.push({ ...parsed, redactedText: redactedText.text });
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
    .flatMap(semanticStrings)
    .join(' ');
}

function semanticStrings(value) {
  if (value === null || value === undefined || value === false) return [];
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)];
  }
  if (Array.isArray(value)) return value.flatMap(semanticStrings);
  if (typeof value === 'object') {
    const preferred = ['text', 'message', 'content', 'command', 'path', 'status', 'result', 'error'];
    const fields = preferred.filter(key => Object.hasOwn(value, key));
    return fields.flatMap(key => semanticStrings(value[key]));
  }
  return [];
}

function classifyText(line) {
  if (/\b(error|failed|blocked|risk)\b/i.test(line)) return 'risk';
  if (/\b(npm|node|bash|git|pytest|cargo|go test)\b/i.test(line)) return 'command';
  if (/\b(decided|selected|chose|will)\b/i.test(line)) return 'decision';
  return 'note';
}
