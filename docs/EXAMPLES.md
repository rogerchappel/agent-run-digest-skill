# Examples

```bash
node bin/agent-run-digest.js fixtures/sample-run.jsonl --format markdown
node bin/agent-run-digest.js fixtures/plain-run.txt --format json
```

Use the Markdown output in PR descriptions when the source transcript can stay local.
Evidence summaries cite physical source lines, so blank or whitespace-only records
do not shift references:

```text
## Actions

- line 4: {"type":"command","command":"npm test"}
```
