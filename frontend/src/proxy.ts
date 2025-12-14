import { create } from '@i18n-tiny/next/proxy'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { defaultLocale, locales } from '@/lib/i18n'

const i18nProxy = create({
  locales,
  defaultLocale
})

export function proxy (request: NextRequest) {
  const { pathname } = request.nextUrl

  // Remove trailing slash and redirect (except root)
  if (pathname !== '/' && pathname.endsWith('/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(0, -1)
    return NextResponse.redirect(url, 308)
  }

  return i18nProxy(request)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
