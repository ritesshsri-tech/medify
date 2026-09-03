import globals from 'globals';

/**
 * Bug-catching only. Formatting is Prettier's job, so no stylistic rules here.
 * The app is browser-side ES modules plus inline <script> in HTML; the tests
 * are CommonJS on Node.
 */
export default [
  {
    ignores: ['node_modules/**', 'Legacy pages/**', 'MedicineList/**', 'assets/**', 'data/**', 'backstop_data/**'],
  },
  {
    files: ['js/**/*.js', 'components/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn',
      'prefer-const': 'warn',
    },
  },
  {
    files: ['tests/**/*.js', 'cucumber.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      // Browser globals too: page.evaluate() callbacks are authored inline
      // here but execute inside the browser context.
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-undef': 'error',
    },
  },
];
