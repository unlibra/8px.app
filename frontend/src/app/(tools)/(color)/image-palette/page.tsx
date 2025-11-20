'use client'

import { PhotoIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useRef, useState } from 'react'

import { FullPageDropZone } from '@/components/ui/full-page-drop-zone'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { getToolById } from '@/config/tools'
import { useColorHistory } from '@/contexts/color-history-context'
import { validateImageFile } from '@/lib/file/file-validation'

type ExtractedColor = {
  hex: string
  percentage: number
}

// API base URL for color extraction
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Extract colors using backend API with k-means++
async function extractColorsFromImage (
  file: File,
  numColors: number
): Promise<ExtractedColor[]> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(
    `${API_BASE_URL}/api/colors/extract?num_colors=${numColors}`,
    {
      method: 'POST',
      body: formData
    }
  )

  if (!response.ok) {
    throw new Error('Failed to extract colors')
  }

  const data = await response.json()
  return data.colors as ExtractedColor[]
}

export default function ImagePalettePage () {
  const tool = getToolById('image-palette')
  const toast = useToast()
  const { addColor } = useColorHistory()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // State
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [wafflePreview, setWafflePreview] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)

  // Fixed color count for simplicity
  const colorCount = 5

  // Cleanup blob URLs on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  useEffect(() => {
    return () => {
      if (wafflePreview) {
        URL.revokeObjectURL(wafflePreview)
      }
    }
  }, [wafflePreview])

  // Generate waffle chart preview when colors are extracted
  useEffect(() => {
    if (extractedColors.length === 0) {
      setWafflePreview(null)
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Preview size (smaller than download)
    const size = 400
    const gridSize = 8
    const totalCellCount = gridSize * gridSize
    const cellSize = size / (gridSize + (gridSize - 1) / 8)
    const gap = cellSize / 8
    const cornerRadius = cellSize / 8

    canvas.width = size
    canvas.height = size

    // Calculate cell counts based on percentages
    const cellCounts: number[] = []
    let totalCells = 0

    extractedColors.forEach((color) => {
      const cells = Math.round((color.percentage / 100) * totalCellCount)
      cellCounts.push(cells)
      totalCells += cells
    })

    // Adjust to exactly 64 cells
    const diff = totalCellCount - totalCells
    if (diff !== 0 && cellCounts.length > 0) {
      cellCounts[0] += diff
    }

    // Create array of colors for each cell
    const cellColors: string[] = []
    extractedColors.forEach((color, i) => {
      for (let j = 0; j < cellCounts[i]; j++) {
        cellColors.push(color.hex)
      }
    })

    // Draw waffle chart
    for (let i = 0; i < gridSize * gridSize; i++) {
      const row = Math.floor(i / gridSize)
      const col = i % gridSize
      const x = col * (cellSize + gap)
      const y = row * (cellSize + gap)

      ctx.fillStyle = cellColors[i] || '#ffffff'
      ctx.beginPath()
      ctx.roundRect(x, y, cellSize, cellSize, cornerRadius)
      ctx.fill()
    }

    // Create preview URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setWafflePreview(url)
      }
    }, 'image/png')
  }, [extractedColors])

  // Handle file drop/select and auto-extract
  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) return

    // Validate file
    const error = await validateImageFile(file, {
      maxSize: 10 * 1024 * 1024,
      maxDimensions: { width: 4096, height: 4096 }
    })

    if (error) {
      toast.error(error)
      return
    }

    setExtractedColors([])
    setIsProcessing(true)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    // Extract colors using backend API
    try {
      const colors = await extractColorsFromImage(file, colorCount)
      setExtractedColors(colors)
    } catch (err) {
      toast.error('色の抽出に失敗しました')
      console.error('Failed to extract colors:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [toast, colorCount])

  // Copy color to clipboard
  const handleCopyColor = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase())
      addColor(hex)
      toast.success('コピーしました')
    } catch (err) {
      toast.error('コピーに失敗しました')
      console.error('Failed to copy:', err)
    }
  }, [toast, addColor])

  // Download shareable palette image (waffle chart style)
  const handleDownloadPalette = useCallback(() => {
    if (extractedColors.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas size for social media (1:1 ratio)
    const size = 1080
    const gridSize = 8 // 8x8 grid = 64 cells (8px.app!)
    const totalCellCount = gridSize * gridSize
    // gap = cellSize / 8 (8px.app!), solve: size = gridSize * cellSize + (gridSize - 1) * (cellSize / 8)
    const cellSize = size / (gridSize + (gridSize - 1) / 8)
    const gap = cellSize / 8
    const cornerRadius = cellSize / 8 // Same as gap for visual harmony

    canvas.width = size
    canvas.height = size

    // Calculate cell counts based on percentages (scaled to 64 cells)
    const cellCounts: number[] = []
    let totalCells = 0

    extractedColors.forEach((color) => {
      const cells = Math.round((color.percentage / 100) * totalCellCount)
      cellCounts.push(cells)
      totalCells += cells
    })

    // Adjust to exactly 64 cells
    const diff = totalCellCount - totalCells
    if (diff !== 0 && cellCounts.length > 0) {
      cellCounts[0] += diff
    }

    // Create array of colors for each cell
    const cellColors: string[] = []
    extractedColors.forEach((color, i) => {
      for (let j = 0; j < cellCounts[i]; j++) {
        cellColors.push(color.hex)
      }
    })

    // Draw waffle chart
    for (let i = 0; i < gridSize * gridSize; i++) {
      const row = Math.floor(i / gridSize)
      const col = i % gridSize
      const x = col * (cellSize + gap)
      const y = row * (cellSize + gap)

      ctx.fillStyle = cellColors[i] || '#ffffff'
      ctx.beginPath()
      ctx.roundRect(x, y, cellSize, cellSize, cornerRadius)
      ctx.fill()
    }

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'palette.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  }, [extractedColors])

  // Reset
  const handleReset = useCallback(() => {
    setImagePreview(null)
    setExtractedColors([])
  }, [])

  return (
    <FullPageDropZone
      onFileDrop={handleFileSelect}
      accept='image/*'
    >
      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className='hidden' />

      <div className='mx-auto flex min-h-[calc(100vh-12rem)] max-w-screen-md flex-col px-4'>
        {/* Header */}
        <div className='py-8 text-center'>
          <h1 className='text-3xl font-bold'>{tool?.name ?? 'イメージパレット+'}</h1>
          {!imagePreview && (
            <p className='mt-2 text-gray-500 dark:text-gray-400'>
              画像をドロップするだけでカラーパレットを作成
            </p>
          )}
        </div>

        {/* Main Content */}
        {!imagePreview && !isProcessing
          ? (
            // Upload State
            <div className='flex flex-1 items-center justify-center pb-12'>
              <label className='group flex w-full max-w-lg cursor-pointer flex-col items-center justify-center rounded-3xl border-[3px] border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-16 transition-all hover:border-sky-400 hover:from-sky-50 hover:to-indigo-50 dark:border-gray-600 dark:from-atom-one-dark dark:to-atom-one-dark-light dark:hover:border-sky-500 dark:hover:from-atom-one-dark-light dark:hover:to-atom-one-dark-lighter'>
                <div className='mb-6 rounded-full bg-white p-6 shadow-lg transition-transform group-hover:scale-110 dark:bg-atom-one-dark-lighter'>
                  <PhotoIcon className='size-12 text-gray-400 transition-colors group-hover:text-sky-500' />
                </div>
                <span className='mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300'>
                  画像をドロップ
                </span>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  またはクリックして選択
                </span>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                  className='hidden'
                />
              </label>
            </div>
            )
          : isProcessing
            ? (
              // Processing State
              <div className='flex flex-1 flex-col items-center justify-center pb-12'>
                <div className='relative mb-8'>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt='Processing'
                      className='max-h-64 rounded-2xl opacity-50'
                    />
                  )}
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='rounded-full bg-white/90 p-4 shadow-lg dark:bg-atom-one-dark/90'>
                      <Spinner size={32} className='text-sky-500' />
                    </div>
                  </div>
                </div>
                <p className='text-lg font-medium text-gray-600 dark:text-gray-400'>
                  色を解析中...
                </p>
              </div>
              )
            : (
              // Result State
              <div className='flex flex-1 flex-col pb-8'>
                {/* Flip Card - Image/Waffle */}
                <div className='mb-8 flex justify-center'>
                  <div className='relative'>
                    {/* Flip Button */}
                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className='absolute -right-2 -top-4 z-20 transition-transform hover:scale-110 active:scale-95'
                      title={isFlipped ? '画像を表示' : 'パレットを表示'}
                    >
                      <svg
                        width='32'
                        height='32'
                        viewBox='0 0 32 32'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        className='size-10'
                      >
                        <path d='M20.593 7.252c1.216 2.681 2.709 5.972 3.829 7.28.219-.509.195-1.36.445-3.438.226-1.877 1.774-2.055 2.438-1.922 1.468.306 1.916 1.795 1.867 2.344-.078.875-.082.845-.242 2.96-.235 3.094.96 5.43 1.07 8.079C30 27.547 25.625 30 22.563 30c-2.45 0-4.901-1.568-5.82-2.352l-4.595-4.195c-.562-.437-1.952-1.88-2.562-2.71-1.663-2.263.742-3.821 2.094-3.43-.107-.082-.748-1.123-1.055-1.633-.825-1.657 0-2.76.61-3.063 1.382-.687 2.398.086 2.718.508-.122-.208-.506-1.05-1.125-2.594s.378-2.497.953-2.781c1.25-.578 2.438.156 2.735.813.145.32.93 2.038 1.27 2.796-.257-.628-.723-1.876-.888-2.453-.328-1.36.461-2.291.961-2.531.696-.333 2.146-.42 2.72.844z' fill='#ffc83d' />
                        <path d='M17.782 6.915c.106-.34.251-.546.361-.648q-.157.046-.284.108c-.5.24-1.289 1.172-.96 2.531.164.577.63 1.825.888 2.453l-.124-.274c.564 1.295 1.267 2.69 1.797 3.59a.5.5 0 1 0 .862-.507c-.86-1.461-2.168-4.235-2.543-5.612a3 3 0 0 1 .003-1.64m-7.157 8.764c.232.386.655 1.075.894 1.423.316.38.662.745 1.012 1.092.4.395.815.777 1.208 1.139l.033.03c.406.374.785.725 1.114 1.058a.5.5 0 0 0 .712-.703c-.349-.353-.746-.72-1.149-1.09l-.028-.026c-.396-.365-.8-.737-1.186-1.12-.798-.79-1.48-1.584-1.842-2.385-.257-.566-.32-1.229-.25-1.777a2.2 2.2 0 0 1 .176-.654 1 1 0 0 1 .068-.12q-.075.032-.153.07c-.609.303-1.434 1.406-.609 3.063m3.258-7.974c-.107.072-.253.246-.346.584-.105.381-.12.917.055 1.563.254.936.892 2.192 1.621 3.422a41 41 0 0 0 2.034 3.086.5.5 0 1 1-.807.59 42 42 0 0 1-2.087-3.166q-.302-.506-.582-1.024a49 49 0 0 1-.943-2.23c-.619-1.543.378-2.497.953-2.78q.051-.025.102-.045m10.793 5.238c-.073.794-.115 1.248-.245 1.566l-.023.273a.5.5 0 0 0 .996.09q.022-.245.045-.567c.059-.793.142-1.924.387-3.346.102-.59.367-1.102.67-1.436.235-.257.437-.356.576-.381-.737-.052-2.012.261-2.215 1.95a61 61 0 0 0-.191 1.85' fill='#d67d00' />
                        <path d='M24.038 7.557a.5.5 0 1 0 1-.007c-.015-2.295-1.76-5.488-5.51-5.464a.5.5 0 0 0 .007 1c3.032-.02 4.49 2.547 4.503 4.47' fill='#5092ff' />
                        <path d='M22.877 9.986a.5.5 0 0 1-.503-.496c-.006-.91-.381-2.12-1.177-3.095-.784-.96-1.967-1.682-3.62-1.671a.5.5 0 0 1-.007-1c1.988-.013 3.448.872 4.401 2.038.94 1.151 1.395 2.583 1.403 3.721a.5.5 0 0 1-.497.503M4.875 17.61a.5.5 0 0 0-1 0c0 1.137.445 2.572 1.378 3.73.946 1.172 2.4 2.066 4.388 2.066a.5.5 0 0 0 0-1c-1.653 0-2.832-.73-3.61-1.694-.789-.98-1.156-2.194-1.156-3.103' fill='#5092ff' />
                        <path d='M3.199 19.531a.5.5 0 1 0-1 0c0 2.295 1.723 5.5 5.473 5.5a.5.5 0 0 0 0-1c-3.032 0-4.473-2.576-4.473-4.5' fill='#5092ff' />
                      </svg>
                    </button>

                    {/* Flip Container */}
                    <div
                      className='transition-transform duration-500'
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                      }}
                    >
                      {/* Front - Polaroid Image */}
                      <div
                        className='rotate-[-2deg] bg-white p-3 pb-12 shadow-xl dark:bg-gray-100'
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <img
                          src={imagePreview!}
                          alt='Uploaded'
                          className='max-h-56 w-auto'
                        />
                      </div>

                      {/* Back - Waffle Chart */}
                      {wafflePreview && (
                        <div
                          className='absolute inset-0 flex items-center justify-center bg-white p-3 pb-12 shadow-xl dark:bg-gray-100'
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg) rotate(2deg)'
                          }}
                        >
                          <img
                            src={wafflePreview}
                            alt='Waffle chart'
                            className='max-h-56 w-auto'
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Color Palette */}
                <div className='mb-6'>
                  <div className='flex flex-wrap justify-center gap-4'>
                    {extractedColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleCopyColor(color.hex)}
                        className='transition-transform hover:scale-110 active:scale-95'
                      >
                        <div
                          className='size-16 rounded-full shadow-lg ring-4 ring-white dark:ring-gray-800 sm:size-20'
                          style={{ backgroundColor: color.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex flex-col items-center gap-4'>
                  <div className='flex gap-3'>
                    <button
                      onClick={handleDownloadPalette}
                      className='w-32 rounded-full bg-sky-500 py-3 font-medium text-white transition-colors hover:bg-sky-600'
                    >
                      ダウンロード
                    </button>
                    <button
                      onClick={() => toast.info('シェア機能は開発中です')}
                      className='w-32 rounded-full bg-gray-800 py-3 font-medium text-white transition-colors hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600'
                    >
                      シェア
                    </button>
                  </div>
                  <button
                    onClick={handleReset}
                    className='text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  >
                    別の画像で試す
                  </button>
                </div>
              </div>
              )}
      </div>
    </FullPageDropZone>
  )
}
