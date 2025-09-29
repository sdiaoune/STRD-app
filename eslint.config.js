// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
