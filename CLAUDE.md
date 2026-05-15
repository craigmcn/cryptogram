# Cryptogram — Claude Code Guide

A vanilla JS progressive web app (PWA) for solving cryptogram puzzles. No framework. Deployed as static files.

## Commands

```bash
yarn dev              # dev server with PWA enabled (http://localhost:3050)
yarn build            # production build → dist/
yarn build:netlify    # dual build → netlify/ and netlify/cryptogram/
yarn preview          # preview the production build locally
yarn format           # Prettier — reformat all files in place
yarn format:check     # Prettier — check only (used by pre-commit hook and CI)
yarn lint             # ESLint (src/ only)
yarn lint:fix         # ESLint with auto-fix
yarn test             # Vitest in watch mode
yarn test:run         # Vitest single pass (used by pre-commit hook and CI)
yarn test:coverage    # Vitest single pass with v8 coverage report → coverage/
```

## Architecture

Single-page app. No routing, no framework, no build-time HTML generation. Vite bundles the JS and processes the SCSS; the HTML is static.

### Source layout

```
src/
  scripts/
    index.js           # Entry point — wires DOM event listeners, calls load()
    index.test.js      # Tests event listener wiring via mocked actions
    actions.js         # All DOM manipulation and user interaction logic
    actions.test.js    # Tests for all exported actions + private logic
    store.js           # localStorage read/write (key: "cryptogram")
    store.test.js      # Tests for all store operations
    utilities.js       # show/hide/empty DOM helpers
    utilities.test.js  # Tests for all utilities
  styles/
    albert.css         # Albert CSS — Craig's personal design system (normalize + tokens + layout + components + utilities)
    styles.scss        # App-specific styles, BEM-ish naming, dark mode via @media
  test/
    setup.js           # jsdom HTML fixture — runs before all tests via vitest setupFiles
index.html             # Static shell — all sections present in HTML, shown/hidden via JS
```

### How the app works

1. User pastes a cryptogram cipher text into the textarea and clicks Start
2. `initCryptogram()` in [actions.js](src/scripts/actions.js) builds the solution grid from the text — each letter gets a text input, non-letters are rendered as-is
3. Each input is bound to the cipher letter it represents (`data-puzzle` attribute); typing a guess updates all inputs sharing the same cipher letter simultaneously
4. The alphabet tracker (`#alpha`) marks a solution letter as `used` (count = 1) or `error` (count > 1, meaning it's been assigned to more than one cipher letter)
5. State is persisted to `localStorage` on every keystroke and restored on page load

### State shape

```js
{
  text: "",         // the raw cipher text
  letters: {        // cipher → solution mapping, all 26 letters
    A: "", B: "", … Z: ""
  }
}
```

## Toolchain

| Tool                   | Version       | Purpose                                               |
| ---------------------- | ------------- | ----------------------------------------------------- |
| Node.js                | 24.14.1 (LTS) | Runtime (see `.nvmrc`)                                |
| Yarn                   | 4.14.1        | Package manager (Berry/node-modules)                  |
| Vite                   | ^6            | Bundler + dev server                                  |
| Sass                   | ^1            | SCSS compilation via Vite                             |
| vite-plugin-pwa        | ^0.20         | Service worker + web manifest                         |
| ESLint                 | ^9            | Linting (flat config)                                 |
| neostandard            | ^0.13         | ESLint rule set (successor to eslint-config-standard) |
| eslint-config-prettier | ^10           | Disables ESLint formatting rules deferred to Prettier |
| Prettier               | ^3            | Code formatter (JS, HTML, CSS/SCSS, JSON, YAML, MD)   |
| Vitest                 | ^4            | Test runner (jsdom environment)                       |
| @vitest/coverage-v8    | ^4            | V8 coverage reports                                   |
| @vitest/eslint-plugin  | ^1            | ESLint globals for test files                         |
| Husky                  | ^9            | Git hooks                                             |

## Code style

Formatting is handled by **Prettier** (`.prettierrc.json`). ESLint is configured in [eslint.config.js](eslint.config.js) using `neostandard({ noStyle: true })` — stylistic rules are disabled and deferred to Prettier. `eslint-config-prettier` is appended to turn off any remaining ESLint formatting rules.

Prettier config (`.prettierrc.json`): all defaults — double quotes, semicolons, trailing commas (`"all"`), arrow parens (`"always"`).

The only custom ESLint rule is `no-console: warn`.

For test files (`src/**/*.test.js`), `@vitest/eslint-plugin` is applied to provide vitest globals (`describe`, `it`, `expect`, `vi`, etc.) and `FocusEvent` (absent from the `globals` package's browser set).

Run `yarn format:check && yarn lint` before committing. `yarn format` and `yarn lint:fix` handle auto-fixes.

`.vscode/settings.json` enables format-on-save with Prettier as the default formatter for all file types.

## Dependencies

All dependencies are `devDependencies` — nothing is shipped at runtime except the built static files.

The `resolutions` field in [package.json](package.json) pins several transitive dependencies to patched versions to satisfy security advisories. Do not remove these without checking whether the underlying packages have been updated:

| Resolution                    | Reason                                                              |
| ----------------------------- | ------------------------------------------------------------------- |
| `ejs ^5.0.1`                  | Drops `jake`→`filelist`→`minimatch@5.x` chain (ReDoS)               |
| `node-gyp ^12.2.0`            | Replaces old networking stack that included vulnerable `ip` package |
| `serialize-javascript ^7.0.5` | RCE/DoS fix used by `@rollup/plugin-terser`                         |

## Yarn (Berry)

This project uses Yarn Berry with the `node-modules` linker. Dependencies are installed into `node_modules/` (gitignored).

- `.yarn/releases/yarn-4.14.1.cjs` — the pinned Yarn binary (committed)
- `.yarn/cache/` — **not committed** (global cache is used; `enableGlobalCache: true`)

After changing dependencies, commit the updated `yarn.lock` together.

## Build output

- `yarn build` → `dist/` (standard Vite output)
- `yarn build:netlify` → `netlify/` (root) + `netlify/cryptogram/` (subdirectory for Netlify deployment under `/cryptogram/`); `netlify/` is gitignored

The `base: './'` in [vite.config.ts](vite.config.ts) ensures asset paths are relative.

## PWA

The service worker is generated by `vite-plugin-pwa` at build time. In dev, PWA is enabled (`devOptions.enabled: true`) so the service worker runs during `yarn dev`. The manifest is defined inline in [vite.config.ts](vite.config.ts).

When a new build is deployed, the service worker detects the change and shows a "new version available" notification banner (`#notification`) with a Reload button.

## Tests

Tests are co-located with source files (`*.test.js`). The jsdom environment is configured in [vitest.config.js](vitest.config.js); [src/test/setup.js](src/test/setup.js) builds the full HTML fixture that `actions.js` needs at import time (it captures DOM elements at module level).

Current coverage: **100%** statements, branches, functions, and lines.

The pre-commit hook (`.husky/pre-commit`) runs `yarn format:check && yarn lint && yarn test:run` before every commit. The `prepare` script ensures Husky is installed automatically after `yarn install`.

The GitHub Actions workflow at [.github/workflows/test.yml](.github/workflows/test.yml) runs lint and tests on every push to `main` and on every PR.

## Dependency maintenance

- Check for vulnerabilities: `yarn npm audit`
- GitHub Dependabot is enabled and will open PRs for vulnerable transitive deps
- When reviewing Dependabot PRs, check whether the alert is already resolved by a `resolutions` entry before merging redundant bumps
- Node.js target is the current Active LTS — update `.nvmrc` when a new LTS is released

## Modernization status (assessed 2026-05-06)

Cryptogram meets the cross-repo standard baseline.

**Completed:**

- Node 24, Yarn 4.14.1 (node-modules linker), ESLint 9 flat config, Vitest 4, 100% test coverage
- Prettier 3 — `eslint-config-prettier` + `neostandard({ noStyle: true })`; `.prettierrc.json: {}` (all defaults)
- `.editorconfig` — single `[*]` block covering all file types
- `.vscode/settings.json` — `formatOnSave: true`, Prettier as default formatter
- Pre-commit hook — `yarn format:check && yarn lint && yarn test:run`
- `vite.config.ts` (renamed from `.js`)
- Yarn PnP → node-modules linker (eliminates Node 24.x EBADF regression in PnP ESM loader)
- `.github/workflows/test.yml` — format:check → lint → build → test:coverage on PR + push to `main`
- `.github/CODEOWNERS` — `* @craigmcn`
- Branch protection ([ruleset](https://github.com/craigmcn/cryptogram/rules/14954844)) — 1 required approval, Admin role bypass, dismiss stale reviews, require `test` status check, block deletions + force pushes

**Outstanding TODOs:**

- [ ] **`vite-plugin-pwa` 0.20.x → 1.x** — blocked: `vite-plugin-pwa@1.2.0` pulls in `workbox-build@7.4.0` which depends on `glob@^11.0.1` (ESM-only); `glob@11` dropped CJS support
- [ ] **Vite 6 → 8** — blocked: `vite-plugin-pwa@1.2.0` peer dep only covers up to Vite 7; blocked behind the above

**Key decisions:**

- TypeScript migration is not planned — intentional vanilla JS app; toolchain is otherwise current
- Prettier uses all defaults (`.prettierrc.json: {}`) — maximizes standard behavior, minimizes custom rules; `neostandard({ noStyle: true })` defers all formatting to Prettier and drops the custom `@stylistic/arrow-parens` rule
- node-modules linker chosen over PnP — aligns with all other Yarn 4 repos in the suite; also unblocked local development on Node 24.15.0 where the PnP ESM loader had an EBADF regression
