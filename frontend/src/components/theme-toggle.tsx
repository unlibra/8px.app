'use client'

import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle () {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  // サーバーサイドではプレースホルダーを表示してレイアウトシフト回避
  if (!mounted) {
    return (
      <div className='flex items-center justify-center rounded-full p-2'>
        <div className='size-5' />
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className='flex items-center justify-center rounded-full p-2 outline-none transition hover:bg-black/5 active:bg-black/10 hover:dark:bg-white/5 active:dark:bg-white/10'
      aria-label='Toggle theme'
    >
      {theme === 'light' ? <SunIcon className='size-5' /> : <MoonIcon className='size-5' />}
    </button>
  )
}
