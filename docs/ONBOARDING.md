# Onboarding Guide

Welcome! This document explains how the Cryptogram codebase works, in plain English,
for developers who are new to the project (or new-ish to web development in general).
It complements [CLAUDE.md](../CLAUDE.md), which is a terse, current-state reference —
this doc is the guided tour that gets you to the point where CLAUDE.md makes sense at
a glance.

If you just want the "what does each file do" cheat sheet, CLAUDE.md's Architecture
section already has that. This doc instead answers: _why is the code shaped this way,
and how do the pieces fit together when someone actually solves a puzzle?_

---

## 1. What this app actually is

A single-page tool for solving [cryptogram](https://en.wikipedia.org/wiki/Cryptogram)
puzzles — the kind of newspaper puzzle where every letter in a piece of text has been
substituted for another letter, and you have to work out the substitution. There's no
backend, no accounts, no network calls at runtime at all (other than loading the app's
own static files and Font Awesome's icon kit). Everything the app needs to remember —
the puzzle text and your guesses so far — lives in the browser's `localStorage`.

**No React, no Vue, no framework at all.** [index.js](../src/scripts/index.js) wires a
handful of DOM event listeners directly to functions in
[actions.js](../src/scripts/actions.js), which read and write the DOM by hand
(`innerHTML`, `classList`, `dataset`) rather than through any virtual-DOM diffing. For
an app this small — one screen, one piece of state — that's a deliberate choice: a
framework would add build complexity without solving a problem this app actually has.

---

## 2. The mental model: one HTML shell, two visible states

[index.html](../index.html) is a _static_ file — Vite doesn't generate or template it.
Every section the app can ever show is already present in the markup:

- `#start-cryptogram` — the textarea where you paste in the cipher text
- `#cryptogram-solution` — the puzzle grid (built by JS, empty until a puzzle starts)
- `#alpha` — the A–Z letter tracker along the bottom
- `#action-buttons` — Edit / Clear / New puzzle

JS never creates or destroys these sections — it only toggles a `hidden` attribute via
[utilities.js](../src/scripts/utilities.js)'s `show`/`hide` helpers, and fills
`#cryptogram-solution` with generated markup via `empty` + `innerHTML`. So at any point
there are really only two states: "entering a puzzle" and "solving a puzzle" — see
`restart()` and `initCryptogram()` in
[actions.js](../src/scripts/actions.js) for where each state is assembled.

---

## 3. How solving actually works

This is the part that's worth tracing through once, because it explains most of the
interesting logic in [actions.js](../src/scripts/actions.js).

1. **You paste cipher text and hit Start.** `start()` saves the raw text to the store
   and calls `initCryptogram()`.
2. **`initCryptogram()` builds the grid.** It walks the cipher text character by
   character. Each letter becomes a real `<input>` — separately addressable, keyboard
   accessible, and given an `aria-label` — tagged with `data-puzzle="<cipher letter>"`
   so the app knows which cipher letter it belongs to. Punctuation and spaces are
   rendered as plain (HTML-escaped) text, not inputs.
3. **Typing in one input updates every input for that cipher letter.** A cryptogram's
   defining rule is that one cipher letter always maps to one solution letter,
   everywhere it appears. So the `input` event handler doesn't just update the input
   you typed in — it looks up every other `<input data-puzzle="X">` on the page and
   sets them all to the same value, and persists that mapping via `setStore()`.
4. **The A–Z tracker (`#alpha`) counts usage, not correctness.** The app has no idea
   what the "right" answer is — it can't, since it never sees the plaintext. What it
   _can_ detect is a contradiction: if you've assigned the same solution letter (say,
   "E") to two different cipher letters, that's necessarily wrong, since a
   substitution cipher is one-to-one. `updateCount()` tracks how many cipher letters
   currently map to each solution letter; `resetAlphabet()` and the `used`/`error`
   CSS classes are what make a letter light up green (used once, fine) or red (used
   more than once, contradiction) in the tracker.
5. **"Complete" means every input is filled and there are no contradictions.**
   `setComplete()` checks both conditions and toggles `.solution--complete`, which is
   purely a styling hook (see [styles.scss](../src/styles/styles.scss)) — the app
   doesn't validate that you actually solved the puzzle correctly, just that you've
   made a self-consistent guess for every letter.

---

## 4. State: a single object in `localStorage`

[store.js](../src/scripts/store.js) is intentionally tiny. The whole app's state is
one object:

```js
{
  text: "",         // the raw cipher text, as pasted
  letters: {         // cipher letter -> your current guess, all 26 letters always present
    A: "", B: "", … Z: ""
  }
}
```

`getStore()`/`setStore()` read and write this as JSON under the key `"cryptogram"`.
`setStore()` always merges into the existing `letters` object rather than replacing it
wholesale, so a single keystroke only ever touches the one letter that changed. This
is also why `defaultStore.letters` pre-populates all 26 letters as empty strings up
front — code elsewhere (like the alphabet tracker) can always assume every letter key
exists, no `undefined` checks needed.

Because this is `localStorage` and not React state, there's no reactivity — nothing
automatically re-renders when the store changes. Every place that changes the store
also directly updates the relevant bit of the DOM in the same breath (see the `input`
listener in `initCryptogram()` for the clearest example of this pairing).

**Restoring on load:** `load()` runs once at startup ([index.js](../src/scripts/index.js)
calls it after wiring listeners) and re-runs `initCryptogram()` if a puzzle was already
in progress, so refreshing the page or reopening the tab picks up exactly where you
left off.

---

## 5. The PWA layer

[pwa.js](../src/scripts/pwa.js) is a thin wrapper around `vite-plugin-pwa`'s
`virtual:pwa-register`, wired to the `#notification`/`#reload` markup already sitting
in `index.html`. It's deliberately _not_ using the default "silently reload on new
version" behavior (`registerType: "prompt"` in
[vite.config.ts](../vite.config.ts) instead of the default `autoUpdate`) — a silent
reload mid-solve would be a bad experience if it happened while you were mid-keystroke.
Instead, a banner appears and you choose when to reload. This only matters once the
app is actually deployed and served over a real origin; in local dev you'll rarely see
it fire.

---

## 6. Tests as a map of behavior

Because this is vanilla JS with no framework, the test files are one of the best ways
to see the app's behavior enumerated explicitly:

- [actions.test.js](../src/scripts/actions.test.js) — the biggest file, and the one
  worth reading first if you want to see every interaction (typing, clearing,
  restarting, contradiction detection) exercised against a real jsdom DOM.
- [store.test.js](../src/scripts/store.test.js) — the small set of storage read/write
  behaviors described in section 4.
- [utilities.test.js](../src/scripts/utilities.test.js) — the `show`/`hide`/`empty`
  helpers.
- [index.test.js](../src/scripts/index.test.js) — confirms the DOM event listeners in
  `index.js` are wired to the right action functions, using mocks rather than real
  DOM interaction.
- [accessibility.test.js](../src/scripts/accessibility.test.js) — runs `axe-core`
  directly against the real `index.html` markup (both the entry screen and a started
  puzzle) inside jsdom, no browser needed. This is what caught the missing
  `aria-label`s on the solution inputs mentioned above.
- [e2e/cryptogram.spec.js](../e2e/cryptogram.spec.js) — a Playwright suite that drives
  an actual Chromium browser through the same golden paths (solve, clear, new puzzle),
  as a check that jsdom's approximation of the DOM hasn't missed something real
  browsers do differently. Runs in CI only, not the pre-commit hook.

Coverage is 100% across statements/branches/functions/lines, so if you add behavior
without a matching test, `yarn test:coverage` will tell you exactly what's uncovered.

---

## 7. Where to go next

- [CLAUDE.md](../CLAUDE.md) — commands, toolchain versions, dependency notes, current
  modernization status.
- [docs/HISTORY.md](HISTORY.md) _(if present)_ — dated write-ups of past feature work
  and checkpoints, kept separate from CLAUDE.md so the current-state doc doesn't grow
  without bound.
- The [cryptogram GitHub Project](https://github.com/users/craigmcn/projects/3) — open
  TODOs and planned work.
