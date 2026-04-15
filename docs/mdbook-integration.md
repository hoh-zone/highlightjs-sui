# Using highlightjs-sui with mdBook

[mdBook](https://rust-lang.github.io/mdBook/) uses [Highlight.js](https://highlightjs.org/) for code blocks, but **Sui Move is not in the default language list**. After wiring in **highlightjs-sui**, fenced blocks with ` ```sui-move ` are highlighted.

Two common approaches: **online (CDN + dynamic `import`)** and **offline (bundle a single script)**. Pick one.

---

## Prerequisites

- mdBook installed (`mdbook --version` works).
- A book with `book.toml` and default HTML output (`[output.html]`).

---

## 1. Language tag in Markdown

The registered language name is **Sui Move**. Aliases include **`sui-move`**, **`move-sui`**, **`sui`**, **`move2024`**.

Recommended in your sources:

````markdown
```sui-move
module example::m {
    public struct Counter has key {
        id: sui::object::UID,
        n: u64,
    }
}
```
````

Like ` ```rust `, you **must** specify a language; mdBook disables automatic language detection by default.

---

## 2. Option A: load the grammar from a CDN (simple)

Use when you have network access and are fine depending on jsDelivr / npm CDN.

**Requirement**: **`highlightjs-sui` is published on npm** (or you host the files at a reachable URL and change the import). If not published, use **Option B** below.

### 2.1 Add a script

At the book root (next to `book.toml`), create a `theme` folder if needed, then add **`theme/highlight-sui-move.js`**:

```javascript
(function () {
  async function registerAndHighlight() {
    if (typeof hljs === 'undefined') {
      console.warn('highlightjs-sui: global hljs not found');
      return;
    }

    // Pin the version you depend on, e.g. @0.1.0
    const mod = await import(
      'https://cdn.jsdelivr.net/npm/highlightjs-sui@0.1.0/src/languages/sui-move.mjs'
    );
    const suiMove = mod.default;

    hljs.registerLanguage('sui-move', suiMove);
    hljs.registerLanguage('move-sui', suiMove);
    hljs.registerLanguage('sui', suiMove);
    hljs.registerLanguage('move2024', suiMove);

    document.querySelectorAll('pre code').forEach(function (block) {
      hljs.highlightElement(block);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerAndHighlight);
  } else {
    registerAndHighlight();
  }
})();
```

Notes:

- mdBook loads its bundled **`highlight.js`** first and exposes the global **`hljs`**. Scripts listed under **`additional-js`** run later; **`registerLanguage`** then **`hljs.highlightElement`** on every **`pre code`** re-applies highlighting.
- Keep **`@0.1.0`** in sync with the version you use; if the package is not on npm, switch to **Option B**.

### 2.2 Register the script in `book.toml`

```toml
[output.html]
additional-js = ["theme/highlight-sui-move.js"]
```

### 2.3 Build and preview

```bash
mdbook build
mdbook serve
```

Open a chapter that contains ` ```sui-move ` blocks; keywords and module paths should be colored.

---

## 3. Option B: bundle locally (offline, private registry, or unpublished package)

Use when CDN is unavailable or **`highlightjs-sui`** only exists in a monorepo via `file:`.

Idea: use **`esbuild`** in the book project to bundle **`highlightjs-sui`** into **one** browser IIFE that registers against the existing global **`hljs`** from mdBook. **Do not** bundle a second full **`highlight.js`** copy into the same file.

### 3.1 Install dependencies

At the book root:

```bash
npm init -y
npm install highlightjs-sui esbuild --save-dev
```

You **do not** need to install **`highlight.js`** again for the browser bundle—mdBook already ships it. A local `highlight.js` install is optional if you want to align versions.

### 3.2 Add an entry file `scripts/mdbook-sui-bridge.js`

```javascript
const suiMove = require('highlightjs-sui');

function run() {
  if (typeof hljs === 'undefined') {
    console.warn('highlightjs-sui (mdbook): global hljs not found');
    return;
  }
  hljs.registerLanguage('sui-move', suiMove);
  hljs.registerLanguage('move-sui', suiMove);
  hljs.registerLanguage('sui', suiMove);
  hljs.registerLanguage('move2024', suiMove);
  document.querySelectorAll('pre code').forEach(function (block) {
    hljs.highlightElement(block);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
```

### 3.3 Bundle into `theme/`

```bash
npx esbuild scripts/mdbook-sui-bridge.js \
  --bundle \
  --platform=browser \
  --format=iife \
  --outfile=theme/highlight-sui-move.bundle.js
```

`book.toml`:

```toml
[output.html]
additional-js = ["theme/highlight-sui-move.bundle.js"]
```

Re-run **`esbuild`** whenever you upgrade **`highlightjs-sui`**.

A **`file:../highlightjs-sui`** dependency works the same way; the grammar is embedded in **`theme/highlight-sui-move.bundle.js`**, so the built static site does not need **`node_modules`**.

---

## 4. mdBook’s Highlight.js version

**highlightjs-sui** picks highlight.js v10 vs v11+ at runtime using **`hljs.regex`** (present on v11+, absent on v10). Different mdBook releases may ship different hljs versions; you usually do not need a separate “v10 entry”. If highlighting looks wrong, check **`hljs.versionString`** in the browser console against the [v11 upgrade notes](https://github.com/highlightjs/highlight.js/blob/main/VERSION_11_UPGRADE.md).

---

## 5. Troubleshooting

### 5.1 No colors after adding the script

1. Confirm the fence uses **`sui-move`** (or an alias) and is not an indented code block.
2. Confirm **`additional-js`** paths in **`book.toml`** are correct relative to the book root and that the JS file is reachable under **`book/`** after build.
3. Open devtools: verify **`highlight-sui-move.js`** is not 404 and that no script errors occur (e.g. CDN blocked).

### 5.2 `hljs` is still `undefined`

mdBook normally loads **`highlight.js`** before **`additional-js`**. If you customized **`theme/index.hbs`** and reordered scripts, ensure **`hljs`** exists before registration. See [mdBook issue #1870](https://github.com/rust-lang/mdBook/issues/1870).

### 5.3 Changing Highlight.js colors

Download a stylesheet from the [highlight.js styles](https://github.com/highlightjs/highlight.js/tree/main/src/styles), save it as **`theme/highlight.css`** in the book project, and mdBook will use it for syntax colors (see [mdBook: Syntax highlighting](https://rust-lang.github.io/mdBook/format/theme/syntax-highlighting.html)).

---

## 6. Summary

| Step | What to do |
|------|------------|
| Markdown | Use ` ```sui-move ` (or aliases such as `sui`, `move2024`) |
| Register | After mdBook’s default **`hljs`** loads, call **`registerLanguage`** |
| Re-highlight | Call **`hljs.highlightElement`** on each **`pre code`** |
| Wiring | Point **`additional-js`** at a script under **`theme/`**; CDN dynamic import vs esbuild bundle |

With either option, Sui Move highlighting should work across the whole book.
