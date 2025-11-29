import type { privacy as jaPrivacy } from '../ja/privacy'
import type { SameStructure } from '../type-utils'

export const privacy: SameStructure<typeof jaPrivacy> = {
  title: 'Privacy Policy',
  description: 'Learn about our handling of personal information and data processing.',
  breadcrumb: {
    home: 'Home',
  },
} as const
