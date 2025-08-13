module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
  ],
  rules: {
    'prettier/prettier': 'warn', // Make prettier issues warnings instead of errors
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'no-undef': 'off', // Disable for browser globals in page.evaluate()
  },
  overrides: [
    {
      files: ['*.js'],
      env: {
        node: true,
      },
    },
    {
      files: ['features/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-undef': 'off',
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'test-results/',
    'reports/',
    'coverage/',
    'playwright-report/',
    '*.js',
  ],
};
