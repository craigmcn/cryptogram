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
yarn lint             # ESLint (src/, e2e/, playwright.config.js)
yarn lint:fix         # ESLint with auto-fix
yarn test             # Vitest in watch mode
yarn test:run         # Vitest single pass (used by pre-commit hook and CI)
yarn test:coverage    # Vitest single pass with v8 coverage report → coverage/
yarn test:e2e         # Playwright E2E suite (CI only, not pre-commit)
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
e2e/
  cryptogram.spec.js   # Playwright E2E — solve/clear/new-puzzle golden paths against a real browser
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
| axe-core               | ^4            | Accessibility checks run directly against jsdom       |
| @playwright/test       | ^1            | E2E testing (Chromium only), CI-only                  |
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

| Resolution                            | Reason                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@babel/core ^7.29.6`                 | Arbitrary file read via sourceMappingURL comment (CVE low); stays on 7.x to avoid major-version surprise                                                                                                                                                                                                                                                                                                                       |
| `brace-expansion@npm:^5.0.5 → ^5.0.7` | DoS via exponential-time expansion of consecutive non-expanding `{}` groups (GHSA-3jxr-9vmj-r5cp, high), pulled in by `minimatch@10.2.5` (via `@typescript-eslint`/`glob`). Scoped to this exact descriptor — a blanket `brace-expansion` override also forces `minimatch@3.1.5`'s dependency, which uses the incompatible 1.x API (callable default export vs. 5.x's named `expand` export) and breaks brace-pattern matching |
| `ejs ^5.0.1`                          | Drops `jake`→`filelist`→`minimatch@5.x` chain (ReDoS)                                                                                                                                                                                                                                                                                                                                                                          |
| `js-yaml ^4.3.0`                      | Quadratic DoS via repeated YAML merge-key aliases (CVE medium)                                                                                                                                                                                                                                                                                                                                                                 |
| `node-gyp ^12.2.0`                    | Replaces old networking stack that included vulnerable `ip` package                                                                                                                                                                                                                                                                                                                                                            |
| `semver ^7.5.2`                       | ReDoS floor                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `serialize-javascript ^7.0.5`         | RCE/DoS fix used by `@rollup/plugin-terser`                                                                                                                                                                                                                                                                                                                                                                                    |
| `tar ^7.5.20`                         | PAX size-override file-smuggling (CVE medium)                                                                                                                                                                                                                                                                                                                                                                                  |
| `vite ^6.4.3`                         | Forces `vite-plugin-pwa` off its `^6\|\|^7\|\|^8` range (was resolving to vulnerable 8.0.8); CVE-2026-53571                                                                                                                                                                                                                                                                                                                    |

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

[src/scripts/accessibility.test.js](src/scripts/accessibility.test.js) runs `axe-core` directly against jsdom (no browser) using the real `index.html` markup — both the entry screen and a started puzzle. `color-contrast` is disabled since jsdom doesn't perform layout/rendering.

[e2e/cryptogram.spec.js](e2e/cryptogram.spec.js) is a Playwright suite (Chromium only) that drives the real dev server through the solve/clear/new-puzzle golden paths. It runs in CI only (`yarn test:e2e`), not in the pre-commit hook — browser install + startup is too slow for a hook. Excluded from Vitest's test glob via `exclude: ["e2e/**"]` in [vitest.config.js](vitest.config.js).

The pre-commit hook (`.husky/pre-commit`) runs `yarn format:check && yarn lint && yarn test:run` before every commit. The `prepare` script ensures Husky is installed automatically after `yarn install`.

The GitHub Actions workflow at [.github/workflows/test.yml](.github/workflows/test.yml) runs format:check → lint → build → test:coverage → Playwright E2E on every push to `main` and on every PR. Playwright's Chromium binary is cached by `yarn.lock` hash.

## Dependency maintenance

- Check for vulnerabilities: `yarn npm audit`
- GitHub Dependabot is enabled and will open PRs for vulnerable transitive deps
- When reviewing Dependabot PRs, check whether the alert is already resolved by a `resolutions` entry before merging redundant bumps
- Node.js target is the current Active LTS — update `.nvmrc` when a new LTS is released

## Modernization status (assessed 2026-07-13)

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
- GitHub Actions bumped to current majors — `actions/checkout@v7`, `actions/setup-node@v6`, `actions/cache@v6` (issue #70)
- axe-core accessibility testing — direct against jsdom, vanilla JS pattern; caught and fixed a real gap (solution inputs had no accessible label) (issue #71)
- Playwright E2E testing — Chromium only, CI-only, golden-path coverage of solve/clear/new-puzzle (issue #72)

**Outstanding TODOs:**

- **PR #68** (open) — security resolutions for vite, js-yaml, tar, @babel/core; awaiting review and merge
- Remaining TODOs (vite-plugin-pwa 1.x upgrade, Vite 8 upgrade, both blocked upstream) tracked as issues in the [cryptogram GitHub Project](https://github.com/users/craigmcn/projects/3)

**Key decisions:**

- TypeScript migration is not planned — intentional vanilla JS app; toolchain is otherwise current
- Prettier uses all defaults (`.prettierrc.json: {}`) — maximizes standard behavior, minimizes custom rules; `neostandard({ noStyle: true })` defers all formatting to Prettier and drops the custom `@stylistic/arrow-parens` rule
- node-modules linker chosen over PnP — aligns with all other Yarn 4 repos in the suite; also unblocked local development on Node 24.15.0 where the PnP ESM loader had an EBADF regression
- **`vite` resolution strategy** (2026-06-16) — `vite-plugin-pwa` peer dep `^6.0.0 || ^7.0.0 || ^8.0.0` caused Yarn to resolve vite 8.0.8 (vulnerable); pinning with `resolutions: { vite: "^6.4.3" }` forces it to the safe 6.x version already used as the direct dep; remove this resolution when upgrading vite-plugin-pwa to 1.x and Vite to 8+
- **esbuild Dependabot alert #93** (2026-06-16) — dismissed as "not used"; the missing binary-integrity check is in the Deno distribution only (`lib/deno/mod.ts`); Node.js esbuild uses a separate install path with SHA-256 verification
