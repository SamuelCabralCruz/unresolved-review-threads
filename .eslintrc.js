module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  ignorePatterns: ['node_modules', 'lib', 'dist', 'coverage'],
  plugins: ['@typescript-eslint', 'prettier', 'import', 'simple-import-sort', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'sort-imports': 'off',
    'import/order': 'off',
    'import/no-unresolved': 'off',
    'unused-imports/no-unused-imports-ts': 'error',
    'import/no-extraneous-dependencies': 'error',
  },
  overrides: [
    {
      files: ['test/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': ['off'],
        '@typescript-eslint/explicit-module-boundary-types': ['off'],
        '@typescript-eslint/no-non-null-assertion': ['off'],
      },
    },
    {
      files: ['*.js', '*.ts'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // Side effect imports and packages
              ['^\\w', '^@[^\\/]\\w'],
              // Null imports - Anything without a from
              ['^\\u0000'],
              // Internal packages aliases
              ['^@/'],
              // Absolute imports - Anything that does not start with a dot
              ['^[^.]'],
              // Parent imports. Put '..' last
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Other relative imports - Put same-folder imports and '.' last
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ],
          },
        ],
      },
    },
  ],
}
