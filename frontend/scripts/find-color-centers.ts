/**
 * Find the center hue (at shade 500) of each Tailwind color
 * to properly define hue ranges
 * Using OKLCh color space for better perceptual uniformity
 */

import { hexToOklch } from '../src/lib/color/color-utils'
import { getColorNames, isGrayScale, tailwindColors } from '../src/lib/color/tailwind-colors'

console.log('Tailwind Color Centers (Shade 500) - OKLCh\\n')
console.log('Color    | HEX     | Hue (°)')
console.log('---------|---------|----------')

const colorNames = getColorNames().filter(name => !isGrayScale(name))

const colorHues: Array<{ name: string, hue: number }> = []

for (const name of colorNames) {
  const hex = tailwindColors[name][500]
  const oklch = hexToOklch(hex)

  if (oklch) {
    console.log(`${name.padEnd(8)} | ${hex} | ${oklch.h.toFixed(1).padStart(6)}`)
    colorHues.push({ name, hue: oklch.h })
  }
}

// Sort by hue
colorHues.sort((a, b) => a.hue - b.hue)

console.log('\\n=== Sorted by Hue ===\\n')
colorHues.forEach(({ name, hue }) => {
  console.log(`${hue.toFixed(1).padStart(6)}° - ${name}`)
})

console.log('\\n=== Suggested Hue Ranges ===\\n')
console.log('Based on actual Tailwind color positions:')

// Find reasonable boundaries
const boundaries = []
for (let i = 0; i < colorHues.length - 1; i++) {
  const current = colorHues[i]
  const next = colorHues[i + 1]
  const midpoint = (current.hue + next.hue) / 2
  boundaries.push({
    from: current.name,
    to: next.name,
    boundary: midpoint
  })
}

console.log('\\nBoundaries between colors:')
boundaries.forEach(({ from, to, boundary }) => {
  console.log(`${from} / ${to}: ${boundary.toFixed(1)}°`)
})
