// eslint.config.js
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import playwrightPlugin from 'eslint-plugin-playwright';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      playwright: playwrightPlugin,
    },
    rules: {
      // TypeScript Best Practices
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      // Playwright Best Practices
      'playwright/no-wait-for-timeout': 'error', // Prevent hard-coded waits
      'playwright/no-element-handle': 'warn', // Discourage deprecated ElementHandle
      'playwright/no-eval': 'error', // Prevent page.evaluate() without good reason
      'playwright/no-focused-test': 'error', // Prevent test.only in commits
      'playwright/no-skipped-test': 'warn', // Warn on test.skip
      'playwright/valid-expect': 'error', // Ensure proper expect usage
      'playwright/prefer-web-first-assertions': 'error', // Use web-first assertions
      'playwright/no-useless-await': 'error', // Remove unnecessary awaits
      'playwright/no-page-pause': 'warn', // Warn on page.pause() (debug tool)

      // General Best Practices
      'no-console': 'warn', // Discourage console.log in tests
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      // Test-specific overrides
      'playwright/expect-expect': 'error', // Ensure tests have assertions
      'playwright/no-conditional-in-test': 'warn', // Avoid conditionals in tests
    },
  },
];
