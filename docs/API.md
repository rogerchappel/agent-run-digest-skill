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
Markdown. Callers own review and any external sharing of generated output.
