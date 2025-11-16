import { ToolCard } from '@/components/tool-card'
import { categories } from '@/lib/tools'

export default function Home () {
  return (
    <div className='mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8'>
      {/* Hero Section */}
      <div className='mb-12 text-center'>
        <h1 className='mb-4 text-4xl font-bold'>
          Web Development Toolkit
        </h1>
        <p className='text-lg text-gray-500'>
          A collection of useful tools for web developers
        </p>
      </div>

      {/* Tools by Category */}
      <div className='space-y-12'>
        {categories.map((category) => (
          <div key={category.id} id={category.id}>
            {/* Category Header */}
            <div className='mb-4'>
              <h2 className='text-2xl font-semibold'>
                {category.name}
              </h2>
            </div>

            {/* Tool Cards Grid */}
            <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
              {category.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
