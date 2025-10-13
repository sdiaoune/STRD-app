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
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#|^rgb\(|^rgba\(/]",
          message: 'Color literals are banned. Use tokens from theme/colors.',
        },
        {
          selector: "Property[key.name='fontSize'] > Literal",
          message: 'fontSize literals are banned. Use typography tokens.',
        },
        {
          selector: "Property[key.name='fontWeight'] > Literal",
          message: 'fontWeight literals are banned. Use typography tokens.',
        },
        {
          selector: "Property[key.name='borderRadius'] > Literal",
          message: 'borderRadius literals are banned. Use radius tokens.',
        },
      ],
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
