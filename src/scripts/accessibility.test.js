// Runs axe-core directly against jsdom (no browser) using the real
// index.html markup, so violations are caught without a Playwright run.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import axe from "axe-core";
import { describe, expect, it } from "vitest";

const indexHtml = readFileSync(resolve(process.cwd(), "index.html"), "utf-8");
const bodyMarkup = indexHtml.match(/<body>([\s\S]*)<\/body>/)[1];

// jsdom doesn't perform layout/rendering, so rules that depend on it
// (color contrast, actual visibility) can't be evaluated meaningfully.
const axeOptions = {
  rules: {
    "color-contrast": { enabled: false },
  },
};

describe("accessibility", () => {
  it("has no axe violations on the initial start screen", async () => {
    document.body.innerHTML = bodyMarkup;
    await import("./index.js");

    const results = await axe.run(document.body, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("has no axe violations once a puzzle is started", async () => {
    document.body.innerHTML = bodyMarkup;
    const { start } = await import("./actions.js");

    document.getElementById("cryptogram-text").value = "Uifsf jt op tqppo.";
    start({ preventDefault: () => {} });

    const results = await axe.run(document.body, axeOptions);
    expect(results.violations).toEqual([]);
  });
});
