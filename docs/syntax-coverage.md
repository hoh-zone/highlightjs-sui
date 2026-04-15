# Sui Move syntax highlighting coverage

This package is a **regex-based Highlight.js grammar** for **Move on Sui (Move 2024 style)**. It **does not** include Aptos-specific global storage, legacy `script` / `friend` / `acquires`, or Move Prover (MSL) specification keywords.

## What is covered

- **Lexical**: nested block comments, `//`, `///` doc comments, `b"..."` / `x"..."`, numeric literals with type suffixes, `@` address literals, backtick-escaped identifiers.
- **Declarations**: `module`, `public struct`, `public(package) fun`, `entry` / `native` / `inline`, `const`, `use`, `type` aliases, `enum`, `macro fun`.
- **Move 2024 (Sui)**: `let mut`, lambdas, vector literals, `match`, labels and macro calls, `#[...]` attributes (including `syntax`).
- **Paths and calls**: `pkg::module::item`, ordinary `foo(...)` calls (`use fun` is handled separately).
- **Type annotations** (`name: Type` in structs, function params, `let` bindings): binding (`variable`), `:` (`punctuation`), type (`type`), and statement-ending `;` (`punctuation`). Regex-only; nested generics are approximated.
- **Types**: see `TYPES` in `src/languages/sui-move.js`.
- **Common short names after `use`** (functions / macros used without a module prefix): see `BUILTINS` (e.g. `sui::transfer`, `object`, `tx_context`, `std::vector`, `option`). Everything else still relies on `::` paths and normal identifier rules.

## What is not guaranteed

- Exhaustive coverage of every Sui Framework API; deeply nested generics may be incomplete.

## Maintenance

When the Sui compiler adds new reserved words, extend `KEYWORDS` and include a link to official docs plus a small example for regression testing.
