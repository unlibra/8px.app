'use client'

import NextLink from 'next/link'
import type { ComponentProps } from 'react'

import { useLocalizedPath } from './client'

/**
 * Link component with automatic locale handling
 * Uses the current locale from I18nProvider to generate localized paths
 *
 * @example
 * import { Link } from '@8pxapp/i18n/link'
 * <Link href='/iromide'>Iromide</Link>
 */
export function Link ({ href, ...props }: ComponentProps<typeof NextLink>) {
  const getPath = useLocalizedPath()
  const localizedHref = typeof href === 'string' ? getPath(href) : href

  return <NextLink href={localizedHref} {...props} />
}
