import neostandard from 'neostandard'

export default [
  ...neostandard({ browser: true }),
  {
    rules: {
      '@stylistic/indent': ['error', 4, { SwitchCase: 1 }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
      'no-console': 'warn',
    },
  },
]
