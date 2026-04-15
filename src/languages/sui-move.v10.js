/**
 * Same implementation as the main entry (`sui-move.js`). The grammar detects
 * highlight.js v10 vs v11+ at runtime; this path remains for older import paths.
 *
 * @type {import('highlight.js').LanguageFn}
 */
module.exports = require('./sui-move.js');
