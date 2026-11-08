# Changelog

## Unreleased

- Preserve meaningful evidence from string, number, boolean, `null`, array, and
  object JSONL root records instead of silently discarding or failing on them.
- Preserve physical source line numbers in Markdown and JSON evidence summaries
  when transcripts contain blank or whitespace-only records.

## 0.1.0

- Initial public release candidate for `agent-run-digest-skill`.
- Adds local-first CLI, library API, fixtures, tests, smoke command, and reusable skill instructions.
