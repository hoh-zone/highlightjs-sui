/**
 * mdBook + highlightjs-sui — copy this file to your book's `theme/` and list it under
 * `[output.html] additional-js` in `book.toml`.
 *
 * mdBook ships Highlight.js 10.x, which only has `hljs.highlightBlock`, not `hljs.highlightElement`
 * (that API is v11+). Re-highlighting must use the helper below.
 */
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
