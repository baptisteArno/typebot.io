module.exports = {
  extends: ['next', 'prettier'],
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
  },
}
