# Orchestration

1. Confirm the input file is local and safe to inspect.
2. Run `node bin/agent-run-digest.js fixtures/sample-run.jsonl --format markdown` or call the library API from an agent workflow.
3. Review generated Markdown or JSON before using it in a PR, message, or handoff.
4. Treat any external send, CRM write, calendar update, or job-board action as out of scope until a human approves it.

## Agent Contract

Inputs are local files. Outputs are draft artifacts. Side effects are limited to terminal output unless a caller redirects stdout.
