import { test, expect } from "@playwright/test";

test("solving a puzzle from start to completion", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Enter your cryptogram").fill("Uifsf jt op tqppo.");
  await page.getByRole("button", { name: "Start" }).click();

  const puzzleInputs = page.locator(".solution__input");
  await expect(puzzleInputs).toHaveCount(14);

  const solution = "There is no spoon.".toUpperCase().replace(/[^A-Z]/g, "");
  const cipher = "Uifsf jt op tqppo".toUpperCase().replace(/[^A-Z]/g, "");

  for (let i = 0; i < cipher.length; i++) {
    await puzzleInputs.nth(i).fill(solution[i]);
  }

  await expect(page.locator(".solution")).toHaveClass(/solution--complete/);
  await expect(page.locator('[data-letter="T"]')).toHaveClass(/used/);
});

test("clear resets the guessed letters without leaving the puzzle", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel("Enter your cryptogram").fill("Uifsf jt op tqppo.");
  await page.getByRole("button", { name: "Start" }).click();

  const puzzleInputs = page.locator(".solution__input");
  await puzzleInputs.first().fill("T");
  await expect(puzzleInputs.first()).toHaveValue("T");

  await page.getByRole("button", { name: "Clear" }).click();

  await expect(puzzleInputs.first()).toHaveValue("");
  await expect(page.locator(".solution")).toBeVisible();
});

test("new puzzle returns to the entry screen", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Enter your cryptogram").fill("Uifsf jt op tqppo.");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.locator(".solution__input").first()).toBeVisible();

  await page.getByRole("button", { name: "New puzzle" }).click();

  await expect(page.getByLabel("Enter your cryptogram")).toBeVisible();
  await expect(page.getByLabel("Enter your cryptogram")).toHaveValue("");
});
