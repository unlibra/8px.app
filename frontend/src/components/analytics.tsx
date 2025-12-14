'use client'

import { Analytics as VercelAnalytics } from '@vercel/analytics/next'

export function Analytics() {
  return (
    <VercelAnalytics
      beforeSend={(event) => {
        const url = new URL(event.url)
        if (!url.pathname.startsWith('/lab')) {
          url.pathname = `/lab${url.pathname}`
        }
        return { ...event, url: url.toString() }
      }}
    />
  )
}
