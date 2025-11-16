import tseslint from '@typescript-eslint/eslint-plugin'
import nextPlugin from '@next/eslint-plugin-next'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tailwindcss from 'eslint-plugin-tailwindcss'
import neostandard from 'neostandard'

export default [
  // Ignore Next.js auto-generated files and config files
  {
    ignores: [
      'next-env.d.ts',
      'eslint.config.mjs',
      'next.config.ts',
      'postcss.config.mjs',
      'tailwind.config.ts'
    ]
  },

  // neostandard基本設定（TypeScript有効）
  ...neostandard({ ts: true }),

  // Next.js + 追加プラグイン
  {
    plugins: {
      '@typescript-eslint': tseslint,
      '@next/next': nextPlugin,
      'simple-import-sort': simpleImportSort,
      tailwindcss
    },
    rules: {
      // Import整列
      'simple-import-sort/imports': 'error',

      // TypeScript型インポート（neostandardに含まれる@typescript-eslintプラグインを使用）
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' }
      ],

      // JSXクォート
      'jsx-quotes': ['error', 'prefer-single'],

      // Tailwindcss設定
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'warn'
    },
    settings: {
      tailwindcss: {
        callees: ['classnames', 'clsx', 'ctl', 'cva', 'tv', 'twMerge']
      }
    }
  }
]
