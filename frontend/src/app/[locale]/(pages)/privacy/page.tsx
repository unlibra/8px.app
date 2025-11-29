import { readFile } from 'fs/promises'
import type { Metadata } from 'next'
import { join } from 'path'
import ReactMarkdown from 'react-markdown'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { getMessages } from '@/lib/i18n/server'

export async function generateMetadata ({ params }: { params: Promise<{ locale: 'ja' | 'en' }> }): Promise<Metadata> {
  const { locale } = await params
  const messages = await getMessages(locale)
  const privacy = messages.privacy

  return {
    title: privacy.title,
    description: privacy.description,
    alternates: {
      canonical: locale === 'ja' ? '/privacy' : '/en/privacy'
    }
  }
}

export default async function PrivacyPage ({ params }: { params: Promise<{ locale: 'ja' | 'en' }> }) {
  const { locale } = await params
  // Use object access for full TypeScript type safety
  const messages = await getMessages(locale)

  // Load markdown file
  const markdownPath = join(process.cwd(), 'src', 'messages', `privacy.${locale}.md`)
  const markdownContent = await readFile(markdownPath, 'utf-8')

  return (
    <div className='mx-auto max-w-3xl'>
      <Breadcrumb
        items={[
          { label: messages.privacy.breadcrumb.home, href: '/' },
          { label: messages.privacy.title }
        ]}
      />

      <div className='prose prose-gray dark:prose-invert max-w-none'>
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => <h1 className='mb-8 text-3xl font-bold' {...props} />,
            h2: ({ node, ...props }) => <h2 className='mb-4 mt-8 text-xl font-semibold' {...props} />,
            h3: ({ node, ...props }) => <h3 className='mb-2 mt-4 font-semibold' {...props} />,
            p: ({ node, ...props }) => <p className='leading-relaxed' {...props} />,
            ul: ({ node, ...props }) => <ul className='ml-6 mt-2 list-disc space-y-1 leading-relaxed' {...props} />,
            a: ({ node, ...props }) => (
              <a
                className='font-medium text-blue-600 underline hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                target='_blank'
                rel='noopener noreferrer'
                {...props}
              />
            ),
            hr: ({ node, ...props }) => (
              <hr className='my-8 border-t border-gray-300 dark:border-gray-700' {...props} />
            ),
            strong: ({ node, ...props }) => <strong className='font-semibold' {...props} />
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  )
}
