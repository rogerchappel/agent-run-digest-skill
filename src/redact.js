const SECRET_PATTERNS = [
  /\b(?:sk|ghp|gho|xox[abprs])-?[A-Za-z0-9_\-]{12,}\b/g,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  /\b(?:api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi,
];

export function redactText(value) {
  let text = String(value ?? '');
  let count = 0;
  for (const pattern of SECRET_PATTERNS) {
    text = text.replace(pattern, () => {
      count += 1;
      return '[REDACTED]';
    });
  }
  return { text, count };
}

export function redactRecord(record) {
  const raw = typeof record === 'string' ? record : JSON.stringify(record);
  return redactText(raw);
}
