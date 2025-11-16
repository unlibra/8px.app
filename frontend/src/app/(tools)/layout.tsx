'use client'

import { usePathname } from 'next/navigation'

import { Breadcrumb } from '@/components/breadcrumb'
import { tools } from '@/lib/tools'

export default function ToolsLayout ({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // パスからツール情報を取得
  const currentTool = tools.find(tool => tool.href === pathname)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    ...(currentTool ? [{ label: currentTool.name }] : [])
  ]

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8'>
      {/* Breadcrumb */}
      <div className='mb-6'>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Tool Content */}
      {children}
    </div>
  )
}
