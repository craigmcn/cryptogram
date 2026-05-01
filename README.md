# Cryptogram

[![Netlify Status](https://api.netlify.com/api/v1/badges/8a03004e-aa0e-40bf-a3c3-de7bfc5359dc/deploy-status)](https://app.netlify.com/sites/agitated-nightingale-d3b1fa/deploys)

A handy helper for solving cryptogram puzzles — track your letter substitutions without crossing things out on paper.

## Using the app

A cryptogram is a short piece of encrypted text where each letter of the alphabet has been substituted for another. To decode it, you work out which cipher letter maps to which real letter, usually by recognising common words and patterns.

### Getting started

1. Paste your cipher text into the text area and click **Start**
2. Each letter in the puzzle appears as an input field — type your guessed solution letter into it
3. All instances of the same cipher letter update together, so you only need to type each guess once
4. The alphabet tracker at the bottom highlights which solution letters you've used:
   - A letter turns **blue** when it has been assigned to one cipher letter
   - It turns **red** if you've accidentally assigned it to more than one — a reminder that each solution letter can only appear once in a valid substitution cipher
5. Use **Clear** to wipe your guesses and start the solution over without re-entering the puzzle
6. Use **Edit** to go back and correct the cipher text
7. Use **New puzzle** to start fresh with a new cryptogram

Your progress is saved automatically and restored if you close and reopen the page.

### Install as an app (PWA)

The app can be installed on your device and used offline.

**On desktop (Chrome, Edge):** click the install icon in the address bar, or open the browser menu and choose *Install Cryptogram*.

**On iOS (Safari):** tap the Share button, then *Add to Home Screen*.

**On Android (Chrome):** tap the browser menu and choose *Add to Home Screen* or *Install app*.

Once installed, the app runs in its own window without browser chrome and works fully offline. When a new version is available it will prompt you to reload.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 24.x LTS (see `.nvmrc`)
- [Yarn](https://yarnpkg.com/) 4.x — run `corepack enable` to activate

### Install

```bash
yarn install
```

### Commands

```bash
yarn dev           # dev server at http://localhost:3050
yarn build         # production build → dist/
yarn preview       # preview the production build locally
yarn lint          # ESLint
yarn lint:fix      # ESLint with auto-fix
yarn test          # Vitest in watch mode
yarn test:run      # Vitest single pass
yarn test:coverage # Vitest with v8 coverage report
```

For architecture and codebase details, see [CLAUDE.md](CLAUDE.md).
