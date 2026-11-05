# Tasks

## MVP

- [x] Package scaffold
- [x] Product docs
- [x] Skill instructions
- [x] Core parser and planner
- [x] Fixture-backed tests
- [x] CLI surface
- [x] Smoke command
- [x] Release-candidate notes

## Later

- [x] Document current transcript adapters: plain text (`.txt`, one transcript line per physical line) and JSONL (`.jsonl`, one JSON root per nonblank physical line). JSONL fixtures verify object events, nested arrays/content blocks, and scalar roots (`fixtures/plain-run.txt`, `fixtures/sample-run.jsonl`, `fixtures/nested-content-run.jsonl`, `fixtures/physical-lines.jsonl`). Verified with `npm test` (fixture-backed parser and digest tests).
- [ ] Add optional schema export for agent orchestration
- [x] Run the release gate in CI on the in-support Node LTS lines (22 and 24)
