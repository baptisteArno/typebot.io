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
    'prettier',
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
  plugins: ['prettier', 'react', '@typescript-eslint'],
  ignorePatterns: 'dist',
  rules: {
    'react/no-unescaped-entities': [0],
    'prettier/prettier': 'error',
    'react/display-name': [0],
    '@next/next/no-img-element': [0],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          '*/src/*',
          'src/*',
          '*/src',
          '@/features/*/*',
          '@/index',
          '!@/features/blocks/*',
          '!@/features/*/api',
        ],
      },
    ],
  },
}
