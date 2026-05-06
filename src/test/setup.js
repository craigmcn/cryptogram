// Full DOM structure required by actions.js module-level queries.
// This file runs before any test module is imported, ensuring
// document.getElementById() calls in actions.js resolve correctly.

const alphaLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  .split("")
  .map(
    (l) =>
      `<div class="alpha__letter" data-letter="${l}" data-count="0">${l}</div>`,
  )
  .join("\n    ");

document.body.innerHTML = `
  <section id="start-cryptogram">
    <form id="enter-cryptogram">
      <div>
        <div class="form__control-error" hidden></div>
        <textarea id="cryptogram-text"></textarea>
      </div>
      <button type="submit">Start</button>
    </form>
  </section>
  <section id="cryptogram-solution" class="solution"></section>
  <section id="alpha" hidden>
    ${alphaLetters}
  </section>
  <aside id="action-buttons" hidden>
    <button id="edit-button">Edit</button>
    <button id="clear-button">Clear</button>
    <button id="new-button">New puzzle</button>
  </aside>
`;
