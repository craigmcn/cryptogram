import vitest from '@vitest/eslint-plugin'
import neostandard from 'neostandard'

export default [
  ...neostandard({ browser: true }),
  {
    rules: {
      '@stylistic/arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
      'no-console': 'warn',
    },
  },
  {
    files: ['src/**/*.test.js'],
    plugins: { vitest },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
        FocusEvent: 'readonly',
      },
    },
  },
]
