# API

Import the package from Node ESM:

```js
import { createDigest } from 'agent-run-digest-skill';
```

Primary functions:

- `createDigest(path), renderMarkdown(digest)`

The API is deterministic and reads local files only. Blank and whitespace-only
transcript records are ignored, while action, decision, and risk summaries cite
the original physical source line in both the returned JSON data and rendered
Markdown. JSONL records may have any valid JSON root shape. Objects and arrays
are reduced to semantic text; string, number, boolean, and `null` roots retain
their deterministic text representation. For objects, common text fields
(`text`, `message`, `content`, `command`, `path`, `status`, `result`, and
`error`) are traversed first, followed by other fields in source order at every
nesting level. Structural metadata (`type`, `kind`, `event`, `actor`, `role`,
and `tool`) identifies an event and is not repeated as evidence. Callers own
review and any external sharing of generated output.

The `command` field may be a string, array, or nested object. Structured command
values are traversed as semantic text in source order, then executable commands
are extracted, redacted, and deduplicated. Object and array containers are never
coerced to JavaScript display strings such as `[object Object]` or comma-joined
array output.
