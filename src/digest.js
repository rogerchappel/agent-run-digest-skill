import { loadTranscript } from './parser.js';

const FILE_RE = /(?:^|\s)([\w./-]+\.(?:js|ts|json|md|yml|yaml|py|sh|txt|lock))(?:\b|$)/g;
const COMMAND_RE = /\b(?:npm (?:run )?\w+|node [^\n]+|bash [^\n]+|git [^\n]+|pytest(?: [^\n]+)?|cargo test|go test [^\n]+)\b/g;

export function createDigest(path, options = {}) {
  const transcript = loadTranscript(path);
  const items = transcript.events.map(event => ({ ...event, text: event.redactedText || event.text }));
  const files = unique(flatMapMatches(items, FILE_RE));
  const commands = unique(flatMapMatches(items, COMMAND_RE));
  const risks = collect(items, /\b(error|failed|blocked|risk|secret|credential)\b/i);
  const decisions = collect(items, /\b(decided|selected|chose|will|classification|ship|incubate|kill)\b/i);
  const actions = items.filter(item => /tool|command|action|exec|write|patch/i.test(item.kind + ' ' + item.actor + ' ' + item.text));
  return {
    source: path,
    eventCount: items.length,
    redactions: transcript.redactions,
    files,
    commands,
    decisions: decisions.slice(0, options.limit ?? 8),
    risks: risks.slice(0, options.limit ?? 8),
    actions: actions.slice(0, options.limit ?? 12).map(item => summarizeItem(item)),
  };
}

export function renderMarkdown(digest) {
  return [
    `# Agent Run Digest`,
    ``,
    `Source: ${digest.source}`,
    `Events: ${digest.eventCount}`,
    `Redactions: ${digest.redactions}`,
    section('Actions', digest.actions),
    section('Files Mentioned', digest.files),
    section('Verification Commands', digest.commands),
    section('Decisions', digest.decisions),
    section('Risks And Blockers', digest.risks),
  ].join('\n');
}

function section(title, values) {
  const rows = values.length ? values.map(value => `- ${value}`) : ['- None detected'];
  return [``, `## ${title}`, ``, ...rows].join('\n');
}

function collect(items, pattern) {
  return items.filter(item => pattern.test(item.text)).map(summarizeItem);
}

function summarizeItem(item) {
  return `line ${item.lineNumber}: ${item.text.replace(/\s+/g, ' ').trim().slice(0, 180)}`;
}

function flatMapMatches(items, pattern) {
  const out = [];
  for (const item of items) {
    for (const match of item.text.matchAll(pattern)) out.push(match[1] || match[0]);
  }
  return out;
}

function unique(values) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}
