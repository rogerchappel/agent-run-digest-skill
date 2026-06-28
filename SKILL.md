# Agent Run Digest Skill

## When To Use

Use this skill when an agent needs to summarize a local transcript, PR worklog, or CI run log into auditable evidence without sending the source log outside the workspace.

## Required Inputs

- A local fixture file in the supported format.
- Permission to read the file contents.
- A target output format: `markdown` or `json`.

## Side-Effect Boundaries

The skill reads local files and writes to stdout only. It must not send messages, update CRMs, create issues, push commits, or call live APIs without a separate explicit approval.

## Approval Requirements

Human approval is required before sharing generated briefs outside the workspace, using them as final public claims, or taking any external account action based on the output.

## Examples

```bash
npm run smoke
node bin/agent-run-digest.js fixtures/sample-run.jsonl --format json
```

## Validation Workflow

1. Run `npm test`.
2. Run `npm run check`.
3. Run `npm run build`.
4. Run `npm run smoke`.
5. Inspect the output for unsupported assumptions before use.
