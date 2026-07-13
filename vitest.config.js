import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    exclude: [...configDefaults.exclude, "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/scripts/**"],
      exclude: ["**/*.test.js", "src/test/**"],
    },
  },
});
