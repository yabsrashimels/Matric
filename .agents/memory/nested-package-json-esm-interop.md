---
name: Nested package.json breaks ESM default imports
description: A stray package.json in a subdirectory (without "type":"module") changes Node's module resolution for everything under it, causing "Router.use() requires a middleware function but got a Object" style bugs even when the exporting code itself is correct.
---

Node determines whether a `.ts`/`.js` file is loaded as ESM or CommonJS by walking up
from that file to the nearest `package.json` and reading its `"type"` field. If a
project's root `package.json` has `"type": "module"` but a subdirectory (e.g.
`backend/`) gets its own `package.json` without that field, everything under that
subdirectory silently reverts to CommonJS — even though the source files look
identical and `export default X` still "compiles".

**Why this matters:** `import x from 'cjsModule'` in real ESM does NOT unwrap a
CJS module's `exports.default` the way TypeScript's `esModuleInterop` does at
compile time. Instead `x` becomes the whole `module.exports` object (e.g.
`{ default: RouterInstance, __esModule: true }`). Passing that object to
`app.use()`/`router.use()` throws `TypeError: Router.use() requires a middleware
function but got a Object` — a bug that looks like an export/import mistake in
the router file, but the router file is actually fine.

**How to apply:** When debugging "got a Object" / "got a function" middleware
errors in a Node+TS project that mixes ESM and CJS, don't just audit the
`export`/`import` statements — check for accidental/extra `package.json` files
in subdirectories (e.g. left over from a zip/build script, or manually added)
that lack a `"type"` field matching the root project's. Removing the stray file
(or aligning its `"type"`) fixes the interop without touching any application
logic.
