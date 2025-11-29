import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { generateToolMetadata } from '@/lib/metadata'

export async function generateMetadata ({ params }: { params: Promise<{ locale: 'ja' | 'en' }> }): Promise<Metadata> {
  const { locale } = await params
  return generateToolMetadata('favicon-generator', '/favicon-generator', locale)
}

export default function FaviconGeneratorLayout ({ children }: { children: ReactNode }) {
  return children
}
