import { describe, it, expect, beforeEach } from "vitest";
import { show, hide, empty } from "./utilities";

describe("utilities", () => {
  let el;

  beforeEach(() => {
    el = document.createElement("div");
  });

  describe("show", () => {
    it("removes the hidden attribute", () => {
      el.setAttribute("hidden", "");
      show(el);
      expect(el.hasAttribute("hidden")).toBe(false);
    });

    it("is a no-op when element is already visible", () => {
      show(el);
      expect(el.hasAttribute("hidden")).toBe(false);
    });
  });

  describe("hide", () => {
    it("sets the hidden attribute", () => {
      hide(el);
      expect(el.hasAttribute("hidden")).toBe(true);
    });

    it("is a no-op when element is already hidden", () => {
      el.setAttribute("hidden", "");
      hide(el);
      expect(el.hasAttribute("hidden")).toBe(true);
    });
  });

  describe("empty", () => {
    it("removes all child elements", () => {
      el.innerHTML = "<span>a</span><p>b</p>";
      empty(el);
      expect(el.innerHTML).toBe("");
    });

    it("is a no-op when element is already empty", () => {
      empty(el);
      expect(el.innerHTML).toBe("");
    });
  });
});
