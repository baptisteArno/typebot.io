module.exports = {
  ignorePatterns: ['node_modules'],
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'react/no-unescaped-entities': [0],
    'react/display-name': [0],
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
