# Perchance

> Perchance random-generator integration for the 9898-MTG Chaos RPG format.

**Location:** `perchance`

The Perchance feature replaces the previous CodeGPT integration as mtgBot's
random-content engine. It connects to the League's Perchance generator at
[`https://perchance.org/9898-mtg-chaos-rpg-2024`](https://perchance.org/9898-mtg-chaos-rpg-2024)
and provides an interactive page for generating Chaos RPG content
(creatures, keywords, planes, events, and more).

## Files

- `index.html` — Interactive generator UI (dark red/black themed).

## How it works

The core logic lives in [`../lib/perchance.js`](../lib/perchance.js), a
self-contained module that:

1. **Fetches** a generator's raw source from Perchance via
   `PerchanceClient.load()`.
2. **Parses** the Perchance list grammar (`parseGenerator`) into structured,
   weighted option lists.
3. **Evaluates** the grammar (`generate` / `resolveReferences`), resolving
   `[list]` references recursively with weighted random selection.

The parser and evaluator are pure functions, so they run in the browser (via
the global `window.Perchance`) and in Node.js (via `require`), and are covered
by unit tests in [`../lib/__tests__/perchance.test.js`](../lib/__tests__/perchance.test.js).

## Grammar reference

```
listName
  option one
  option two ^3        // ^N sets a relative weight (default 1)
  text with [otherList] // [references] are resolved recursively
```

By convention the entry-point list is named `output`.

## Usage (Node.js)

```javascript
const { PerchanceClient } = require("../lib/perchance");

const client = new PerchanceClient({ generator: "9898-mtg-chaos-rpg-2024" });
const result = await client.generate({ root: "output" });
console.log(result);
```

---

_This README documents the Perchance feature. The file and subdirectory lists
are refreshed by the weekly maintenance workflow (`scripts/weeklyMaintenance.js`)._
