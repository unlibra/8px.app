export const siteConfig = {
  name: '8px.app',
  url: 'https://8px.app',
  description: `その色も、そのアイコンも、思い通りに。
Favicon生成、カラーパレット作成、SVG最適化など、Web・アプリ開発者のための無料ツールセット。
アカウント登録不要、すぐに使えます。`,
  heroDescription: `その色も、そのアイコンも、思い通りに。
Web・アプリ開発者のためのツールセット。
すべて無料、すべてオープンソース。`,
  author: 'unlibra',
  title: {
    default: '8px.app - Developer Toolkit',
    template: '%s | 8px.app'
  },
  locale: 'ja_JP',
  links: {
    github: process.env.NEXT_PUBLIC_GITHUB_URL || '',
    sponsor: process.env.NEXT_PUBLIC_SPONSOR_URL || ''
  }
} as const

export type SiteConfig = typeof siteConfig
