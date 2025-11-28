import type { ReactNode } from 'react'

import { SupportSection } from '@/components/layout/support-section'

export default function WithSupportLayout ({ children }: { children: ReactNode }) {
  return (
    <>
      <div className='bg-white dark:bg-atom-one-dark'>
        {children}
      </div>
      <SupportSection />
    </>
  )
}
