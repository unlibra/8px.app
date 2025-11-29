import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { generateToolMetadata } from '@/lib/metadata'

export async function generateMetadata ({ params }: { params: Promise<{ locale: 'ja' | 'en' }> }): Promise<Metadata> {
  const { locale } = await params
  return generateToolMetadata('svg-optimizer', '/svg-optimizer', locale)
}

export default function SvgOptimizerLayout ({ children }: { children: ReactNode }) {
  return children
}
