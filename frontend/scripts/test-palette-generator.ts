/**
 * Test script for palette generator
 * Tests representative colors to verify output quality
 */

import { hexToOklch } from '../src/lib/color/color-utils'
import { generatePalette } from '../src/lib/color/palette-generator'
import { tailwindColors } from '../src/lib/color/tailwind-colors'

// Test cases
const TEST_CASES = [
  // Tailwind colors
  { name: 'red-200', hex: tailwindColors.red[200] },
  { name: 'red-500', hex: tailwindColors.red[500] },
  { name: 'red-900', hex: tailwindColors.red[900] },
  { name: 'yellow-200', hex: tailwindColors.yellow[200] },
  { name: 'yellow-500', hex: tailwindColors.yellow[500] },
  { name: 'yellow-900', hex: tailwindColors.yellow[900] },
  { name: 'green-200', hex: tailwindColors.green[200] },
  { name: 'green-500', hex: tailwindColors.green[500] },
  { name: 'green-900', hex: tailwindColors.green[900] },
  { name: 'blue-200', hex: tailwindColors.blue[200] },
  { name: 'blue-500', hex: tailwindColors.blue[500] },
  { name: 'blue-900', hex: tailwindColors.blue[900] },
  { name: 'purple-200', hex: tailwindColors.purple[200] },
  { name: 'purple-500', hex: tailwindColors.purple[500] },
  { name: 'purple-900', hex: tailwindColors.purple[900] },
  // Pure colors
  { name: 'pure-red', hex: '#FF0000' },
  { name: 'pure-yellow', hex: '#FFFF00' }
]

function main () {
  console.log('='.repeat(80))
  console.log('PALETTE GENERATOR TEST RESULTS')
  console.log('='.repeat(80))
  console.log()

  for (const testCase of TEST_CASES) {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`TEST: ${testCase.name} (${testCase.hex})`)
    console.log('='.repeat(80))

    const inputOklch = hexToOklch(testCase.hex)
    if (!inputOklch) {
      console.log('ERROR: Failed to convert input color to OKLCh')
      continue
    }

    console.log(`\nInput OKLCh: L=${inputOklch.l.toFixed(1)}, C=${inputOklch.c.toFixed(1)}, H=${inputOklch.h.toFixed(1)}°`)

    const palette = generatePalette(testCase.hex)
    if (!palette) {
      console.log('ERROR: Failed to generate palette')
      continue
    }

    console.log('\nGenerated Palette:')
    console.log('-'.repeat(80))
    console.log('Shade | HEX     | L    | C    | H      | Notes')
    console.log('-'.repeat(80))

    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
    let maxChroma = 0
    let maxChromaShade = 500

    for (const shade of shades) {
      const hex = palette[shade]
      const oklch = hexToOklch(hex)

      if (oklch) {
        const notes: string[] = []

        // Track max chroma
        if (oklch.c > maxChroma) {
          maxChroma = oklch.c
          maxChromaShade = shade
        }

        // Check for issues
        if (shade === 500 && Math.abs(oklch.c - maxChroma) > 5) {
          notes.push('NOT_PEAK_CHROMA')
        }

        // Check hue shift
        const hueShift = oklch.h - inputOklch.h
        const normalizedShift = hueShift > 180 ? hueShift - 360 : hueShift < -180 ? hueShift + 360 : hueShift
        if (Math.abs(normalizedShift) > 30) {
          notes.push(`HUE_SHIFT:${normalizedShift.toFixed(1)}°`)
        }

        console.log(
          `${String(shade).padStart(5)} | ` +
          `${hex.padEnd(7)} | ` +
          `${oklch.l.toFixed(1).padStart(4)} | ` +
          `${oklch.c.toFixed(1).padStart(4)} | ` +
          `${oklch.h.toFixed(1).padStart(6)} | ` +
          `${notes.join(', ')}`
        )
      }
    }

    console.log('-'.repeat(80))
    console.log(`Max chroma: ${maxChroma.toFixed(1)} at shade ${maxChromaShade}`)
  }

  console.log('\n' + '='.repeat(80))
  console.log('TEST COMPLETE')
  console.log('='.repeat(80))
}

main()
