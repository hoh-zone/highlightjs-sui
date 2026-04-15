# Using highlightjs-sui with mdBook

[mdBook](https://rust-lang.github.io/mdBook/) uses [Highlight.js](https://highlightjs.org/) for code blocks, but **Sui Move is not in the default language list**. After wiring in **highlightjs-sui**, fenced blocks with ` ```sui-move ` can be highlighted.

---

## Why highlighting often “does nothing” (important)

Up to at least mdBook **0.4.x**, the built-in theme ships **Highlight.js 10.1.1**. In that version:

- The correct API to (re-)highlight a `<code>` node is **`hljs.highlightBlock(element)`**.
- **`hljs.highlightElement` does not exist** (it was added in Highlight.js **11**).

If your integration script only calls **`highlightElement`**, the browser will throw (e.g. `highlightElement is not a function`) or skip re-highlighting, and **Sui Move blocks stay plain**. This is a documentation / integration mistake, not a bug in the grammar itself.

**Fix:** after `registerLanguage`, re-run highlighting with a small compatibility helper:

```javascript
function rehighlight(block) {
  if (typeof hljs.highlightElement === 'function') {
    hljs.highlightElement(block);
  } else {
    hljs.highlightBlock(block);
  }
}
```

The snippets below use this pattern. If you override **`theme/highlight.js`** with Highlight.js 11+, `highlightElement` will be used automatically.

A ready-made script lives at **[`examples/mdbook/theme/highlight-sui-move.js`](../examples/mdbook/theme/highlight-sui-move.js)** in this repository.

---

## Prerequisites

- mdBook installed (`mdbook --version` works).
- A book with `book.toml` and default HTML output (`[output.html]`).

---

## 1. Language tag in Markdown

The registered language name is **Sui Move**. Aliases include **`sui-move`**, **`move-sui`**, **`sui`**, **`move2024`**.

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

## 2. Option A: load the grammar from a CDN

Use when you have network access and are fine depending on jsDelivr / npm CDN.

**Requirement**: **`highlightjs-sui` is published on npm** (or you host the files at a reachable URL and change the import). If not published, use **Option B**.

### 2.1 Add a script

At the book root (next to `book.toml`), create `theme/highlight-sui-move.js`:

```javascript
(function () {
  function rehighlight(block) {
    if (typeof hljs.highlightElement === 'function') {
      hljs.highlightElement(block);
    } else {
      hljs.highlightBlock(block);
    }
  }

  async function registerAndHighlight() {
    if (typeof hljs === 'undefined') {
      console.warn('highlightjs-sui: global hljs not found');
      return;
    }

    const mod = await import(
      'https://cdn.jsdelivr.net/npm/highlightjs-sui@0.1.0/src/languages/sui-move.mjs'
    );
    const suiMove = mod.default;

    hljs.registerLanguage('sui-move', suiMove);
    hljs.registerLanguage('move-sui', suiMove);
    hljs.registerLanguage('sui', suiMove);
    hljs.registerLanguage('move2024', suiMove);

    document.querySelectorAll('pre code').forEach(function (block) {
      rehighlight(block);
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

- mdBook loads **`highlight.js`**, then **`book.js`** (which calls **`highlightBlock`** once for unknown languages), then your **`additional-js`**. Your script registers the grammar and **re-highlights** fenced blocks with **`rehighlight`**.
- Pin **`@0.1.0`** to the version you depend on.

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

---

## 3. Option B: bundle locally (offline or unpublished package)

Use **`esbuild`** to bundle **`highlightjs-sui`** into one IIFE that uses the existing global **`hljs`**. Do **not** bundle a second full **`highlight.js`**.

### 3.1 Install dependencies

```bash
npm init -y
npm install highlightjs-sui esbuild --save-dev
```

### 3.2 Add `scripts/mdbook-sui-bridge.js`

```javascript
const suiMove = require('highlightjs-sui');

function rehighlight(block) {
  if (typeof hljs.highlightElement === 'function') {
    hljs.highlightElement(block);
  } else {
    hljs.highlightBlock(block);
  }
}

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
    rehighlight(block);
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

```toml
[output.html]
additional-js = ["theme/highlight-sui-move.bundle.js"]
```

---

## 4. mdBook’s Highlight.js version

Default mdBook themes bundle **Highlight.js 10.x** (`hljs.highlightBlock`). If you replace **`theme/highlight.js`** with **v11+**, `hljs.highlightElement` becomes available; the **`rehighlight`** helper above supports both.

**highlightjs-sui** itself works with either v10 or v11 (it selects grammar output using **`hljs.regex`**).

---

## 5. Troubleshooting

### 5.1 No colors / script error in the console

1. Open DevTools → Console. If you see **`highlightElement is not a function`**, you are on Highlight.js 10 — use **`rehighlight`** (above) or **`highlightBlock`** only.
2. Confirm the fence uses **`sui-move`** (or an alias).
3. Confirm **`additional-js`** paths are correct and the file is not 404 under **`book/`**.
4. If using CDN `import()`, check for network / CORS / blocked CDN.

### 5.2 `hljs` is still `undefined`

Scripts load as: **`highlight.js`** → **`book.js`** → **`additional-js`**. If you changed **`theme/index.hbs`**, keep that order. See [mdBook issue #1870](https://github.com/rust-lang/mdBook/issues/1870).

### 5.3 Changing Highlight.js colors

Save a stylesheet as **`theme/highlight.css`** (see [mdBook: Syntax highlighting](https://rust-lang.github.io/mdBook/format/theme/syntax-highlighting.html)).

---

## 6. Summary

| Step | Action |
|------|--------|
| Markdown | Use ` ```sui-move ` (or aliases) |
| Register | `hljs.registerLanguage('sui-move', grammar)` after **`hljs`** exists |
| Re-highlight | Use **`highlightBlock`** on mdBook’s default hljs 10, or the **`rehighlight`** helper |
| Wiring | **`[output.html] additional-js`** → script under **`theme/`** |
