# Agent Run Digest Skill PRD

Status: in-progress
Owner: Roger Chappel
Lane: oss-factory-agent-skills

## Problem

Agents often leave long transcripts that are hard to audit quickly. Builders need a local-first skill that turns an agent run log into a compact digest of objectives, actions, files changed, checks run, risks, blockers, and next steps without sending private transcript data to an external service.

## Users

- Agent builders reviewing local or CI agent transcripts
- Maintainers preparing public PR evidence
- Operators checking whether an agent respected side-effect boundaries

## MVP

- Parse JSONL or plain-text transcript fixtures.
- Extract tool/action events, file paths, verification commands, decisions, blockers, and likely secrets.
- Redact common credential shapes by default.
- Emit Markdown or JSON summaries.
- Include a reusable `SKILL.md` explaining when agents should use it, inputs, side-effect boundaries, approval requirements, examples, and verification workflow.
- Provide fixture-backed tests, smoke command, and release-candidate notes.

## Non-Goals

- No live account writes.
- No remote LLM dependency.
- No attempt to infer private intent beyond transcript evidence.

## Acceptance

- `npm test`, `npm run check`, `npm run build`, and `npm run smoke` pass locally.
- README includes quickstart, examples, limitations, and safety notes.
- Public repo exists under `rogerchappel/agent-run-digest-skill`.

