module.exports = {
  extends: [
    'next',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          '*/src/*',
          'src/*',
          '*/src',
          '@/features/*/*',
          '!@/features/blocks/*',
          '!@/features/*/api',
        ],
      },
    ],
    '@typescript-eslint/no-namespace': 'off',
  },
}
