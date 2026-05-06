import vitest from "@vitest/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import neostandard from "neostandard";

export default [
  ...neostandard({ browser: true, noStyle: true }),
  {
    rules: {
      "no-console": "warn",
    },
  },
  {
    files: ["src/**/*.test.js"],
    plugins: { vitest },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
        FocusEvent: "readonly",
      },
    },
  },
  eslintConfigPrettier,
];
