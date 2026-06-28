# Agent Run Digest Skill

Local-first agent transcript digest skill for audits and PR evidence. It is designed for agents that need a repeatable, fixture-backed workflow before sharing summaries or acting on external systems.

## Quickstart

```bash
npm install
npm run smoke
```

Run the CLI directly:

```bash
node bin/agent-run-digest.js fixtures/sample-run.jsonl --format markdown
node bin/agent-run-digest.js fixtures/sample-run.jsonl --format json
```

## What It Does

- Reads local fixtures only.
- Produces deterministic Markdown or JSON.
- Keeps evidence and assumptions visible.
- Fails fast on missing input files or unsupported formats.

## Safety Notes

This package performs no network requests and writes no external accounts. Review generated text before sending it to another system. Redaction and classification are best-effort aids, not compliance guarantees.

## Limitations

The MVP uses deterministic heuristics so results are easy to test and inspect. It does not scrape, enrich from live services, or call an LLM.

## Development

```bash
npm test
npm run check
npm run build
npm run smoke
```
