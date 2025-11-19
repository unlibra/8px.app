/**
 * Tailwind-style Palette Generator
 * Generates 50-950 color scales in the style of Tailwind CSS
 */

import type { OKLCh } from './color-utils'
import { hexToOklch, normalizeHue, oklchToHex } from './color-utils'
import type { TailwindShade } from './tailwind-colors'

/**
 * Generated color palette (50-950)
 */
export type ColorPalette = Record<TailwindShade, string>

/**
 * Shade levels in order
 */
const SHADES: TailwindShade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

/**
 * Anchor color names for interpolation-based palette generation
 */
type AnchorColorName = 'red' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple'

/**
 * Anchor color curves structure
 */
interface AnchorCurves {
  centerHue: number
  lightness: Record<TailwindShade, number>
  chroma: Record<TailwindShade, number>
  hueShift: Record<TailwindShade, number>
}

/**
 * 6 Anchor Colors for Interpolation-based Palette Generation
 * These curves are based on OKLCh color space (calculated from Tailwind CSS colors)
 * OKLCh provides better perceptual uniformity than CIELCh, especially for yellows
 */
const ANCHOR_CURVES: Record<AnchorColorName, AnchorCurves> = {
  red: {
    centerHue: 25.3,
    lightness: {
      50: 97.1,
      100: 93.6,
      200: 88.5,
      300: 80.8,
      400: 71.1,
      500: 63.7,
      600: 57.7,
      700: 50.5,
      800: 44.4,
      900: 39.6,
      950: 25.8
    },
    chroma: {
      50: 1.7,
      100: 4.0,
      200: 7.7,
      300: 13.5,
      400: 21.6,
      500: 27.0,
      600: 28.0,
      700: 24.8,
      800: 21.0,
      900: 17.3,
      950: 11.5
    },
    hueShift: {
      50: -7.9,
      100: -7.6,
      200: -7.0,
      300: -5.7,
      400: -3.1,
      500: 0.0,
      600: 2.0,
      700: 2.2,
      800: 1.6,
      900: 0.4,
      950: 0.7
    }
  },
  yellow: {
    centerHue: 86.0,
    lightness: {
      50: 98.7,
      100: 97.3,
      200: 94.5,
      300: 90.5,
      400: 86.1,
      500: 79.5,
      600: 68.1,
      700: 55.4,
      800: 47.6,
      900: 42.1,
      950: 28.6
    },
    chroma: {
      50: 3.4,
      100: 9.0,
      200: 16.2,
      300: 21.5,
      400: 22.5,
      500: 21.0,
      600: 18.5,
      700: 15.7,
      800: 13.4,
      900: 11.7,
      950: 8.3
    },
    hueShift: {
      50: 16.2,
      100: 17.2,
      200: 15.5,
      300: 12.1,
      400: 5.9,
      500: 0.0,
      600: -10.2,
      700: -19.6,
      800: -24.1,
      900: -28.3,
      950: -32.2
    }
  },
  green: {
    centerHue: 149.6,
    lightness: {
      50: 98.2,
      100: 96.2,
      200: 92.5,
      300: 87.1,
      400: 80.0,
      500: 72.3,
      600: 62.7,
      700: 52.7,
      800: 44.8,
      900: 39.3,
      950: 26.6
    },
    chroma: {
      50: 2.3,
      100: 5.6,
      200: 10.5,
      300: 17.7,
      400: 23.7,
      500: 25.0,
      600: 22.1,
      700: 17.8,
      800: 14.1,
      900: 11.7,
      950: 8.2
    },
    hueShift: {
      50: 6.2,
      100: 7.1,
      200: 6.4,
      300: 4.8,
      400: 2.1,
      500: 0.0,
      600: -0.4,
      700: 0.5,
      800: 1.7,
      900: 2.9,
      950: 3.3
    }
  },
  cyan: {
    centerHue: 215.2,
    lightness: {
      50: 98.4,
      100: 95.6,
      200: 91.7,
      300: 86.5,
      400: 79.7,
      500: 71.5,
      600: 60.9,
      700: 52.0,
      800: 45.0,
      900: 39.8,
      950: 30.2
    },
    chroma: {
      50: 2.5,
      100: 5.8,
      200: 10.0,
      300: 15.0,
      400: 17.4,
      500: 16.3,
      600: 14.4,
      700: 12.2,
      800: 10.0,
      900: 8.6,
      950: 7.0
    },
    hueShift: {
      50: -14.3,
      100: -11.8,
      200: -10.2,
      300: -8.1,
      400: -3.7,
      500: 0.0,
      600: 6.5,
      700: 7.9,
      800: 9.1,
      900: 12.2,
      950: 14.5
    }
  },
  blue: {
    centerHue: 259.8,
    lightness: {
      50: 97.0,
      100: 93.2,
      200: 88.2,
      300: 80.9,
      400: 71.4,
      500: 62.3,
      600: 54.6,
      700: 48.8,
      800: 42.4,
      900: 37.9,
      950: 28.2
    },
    chroma: {
      50: 1.8,
      100: 4.1,
      200: 7.4,
      300: 12.4,
      400: 18.6,
      500: 24.4,
      600: 28.0,
      700: 28.2,
      800: 23.5,
      900: 17.9,
      950: 11.4
    },
    hueShift: {
      50: -5.2,
      100: -4.2,
      200: -5.7,
      300: -8.0,
      400: -5.2,
      500: 0.0,
      600: 3.1,
      700: 4.6,
      800: 5.8,
      900: 5.7,
      950: 8.1
    }
  },
  purple: {
    centerHue: 303.9,
    lightness: {
      50: 97.7,
      100: 94.6,
      200: 90.2,
      300: 82.7,
      400: 72.2,
      500: 62.7,
      600: 55.8,
      700: 49.6,
      800: 43.8,
      900: 38.1,
      950: 29.1
    },
    chroma: {
      50: 1.8,
      100: 4.3,
      200: 7.9,
      300: 14.1,
      400: 23.0,
      500: 30.2,
      600: 32.8,
      700: 30.8,
      800: 25.8,
      900: 21.6,
      950: 18.6
    },
    hueShift: {
      50: 4.4,
      100: 3.3,
      200: 2.8,
      300: 2.5,
      400: 1.6,
      500: 0.0,
      600: -1.6,
      700: -2.0,
      800: -0.2,
      900: 1.1,
      950: -1.2
    }
  }
}

/**
 * Calculate angular distance between two hues (accounting for wraparound)
 */
function angleDist (h1: number, h2: number): number {
  let diff = Math.abs(h1 - h2)
  if (diff > 180) diff = 360 - diff
  return diff
}

/**
 * Linear interpolation for angles (handles 360° wraparound)
 */
function lerpAngle (a1: number, a2: number, t: number): number {
  let diff = a2 - a1
  // Take shorter path around the circle
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return a1 + diff * t
}

/**
 * Find the two adjacent anchor colors for a given hue
 * Returns [anchor1, anchor2, blendRatio]
 * blendRatio: 0 = pure anchor1, 1 = pure anchor2
 */
function findAdjacentAnchors (hue: number): [AnchorColorName, AnchorColorName, number] {
  const normalizedHue = normalizeHue(hue)

  // Get all anchor colors sorted by hue
  const anchors = Object.keys(ANCHOR_CURVES) as AnchorColorName[]
  const anchorHues = anchors.map(name => ({
    name,
    hue: ANCHOR_CURVES[name].centerHue
  }))

  // Sort by hue
  anchorHues.sort((a, b) => a.hue - b.hue)

  // Find the two anchors that bracket the input hue
  let anchor1 = anchorHues[anchorHues.length - 1]
  let anchor2 = anchorHues[0]

  for (let i = 0; i < anchorHues.length; i++) {
    const current = anchorHues[i]
    const next = anchorHues[(i + 1) % anchorHues.length]

    // Check if hue is between current and next
    if (current.hue <= normalizedHue && normalizedHue < next.hue) {
      anchor1 = current
      anchor2 = next
      break
    }
    // Handle wraparound case (e.g., 350° is between 312° and 31°)
    if (current.hue > next.hue) {
      if (normalizedHue >= current.hue || normalizedHue < next.hue) {
        anchor1 = current
        anchor2 = next
        break
      }
    }
  }

  // Calculate blend ratio
  const dist1 = angleDist(normalizedHue, anchor1.hue)
  const dist2 = angleDist(normalizedHue, anchor2.hue)
  const totalDist = dist1 + dist2

  const ratio = totalDist > 0 ? dist1 / totalDist : 0

  return [anchor1.name, anchor2.name, ratio]
}

/**
 * Get blended curve value by interpolating between two anchor colors
 */
function getBlendedValue (
  hue: number,
  shade: TailwindShade,
  curveType: 'lightness' | 'chroma' | 'hueShift'
): number {
  const [anchor1, anchor2, ratio] = findAdjacentAnchors(hue)

  const value1 = ANCHOR_CURVES[anchor1][curveType][shade]
  const value2 = ANCHOR_CURVES[anchor2][curveType][shade]

  // For hue shift, use angle interpolation
  if (curveType === 'hueShift') {
    return lerpAngle(value1, value2, ratio)
  }

  // For lightness and chroma, use linear interpolation
  return lerp(value1, value2, ratio)
}

/**
 * Linear interpolation between two points
 */
function lerp (a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Find the maximum chroma that stays within sRGB gamut for a given L and H
 * Uses binary search to find the gamut boundary
 * OKLCh version - simpler and more accurate than LCh
 */
function findMaxChromaInGamut (l: number, h: number): number {
  // Helper to convert OKLCh to Oklab
  const oklchToOklab = (oklch: OKLCh) => {
    const hRad = oklch.h * (Math.PI / 180)
    return {
      l: oklch.l / 100,
      a: (oklch.c / 130) * Math.cos(hRad),
      b: (oklch.c / 130) * Math.sin(hRad)
    }
  }

  // Helper to convert Oklab to linear RGB
  const oklabToLinearRgb = (oklab: { l: number, a: number, b: number }) => {
    const l_ = oklab.l + 0.3963377774 * oklab.a + 0.2158037573 * oklab.b
    const m_ = oklab.l - 0.1055613458 * oklab.a - 0.0638541728 * oklab.b
    const s_ = oklab.l - 0.0894841775 * oklab.a - 1.2914855480 * oklab.b

    const l = l_ * l_ * l_
    const m = m_ * m_ * m_
    const s = s_ * s_ * s_

    return {
      r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    }
  }

  // Test if a color is within gamut
  const isInGamut = (c: number): boolean => {
    const oklab = oklchToOklab({ l, c, h })
    const linear = oklabToLinearRgb(oklab)

    return linear.r >= -0.001 && linear.r <= 1.001 &&
           linear.g >= -0.001 && linear.g <= 1.001 &&
           linear.b >= -0.001 && linear.b <= 1.001
  }

  // Binary search for maximum chroma
  let low = 0
  let high = 150 // Maximum theoretical chroma (in our scaled units)
  let maxChroma = 0

  while (high - low > 0.1) {
    const mid = (low + high) / 2
    if (isInGamut(mid)) {
      maxChroma = mid
      low = mid
    } else {
      high = mid
    }
  }

  return maxChroma
}

/**
 * Generate a Tailwind-style color palette from an input color
 *
 * @param inputHex - Input color in HEX format
 * @param options - Generation options
 * @returns Complete 50-950 color palette
 */
export function generatePalette (
  inputHex: string,
  options: {
    hueShift?: number // Additional hue shift to apply (degrees)
  } = {}
): ColorPalette | null {
  const { hueShift = 0 } = options

  // Convert input to OKLCh
  const inputOklch = hexToOklch(inputHex)
  if (!inputOklch) return null

  // Always use full chroma from anchor curves for Tailwind-style vibrant palettes
  // This ensures all inputs (red-200, red-500, red-900) produce equally vibrant palettes
  // Only the hue matters for determining the color family, not the input's saturation
  const chromaScale = 1.0

  // Use input hue directly as base (input-preserving approach)
  const baseHue = normalizeHue(inputOklch.h + hueShift)

  // Generate all shades
  const palette: Partial<ColorPalette> = {}

  for (const shade of SHADES) {
    // Get blended curve values for this shade
    const targetL = getBlendedValue(inputOklch.h, shade, 'lightness')
    const standardChroma = getBlendedValue(inputOklch.h, shade, 'chroma')
    const hShift = getBlendedValue(inputOklch.h, shade, 'hueShift')

    // Calculate final values
    const l = targetL
    const h = normalizeHue(baseHue + hShift)

    // Apply relative chroma scaling, clamped to gamut maximum
    const scaledChroma = standardChroma * chromaScale
    const maxChroma = findMaxChromaInGamut(l, h)
    // Use 99% of max chroma to account for numerical precision in subsequent conversions
    const c = Math.min(scaledChroma, maxChroma * 0.99)

    // Convert back to HEX
    const hex = oklchToHex({ l, c, h })
    palette[shade] = hex
  }

  return palette as ColorPalette
}

/**
 * Adjust hue of an existing palette
 */
export function adjustPaletteHue (palette: ColorPalette, hueShift: number): ColorPalette {
  const adjusted: Partial<ColorPalette> = {}

  for (const shade of SHADES) {
    const hex = palette[shade]
    const oklch = hexToOklch(hex)

    if (oklch) {
      oklch.h = normalizeHue(oklch.h + hueShift)
      adjusted[shade] = oklchToHex(oklch)
    }
  }

  return adjusted as ColorPalette
}

/**
 * Get shade labels for UI
 */
export function getShadeLabels (): TailwindShade[] {
  return SHADES
}
