import { describe, it, expect, beforeEach } from "vitest";
import {
  STORAGEID,
  defaultStore,
  getStore,
  setStore,
  deleteStore,
} from "./store";

describe("store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("defaultStore", () => {
    it("has empty text", () => {
      expect(defaultStore.text).toBe("");
    });

    it("has all 26 letters mapped to empty strings", () => {
      expect(Object.keys(defaultStore.letters)).toHaveLength(26);
      expect(Object.values(defaultStore.letters).every((v) => v === "")).toBe(
        true,
      );
    });
  });

  describe("getStore", () => {
    it("returns defaultStore when localStorage is empty", () => {
      expect(getStore()).toEqual(defaultStore);
    });

    it("returns parsed value from localStorage", () => {
      const data = {
        text: "XYZ",
        letters: { ...defaultStore.letters, A: "B" },
      };
      localStorage.setItem(STORAGEID, JSON.stringify(data));
      expect(getStore()).toEqual(data);
    });
  });

  describe("setStore", () => {
    it("saves text to localStorage", () => {
      setStore({ text: "hello" });
      expect(getStore().text).toBe("hello");
    });

    it("allows setting text to empty string", () => {
      setStore({ text: "hello" });
      setStore({ text: "" });
      expect(getStore().text).toBe("");
    });

    it("preserves existing text when only letters are updated", () => {
      setStore({ text: "puzzle" });
      setStore({ letters: { A: "B" } });
      expect(getStore().text).toBe("puzzle");
    });

    it("merges letters into existing store", () => {
      setStore({ letters: { A: "B" } });
      setStore({ letters: { C: "D" } });
      const { letters } = getStore();
      expect(letters.A).toBe("B");
      expect(letters.C).toBe("D");
      expect(letters.Z).toBe("");
    });

    it("overwrites an existing letter mapping", () => {
      setStore({ letters: { A: "B" } });
      setStore({ letters: { A: "C" } });
      expect(getStore().letters.A).toBe("C");
    });

    it("clears a letter mapping", () => {
      setStore({ letters: { A: "B" } });
      setStore({ letters: { A: "" } });
      expect(getStore().letters.A).toBe("");
    });

    it("preserves existing letters when only text is updated", () => {
      setStore({ letters: { A: "B" } });
      setStore({ text: "new text" });
      expect(getStore().letters.A).toBe("B");
    });
  });

  describe("deleteStore", () => {
    it("removes the store from localStorage", () => {
      setStore({ text: "test" });
      deleteStore();
      expect(localStorage.getItem(STORAGEID)).toBeNull();
    });

    it("is a no-op when store does not exist", () => {
      deleteStore();
      expect(localStorage.getItem(STORAGEID)).toBeNull();
    });
  });
});
