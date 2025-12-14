import type { site as jaSite } from '../ja/site'
import type { SameStructure } from '../type-utils'

export const site: SameStructure<typeof jaSite> = {
  name: 'Lib Lab',
  author: 'unlibra',
  description:
    'Craft your perfect colors and icons. Lib Lab offers a free toolkit for web and app developers, including favicon generation, color palette creation, SVG optimization, and more. No account needed, start creating instantly.',
  heroDescription:
    'Your vision, your design.\nA comprehensive toolkit for web and app developers.\nCompletely free, entirely open source.',
  title: {
    default: 'Lib Lab - Developer Toolkit',
    template: '%s | Lib Lab',
  },
} as const
