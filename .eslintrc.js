module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true
  },
  extends: [
    'plugin:vue/essential',
    'standard',
    'prettier'
  ],
  // required to lint *.vue files
  plugins: [
    'vue',
    'prettier'
  ],
  // add your custom rules here
  rules: {
    ...require('eslint-config-prettier').rules,
    'prettier/prettier': ['error', {
      semi: true,
      singleQuote: true,
      trailingComma: 'all'
    }],
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/no-parsing-error': [2, { 'x-invalid-end-tag': false }]
  }
}
//     'vue/no-parsing-error': [2, { 'x-invalid-end-tag': false }]
//   }
// }
