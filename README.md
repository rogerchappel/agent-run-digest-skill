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
node bin/agent-run-digest.js --format json fixtures/sample-run.jsonl
```

`--format` may appear before or after the single transcript path. If omitted,
the output defaults to Markdown.

## What It Does

- Reads local fixtures only.
- Accepts plain-text transcripts and JSONL records, including nested arrays of
  structured text content blocks.
- Preserves every valid JSON root shape: object fields and array content become
  semantic text, while strings, numbers, booleans, and `null` become their
  deterministic transcript representation. Object traversal reads common text
  fields first, then other fields in source order; structural metadata such as
  `type`, `role`, and `tool` labels the event instead of becoming evidence.
- Produces deterministic Markdown or JSON.
- Extracts supported verification commands from prose. Bare `go test`,
  `cargo test`, and `npm test` commands are retained along with immediately
  attached flags (such as `--workspace` or `--watch`) and Go package paths
  (such as `./...`), while sentence punctuation and following prose are
  excluded. Multiple commands on one transcript line are reported separately.
- Cites original physical line numbers while ignoring blank and whitespace-only records.
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
npm run lint
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

## Release Readiness

Run `npm run release:check` before publishing or tagging. The package smoke
step verifies that the CLI, library modules, skill instructions, fixture,
license, changelog, contribution guide, and security policy are included in the
dry-run tarball.

Use `docs/RELEASE_CHECKLIST.md` as the reviewer checklist when opening a release
readiness PR.

## Security

See [SECURITY.md](SECURITY.md) for supported versions and vulnerability
reporting guidance. Use synthetic run logs in bug reports and fixtures.
