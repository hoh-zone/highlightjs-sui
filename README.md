# highlightjs-sui

[Highlight.js](https://highlightjs.org/) grammar for [Sui Move](https://docs.sui.io/concepts/sui-move-concepts), targeting the **Move 2024** edition (`edition = "2024"` / `2024.beta`).

Covers Sui- and Move-2024-oriented syntax such as `public struct`, `public(package)`, `type` aliases, `macro fun`, backtick-escaped identifiers, labeled control flow, `use fun` method aliases, `#[syntax(index)]`, macro calls (`foo!`), and common Sui framework operations (`public_transfer`, `share_object`, …).

## Installation

```bash
npm install highlightjs-sui highlight.js
```

## Documentation

- **[mdBook integration](docs/mdbook-integration.md)** — enable this grammar for ` ```sui-move ` fenced blocks in mdBook (CDN or local esbuild).
- **[Syntax coverage](docs/syntax-coverage.md)** — what is highlighted for Sui / Move 2024 and what is not guaranteed to match the compiler.

## Usage

Use the **same import** for highlight.js **v10** and **v11+**. The grammar checks for `hljs.regex` (present on v11+, absent on v10) and returns either the legacy `className`-based rules or the modern `scope`-based rules, so you do not need a separate “v10 build” in application code.

```js
import hljs from 'highlight.js/lib/core';
import suiMove from 'highlightjs-sui';

hljs.registerLanguage('sui-move', suiMove);
```

CommonJS:

```js
const hljs = require('highlight.js/lib/core');
const suiMove = require('highlightjs-sui');

hljs.registerLanguage('sui-move', suiMove);
```

The path `highlightjs-sui/v10` still resolves and points at the **same** module (kept for older import paths only).

### Example

```js
const code = `
module example::m {
    public struct Counter has key { id: sui::object::UID, n: u64 }
    public(package) fun bump(self: &mut Counter) { self.n = self.n + 1 }
}
`;

console.log(hljs.highlight(code, { language: 'sui-move' }).value);
```

## Language aliases

Registered name: **Sui Move**. Aliases:

- `sui-move`
- `move-sui`
- `sui`
- `move2024`

Example fenced block:

````markdown
```sui-move
module pkg::mod { public struct S has drop {} }
```
````

## Development

```bash
npm install
npm run check
```

Sample snippets for manual checks live under `test/`.

## License

[MIT](LICENSE)
