import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { getToolById } from '@/lib/tools'

const tool = getToolById('favicon-generator')

export const metadata: Metadata = tool
  ? {
      title: tool.name,
      description: tool.description,
      alternates: {
        canonical: tool.href
      },
      openGraph: {
        type: 'website',
        url: tool.href,
        title: `${tool.name} - 8px.app`,
        description: tool.description,
        siteName: '8px.app'
      },
      twitter: {
        card: 'summary',
        title: `${tool.name} - 8px.app`,
        description: tool.description
      }
    }
  : {}

export default function FaviconGeneratorLayout ({ children }: { children: ReactNode }) {
  return <>{children}</>
}
