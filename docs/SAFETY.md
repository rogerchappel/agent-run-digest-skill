# Safety Model

## Local Boundaries

`agent-run-digest` reads local input files and prints output to stdout. It does not perform network requests or mutate external systems.

## Review Points

- Confirm the source file is allowed to be read.
- Review generated summaries before sharing.
- Treat missing evidence and assumptions as blockers for factual claims.

## External Actions

Sending email, posting to Slack, updating a CRM, creating issues, or pushing repository changes is outside this package and requires separate approval.
