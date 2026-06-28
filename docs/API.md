# API

Import the package from Node ESM:

```js
import { createDigest } from 'agent-run-digest-skill';
```

Primary functions:

- `createDigest(path), renderMarkdown(digest)`

The API is deterministic and reads local files only. Callers own review and any external sharing of generated output.
