// import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
// import ts-standard from 'ts-standard'

export default [
  {
    files: ['**/*.ts']
  },
  {
    plugins: {
    //   '@typescript-eslint': typescriptEslint
      // standard
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module'
    },

    rules: {
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase']
        }
      ],

      curly: 'warn',
      eqeqeq: 'warn',
      'no-throw-literal': 'warn',
      semi: 'warn'
    }
  }
]