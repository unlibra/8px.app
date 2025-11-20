'use client'

import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { ChevronDownIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useCallback, useState } from 'react'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { FullPageDropZone } from '@/components/ui/full-page-drop-zone'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { getToolById } from '@/config/tools'
import { useColorHistory } from '@/contexts/color-history-context'
import { hexToCmyk, hexToHsl, hexToRgb } from '@/lib/color/color-utils'
import { validateImageFile } from '@/lib/file/file-validation'
import { loadImageFromFile } from '@/lib/image/image-processing'

type ExtractedColor = {
  hex: string
  percentage: number
}

export default function ImagePalettePage () {
  const tool = getToolById('image-palette')
  const toast = useToast()
  const { addColor } = useColorHistory()

  // State
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [colorCount, setColorCount] = useState(6)
  const [selectedFormat, setSelectedFormat] = useState<'hex' | 'rgb' | 'hsl' | 'cmyk'>('hex')

  // Handle file drop/select
  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) return

    // Validate file
    const error = await validateImageFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxDimensions: { width: 4096, height: 4096 }
    })

    if (error) {
      toast.error(error)
      return
    }

    setImageFile(file)
    setExtractedColors([])

    // Create preview
    try {
      const image = await loadImageFromFile(file)
      setImagePreview(image.src)
    } catch (err) {
      toast.error('画像の読み込みに失敗しました')
      console.error('Failed to load image:', err)
    }
  }, [toast])

  // Extract colors from image
  const handleExtractColors = useCallback(async () => {
    if (!imageFile) return

    setIsProcessing(true)

    try {
      // TODO: Call backend API for k-means++ color extraction
      // For now, show placeholder message
      toast.info('バックエンドAPIは開発中です')

      // Placeholder: will be replaced with actual API call
      setExtractedColors([])
    } catch (err) {
      toast.error('色の抽出に失敗しました')
      console.error('Failed to extract colors:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [imageFile, toast])

  // Get formatted color string
  const getFormattedColor = useCallback((hex: string) => {
    switch (selectedFormat) {
      case 'hex':
        return hex.toUpperCase()
      case 'rgb': {
        const rgb = hexToRgb(hex)
        return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : hex.toUpperCase()
      }
      case 'hsl': {
        const hsl = hexToHsl(hex)
        return hsl ? `hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)` : hex.toUpperCase()
      }
      case 'cmyk': {
        const cmyk = hexToCmyk(hex)
        return cmyk ? `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` : hex.toUpperCase()
      }
    }
  }, [selectedFormat])

  // Copy color to clipboard
  const handleCopyColor = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(getFormattedColor(hex))
      addColor(hex)
      toast.success('クリップボードにコピーしました')
    } catch (err) {
      toast.error('コピーに失敗しました')
      console.error('Failed to copy:', err)
    }
  }, [toast, addColor, getFormattedColor])

  // Select format
  const handleSelectFormat = useCallback((format: 'hex' | 'rgb' | 'hsl' | 'cmyk') => {
    setSelectedFormat(format)
  }, [])

  // Clear image
  const handleClear = useCallback(() => {
    setImageFile(null)
    setImagePreview(null)
    setExtractedColors([])
  }, [])

  return (
    <FullPageDropZone
      onFileDrop={handleFileSelect}
      accept='image/*'
    >
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: tool?.name ?? 'イメージパレット+' }
        ]}
      />

      <div className='mx-auto max-w-screen-sm lg:max-w-screen-xl'>
        <div className='mb-8 space-y-4'>
          <h1 className='text-2xl font-semibold'>{tool?.name ?? 'イメージパレット+'}</h1>
          <p className='text-gray-600 dark:text-gray-400'>
            {tool?.description ?? ''}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className='flex flex-col gap-12 lg:grid lg:grid-cols-2'>
          {/* Left Column - Input */}
          <div className='space-y-8'>
            {/* Image Upload */}
            <section>
              <h6 className='mb-4 text-sm font-semibold'>画像アップロード</h6>
              {!imagePreview
                ? (
                  <label className='flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 transition-colors hover:border-sky-500 hover:bg-sky-50 dark:border-gray-600 dark:bg-atom-one-dark-light dark:hover:border-sky-500 dark:hover:bg-atom-one-dark-lighter'>
                    <PhotoIcon className='mb-4 size-12 text-gray-400' />
                    <span className='mb-2 text-sm font-medium text-gray-600 dark:text-gray-400'>
                      クリックまたはドラッグ&ドロップで画像をアップロード
                    </span>
                    <span className='text-xs text-gray-500 dark:text-gray-500'>
                      JPEG, PNG, WebP, SVG (最大10MB)
                    </span>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                      className='hidden'
                    />
                  </label>
                  )
                : (
                  <div className='space-y-4'>
                    <div className='relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700'>
                      <img
                        src={imagePreview}
                        alt='Uploaded preview'
                        className='max-h-80 w-full object-contain'
                      />
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={handleClear}
                        className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-atom-one-dark-lighter'
                      >
                        クリア
                      </button>
                      <label className='cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-atom-one-dark-lighter'>
                        別の画像を選択
                        <input
                          type='file'
                          accept='image/*'
                          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                          className='hidden'
                        />
                      </label>
                    </div>
                  </div>
                  )}
            </section>

            {/* Settings */}
            <section>
              <h6 className='mb-4 text-sm font-semibold'>設定</h6>
              <div className='space-y-4'>
                {/* Color Count */}
                <div>
                  <label className='mb-2 block text-sm text-gray-600 dark:text-gray-400'>
                    抽出する色の数: {colorCount}
                  </label>
                  <input
                    type='range'
                    min={2}
                    max={12}
                    value={colorCount}
                    onChange={(e) => setColorCount(Number(e.target.value))}
                    className='w-full'
                  />
                </div>
              </div>
            </section>

            {/* Extract Button */}
            <button
              onClick={handleExtractColors}
              disabled={!imageFile || isProcessing}
              className='w-full rounded-lg bg-sky-500 px-4 py-3 font-medium text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700'
            >
              {isProcessing
                ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Spinner className='size-5' />
                    処理中...
                  </span>
                  )
                : (
                    '色を抽出'
                  )}
            </button>
          </div>

          {/* Right Column - Output */}
          <div className='space-y-8'>
            {/* Format Selector */}
            <section className='flex items-center justify-between'>
              <h6 className='text-sm font-semibold'>抽出されたカラーパレット</h6>
              <Popover className='relative'>
                {({ open }) => (
                  <>
                    <PopoverButton className='flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium uppercase outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'>
                      {selectedFormat}
                      <ChevronDownIcon className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </PopoverButton>
                    <Transition
                      enter='transition duration-100 ease-out'
                      enterFrom='transform scale-95 opacity-0'
                      enterTo='transform scale-100 opacity-100'
                      leave='transition duration-100 ease-out'
                      leaveFrom='transform scale-100 opacity-100'
                      leaveTo='transform scale-95 opacity-0'
                    >
                      <PopoverPanel className='absolute right-0 z-50 mt-2 w-32'>
                        <div className='overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-atom-one-dark-light'>
                          {(['hex', 'rgb', 'hsl', 'cmyk'] as const).map((format) => (
                            <button
                              key={format}
                              onClick={() => handleSelectFormat(format)}
                              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm uppercase outline-none transition-colors ${selectedFormat === format
                                  ? 'bg-sky-50 font-medium dark:bg-atom-one-dark-lighter'
                                  : 'hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter dark:focus-visible:bg-atom-one-dark-lighter'
                                }`}
                            >
                              {format}
                            </button>
                          ))}
                        </div>
                      </PopoverPanel>
                    </Transition>
                  </>
                )}
              </Popover>
            </section>

            {/* Extracted Colors */}
            {extractedColors.length > 0
              ? (
                <div className='space-y-2'>
                  {extractedColors.map((color, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-atom-one-dark-lighter'
                    >
                      {/* Color Swatch */}
                      <button
                        onClick={() => handleCopyColor(color.hex)}
                        className='size-12 flex-shrink-0 cursor-pointer rounded-lg shadow-sm outline-none transition-transform hover:scale-110 focus-visible:scale-110 active:scale-95'
                        style={{ backgroundColor: color.hex }}
                        title='クリックでコピー'
                      />

                      {/* Color Info */}
                      <div className='flex-1'>
                        <div className='font-mono text-sm font-medium'>
                          {getFormattedColor(color.hex)}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {color.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )
              : (
                <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-12 text-center dark:border-gray-700'>
                  <PhotoIcon className='mb-4 size-12 text-gray-300 dark:text-gray-600' />
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    画像をアップロードして「色を抽出」ボタンをクリックしてください
                  </p>
                </div>
                )}
          </div>
        </div>
      </div>
    </FullPageDropZone>
  )
}
