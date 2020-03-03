module.exports = {
  root: true,
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'airbnb'],
  rules: {
    'import/prefer-default-export': 0,
    '@typescript-eslint/no-unused-vars': 2,
    'no-extra-semi': 0,
    semi: 2,
    indent: ['warn', 2],
    quotes: [
      2,
      'single',
      {
        allowTemplateLiterals: false,
        avoidEscape: true
      }
    ],
    camelcase: 0,
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-plusplus': 0,
    'no-useless-constructor': 0, // TS has some issues with this, so we use their check
    '@typescript-eslint/no-useless-constructor': 2,
    'import/extensions': 0
  },
  parser: '@typescript-eslint/parser',
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      node: {},
      typescript: {}
    }
  },
 /*  ignorePatterns: ["dist/"], */
};
