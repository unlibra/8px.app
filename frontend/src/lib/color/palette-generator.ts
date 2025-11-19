/**
 * Tailwind-style Palette Generator
 * Generates 50-950 color scales in the style of Tailwind CSS
 */

import type { LCh } from './color-utils'
import { hexToLch, lchToHex, normalizeHue } from './color-utils'
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
 * These curves will be blended based on input color hue for smooth transitions
 */
const ANCHOR_CURVES: Record<AnchorColorName, AnchorCurves> = {
  red: {
    centerHue: 31.2,
    lightness: {
      50: 96.4,
      100: 92.1,
      200: 85.8,
      300: 76.3,
      400: 64.1,
      500: 55.0,
      600: 47.9,
      700: 40.0,
      800: 33.2,
      900: 28.1,
      950: 12.6
    },
    chroma: {
      50: 4.3,
      100: 10.2,
      200: 19.7,
      300: 34.8,
      400: 57.6,
      500: 75.6,
      600: 81.7,
      700: 72.7,
      800: 60.6,
      900: 48.8,
      950: 31.6
    },
    hueShift: {
      50: -11.5,
      100: -11.0,
      200: -10.2,
      300: -8.6,
      400: -4.9,
      500: 0.0,
      600: 3.9,
      700: 4.3,
      800: 3.0,
      900: 0.7,
      950: -1.8
    }
  },
  yellow: {
    centerHue: 84.3,
    lightness: {
      50: 98.6,
      100: 97.1,
      200: 94.0,
      300: 89.2,
      400: 83.7,
      500: 75.9,
      600: 62.3,
      700: 47.4,
      800: 38.4,
      900: 32.1,
      950: 16.5
    },
    chroma: {
      50: 10.2,
      100: 27.4,
      200: 51.5,
      300: 74.4,
      400: 82.5,
      500: 78.0,
      600: 68.7,
      700: 57.1,
      800: 47.3,
      900: 39.5,
      950: 26.2
    },
    hueShift: {
      50: 21.0,
      100: 19.7,
      200: 15.4,
      300: 10.1,
      400: 4.5,
      500: 0.0,
      600: -7.5,
      700: -14.4,
      800: -18.1,
      900: -21.7,
      950: -27.0
    }
  },
  green: {
    centerHue: 146.9,
    lightness: {
      50: 98.2,
      100: 96.2,
      200: 92.4,
      300: 86.9,
      400: 79.2,
      500: 70.2,
      600: 58.8,
      700: 46.9,
      800: 37.3,
      900: 30.7,
      950: 15.7
    },
    chroma: {
      50: 6.5,
      100: 15.7,
      200: 29.4,
      300: 50.5,
      400: 68.9,
      500: 73.7,
      600: 65.4,
      700: 52.5,
      800: 41.2,
      900: 33.9,
      950: 23.8
    },
    hueShift: {
      50: 7.4,
      100: 8.3,
      200: 7.5,
      300: 5.9,
      400: 2.7,
      500: 0.0,
      600: -0.5,
      700: 0.6,
      800: 2.2,
      900: 3.6,
      950: 4.1
    }
  },
  cyan: {
    centerHue: 223.2,
    lightness: {
      50: 98.4,
      100: 95.5,
      200: 91.3,
      300: 85.7,
      400: 77.9,
      500: 68.2,
      600: 55.6,
      700: 45.1,
      800: 36.8,
      900: 30.7,
      950: 19.4
    },
    chroma: {
      50: 6.2,
      100: 14.4,
      200: 24.7,
      300: 36.1,
      400: 40.8,
      500: 37.8,
      600: 33.1,
      700: 28.0,
      800: 23.2,
      900: 20.2,
      950: 16.4
    },
    hueShift: {
      50: -19.5,
      100: -16.5,
      200: -14.4,
      300: -11.5,
      400: -5.2,
      500: 0.0,
      600: 9.4,
      700: 11.3,
      800: 12.5,
      900: 16.6,
      950: 20.3
    }
  },
  blue: {
    centerHue: 285.2,
    lightness: {
      50: 96.6,
      100: 92.2,
      200: 86.5,
      300: 78.0,
      400: 66.7,
      500: 55.6,
      600: 46.1,
      700: 39.0,
      800: 31.9,
      900: 27.1,
      950: 16.2
    },
    chroma: {
      50: 5.2,
      100: 11.4,
      200: 20.2,
      300: 32.8,
      400: 48.9,
      500: 66.8,
      600: 80.1,
      700: 83.1,
      800: 69.3,
      900: 51.6,
      950: 32.7
    },
    hueShift: {
      50: -22.5,
      100: -20.6,
      200: -20.2,
      300: -19.3,
      400: -11.1,
      500: 0.0,
      600: 7.5,
      700: 11.0,
      800: 10.8,
      900: 7.6,
      950: 6.3
    }
  },
  purple: {
    centerHue: 312.7,
    lightness: {
      50: 97.2,
      100: 93.4,
      200: 88.0,
      300: 78.7,
      400: 65.5,
      500: 53.5,
      600: 45.0,
      700: 37.9,
      800: 31.9,
      900: 25.7,
      950: 15.5
    },
    chroma: {
      50: 5.4,
      100: 12.5,
      200: 23.1,
      300: 41.5,
      400: 68.6,
      500: 92.4,
      600: 102.5,
      700: 96.9,
      800: 80.2,
      900: 66.6,
      950: 58.6
    },
    hueShift: {
      50: -3.4,
      100: -4.0,
      200: -3.7,
      300: -2.6,
      400: -1.2,
      500: 0.0,
      600: 0.5,
      700: 0.8,
      800: 1.2,
      900: 1.5,
      950: 1.3
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
 * This matches the logic in lchToRgbWithGamutMapping to ensure consistency
 */
function findMaxChromaInGamut (l: number, h: number): number {
  // Helper to convert LCh to Lab
  const lchToLab = (lch: LCh) => {
    const hRad = lch.h * (Math.PI / 180)
    return {
      l: lch.l,
      a: lch.c * Math.cos(hRad),
      b: lch.c * Math.sin(hRad)
    }
  }

  // Helper to convert Lab to XYZ (simplified, matches color-utils.ts)
  const labToXyz = (lab: { l: number, a: number, b: number }) => {
    const D65 = { x: 95.047, y: 100.0, z: 108.883 }

    const labToXyzF = (t: number): number => {
      const delta = 6 / 29
      if (t > delta) {
        return Math.pow(t, 3)
      }
      return 3 * delta * delta * (t - 4 / 29)
    }

    const fy = (lab.l + 16) / 116
    const fx = lab.a / 500 + fy
    const fz = fy - lab.b / 200

    return {
      x: D65.x * labToXyzF(fx),
      y: D65.y * labToXyzF(fy),
      z: D65.z * labToXyzF(fz)
    }
  }

  // Test if a color is within gamut (check linear RGB values)
  const isInGamut = (c: number): boolean => {
    const lab = lchToLab({ l, c, h })
    const xyz = labToXyz(lab)

    // Normalize and apply inverse sRGB matrix to get linear RGB
    const x = xyz.x / 100
    const y = xyz.y / 100
    const z = xyz.z / 100

    const rLinear = x * 3.2404542 + y * -1.5371385 + z * -0.4985314
    const gLinear = x * -0.9692660 + y * 1.8760108 + z * 0.0415560
    const bLinear = x * 0.0556434 + y * -0.2040259 + z * 1.0572252

    // Check if linear RGB values are in valid range
    return rLinear >= -0.001 && rLinear <= 1.001 &&
           gLinear >= -0.001 && gLinear <= 1.001 &&
           bLinear >= -0.001 && bLinear <= 1.001
  }

  // Binary search for maximum chroma
  let low = 0
  let high = 150 // Maximum theoretical chroma
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

  // Convert input to LCh
  const inputLch = hexToLch(inputHex)
  if (!inputLch) return null

  // Find the shade that best matches the input lightness for more accurate chroma scaling
  const closestShade = SHADES.reduce((prev, curr) => {
    const prevL = getBlendedValue(inputLch.h, prev, 'lightness')
    const currL = getBlendedValue(inputLch.h, curr, 'lightness')
    return Math.abs(currL - inputLch.l) < Math.abs(prevL - inputLch.l) ? curr : prev
  })

  // Use the closest shade as reference for chroma scaling
  const referenceChroma = getBlendedValue(inputLch.h, closestShade, 'chroma')

  // Calculate base chroma scale
  const baseScale = referenceChroma > 0 ? inputLch.c / referenceChroma : 1.0

  // Clamp chromaScale to reasonable range:
  // - Lower bound (0.85): Prevents very low-chroma inputs from producing gray palettes
  // - Upper bound (1.2): Allows slightly higher saturation for vivid inputs
  const chromaScale = Math.max(0.85, Math.min(1.2, baseScale))

  // Use input hue directly as base (input-preserving approach)
  const baseHue = normalizeHue(inputLch.h + hueShift)

  // Generate all shades
  const palette: Partial<ColorPalette> = {}

  for (const shade of SHADES) {
    // Get blended curve values for this shade
    const targetL = getBlendedValue(inputLch.h, shade, 'lightness')
    const standardChroma = getBlendedValue(inputLch.h, shade, 'chroma')
    const hShift = getBlendedValue(inputLch.h, shade, 'hueShift')

    // Calculate final values
    const l = targetL
    const h = normalizeHue(baseHue + hShift)

    // Apply relative chroma scaling, clamped to gamut maximum
    const scaledChroma = standardChroma * chromaScale
    const maxChroma = findMaxChromaInGamut(l, h)
    // Use 99% of max chroma to account for numerical precision in subsequent conversions
    const c = Math.min(scaledChroma, maxChroma * 0.99)

    // Convert back to HEX
    const hex = lchToHex({ l, c, h })
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
    const lch = hexToLch(hex)

    if (lch) {
      lch.h = normalizeHue(lch.h + hueShift)
      adjusted[shade] = lchToHex(lch)
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
