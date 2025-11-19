/**
 * Color space conversion utilities
 * Supports: RGB ↔ Linear RGB ↔ XYZ ↔ Lab ↔ LCh
 * All conversions use D65 illuminant (standard for sRGB)
 */

// D65 white point reference values
const D65 = {
  x: 95.047,
  y: 100.0,
  z: 108.883
} as const

/**
 * RGB color (0-255 integer values)
 */
export interface RGB {
  r: number
  g: number
  b: number
}

/**
 * LCh color (perceptually uniform)
 * L: Lightness (0-100)
 * C: Chroma (0-~150, depends on hue)
 * H: Hue (0-360 degrees)
 */
export interface LCh {
  l: number
  c: number
  h: number
}

/**
 * Lab color
 * L: Lightness (0-100)
 * a: green-red axis
 * b: blue-yellow axis
 */
interface Lab {
  l: number
  a: number
  b: number
}

/**
 * XYZ color (CIE 1931)
 */
interface XYZ {
  x: number
  y: number
  z: number
}

/**
 * Clamp value between min and max
 */
function clamp (value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Convert RGB (0-255) to linear RGB (0-1)
 * Apply inverse sRGB gamma correction
 */
function rgbToLinear (value: number): number {
  const v = value / 255
  if (v <= 0.04045) {
    return v / 12.92
  }
  return Math.pow((v + 0.055) / 1.055, 2.4)
}

/**
 * Convert linear RGB (0-1) to RGB (0-255)
 * Apply sRGB gamma correction
 */
function linearToRgb (value: number): number {
  if (value <= 0.0031308) {
    return clamp(Math.round(value * 12.92 * 255), 0, 255)
  }
  return clamp(Math.round((1.055 * Math.pow(value, 1 / 2.4) - 0.055) * 255), 0, 255)
}

/**
 * Convert RGB to XYZ color space
 * Uses sRGB → Linear RGB → XYZ transformation
 */
function rgbToXyz (rgb: RGB): XYZ {
  // Convert to linear RGB
  const r = rgbToLinear(rgb.r)
  const g = rgbToLinear(rgb.g)
  const b = rgbToLinear(rgb.b)

  // Apply sRGB matrix (D65)
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041

  return {
    x: x * 100,
    y: y * 100,
    z: z * 100
  }
}

/**
 * Convert XYZ to RGB color space
 */
function xyzToRgb (xyz: XYZ): RGB {
  // Normalize
  const x = xyz.x / 100
  const y = xyz.y / 100
  const z = xyz.z / 100

  // Apply inverse sRGB matrix
  const r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314
  const g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560
  const b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252

  // Convert from linear to sRGB
  return {
    r: linearToRgb(r),
    g: linearToRgb(g),
    b: linearToRgb(b)
  }
}

/**
 * f function for XYZ to Lab conversion
 * Handles the perceptual transformation
 */
function xyzToLabF (t: number): number {
  const delta = 6 / 29
  const deltaCubed = delta * delta * delta

  if (t > deltaCubed) {
    return Math.pow(t, 1 / 3)
  }
  return (t / (3 * delta * delta)) + (4 / 29)
}

/**
 * Inverse f function for Lab to XYZ conversion
 */
function labToXyzF (t: number): number {
  const delta = 6 / 29

  if (t > delta) {
    return Math.pow(t, 3)
  }
  return 3 * delta * delta * (t - 4 / 29)
}

/**
 * Convert XYZ to Lab color space
 */
function xyzToLab (xyz: XYZ): Lab {
  const fx = xyzToLabF(xyz.x / D65.x)
  const fy = xyzToLabF(xyz.y / D65.y)
  const fz = xyzToLabF(xyz.z / D65.z)

  const l = 116 * fy - 16
  const a = 500 * (fx - fy)
  const b = 200 * (fy - fz)

  return { l, a, b }
}

/**
 * Convert Lab to XYZ color space
 */
function labToXyz (lab: Lab): XYZ {
  const fy = (lab.l + 16) / 116
  const fx = lab.a / 500 + fy
  const fz = fy - lab.b / 200

  const x = D65.x * labToXyzF(fx)
  const y = D65.y * labToXyzF(fy)
  const z = D65.z * labToXyzF(fz)

  return { x, y, z }
}

/**
 * Convert Lab to LCh color space
 * LCh is the cylindrical representation of Lab
 */
function labToLch (lab: Lab): LCh {
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b)
  let h = Math.atan2(lab.b, lab.a) * (180 / Math.PI)

  // Normalize hue to 0-360
  if (h < 0) {
    h += 360
  }

  return {
    l: lab.l,
    c,
    h
  }
}

/**
 * Convert LCh to Lab color space
 */
function lchToLab (lch: LCh): Lab {
  const hRad = lch.h * (Math.PI / 180)

  return {
    l: lch.l,
    a: lch.c * Math.cos(hRad),
    b: lch.c * Math.sin(hRad)
  }
}

/**
 * Convert RGB to LCh (main conversion function)
 */
export function rgbToLch (rgb: RGB): LCh {
  const xyz = rgbToXyz(rgb)
  const lab = xyzToLab(xyz)
  return labToLch(lab)
}

/**
 * Convert LCh to RGB (main conversion function)
 */
export function lchToRgb (lch: LCh): RGB {
  const lab = lchToLab(lch)
  const xyz = labToXyz(lab)
  return xyzToRgb(xyz)
}

/**
 * Convert LCh to RGB with gamut mapping
 * If the color is out of sRGB gamut, reduce chroma while preserving L and H
 * Uses binary search to find maximum chroma that fits in gamut
 */
export function lchToRgbWithGamutMapping (lch: LCh): RGB {
  // First try direct conversion
  const directRgb = lchToRgb(lch)

  // Check if already in gamut (values before clamping)
  const lab = lchToLab(lch)
  const xyz = labToXyz(lab)
  const x = xyz.x / 100
  const y = xyz.y / 100
  const z = xyz.z / 100

  // Apply inverse sRGB matrix to get linear RGB
  const rLinear = x * 3.2404542 + y * -1.5371385 + z * -0.4985314
  const gLinear = x * -0.9692660 + y * 1.8760108 + z * 0.0415560
  const bLinear = x * 0.0556434 + y * -0.2040259 + z * 1.0572252

  // Check if linear values are in valid range (before gamma correction)
  // Valid linear RGB range is roughly -0.05 to 1.05 (with some tolerance)
  const inGamut = rLinear >= -0.001 && rLinear <= 1.001 &&
                  gLinear >= -0.001 && gLinear <= 1.001 &&
                  bLinear >= -0.001 && bLinear <= 1.001

  if (inGamut) {
    return directRgb
  }

  // Out of gamut - reduce chroma using binary search
  let low = 0
  let high = lch.c
  let bestC = 0

  // Binary search for maximum chroma that fits in gamut
  while (high - low > 0.01) {
    const mid = (low + high) / 2
    const testLch: LCh = { l: lch.l, c: mid, h: lch.h }
    const testLab = lchToLab(testLch)
    const testXyz = labToXyz(testLab)
    const tx = testXyz.x / 100
    const ty = testXyz.y / 100
    const tz = testXyz.z / 100

    const tr = tx * 3.2404542 + ty * -1.5371385 + tz * -0.4985314
    const tg = tx * -0.9692660 + ty * 1.8760108 + tz * 0.0415560
    const tb = tx * 0.0556434 + ty * -0.2040259 + tz * 1.0572252

    const testInGamut = tr >= -0.001 && tr <= 1.001 &&
                        tg >= -0.001 && tg <= 1.001 &&
                        tb >= -0.001 && tb <= 1.001

    if (testInGamut) {
      low = mid
      bestC = mid
    } else {
      high = mid
    }
  }

  // Convert with reduced chroma
  const mappedLch: LCh = { l: lch.l, c: bestC, h: lch.h }
  return lchToRgb(mappedLch)
}

/**
 * Parse HEX color string to RGB
 * Supports: #RGB, #RRGGBB
 */
export function hexToRgb (hex: string): RGB | null {
  // Remove # if present
  hex = hex.replace(/^#/, '')

  // Expand shorthand (#RGB to #RRGGBB)
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }

  if (hex.length !== 6) {
    return null
  }

  const num = parseInt(hex, 16)
  if (isNaN(num)) {
    return null
  }

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  }
}

/**
 * Convert RGB to HEX color string
 */
export function rgbToHex (rgb: RGB): string {
  const r = clamp(Math.round(rgb.r), 0, 255)
  const g = clamp(Math.round(rgb.g), 0, 255)
  const b = clamp(Math.round(rgb.b), 0, 255)

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

/**
 * Convert HEX to LCh
 */
export function hexToLch (hex: string): LCh | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToLch(rgb)
}

/**
 * Convert LCh to HEX with gamut mapping
 * Automatically reduces chroma if color is out of sRGB gamut
 */
export function lchToHex (lch: LCh): string {
  const rgb = lchToRgbWithGamutMapping(lch)
  return rgbToHex(rgb)
}

/**
 * Interpolate between two values
 */
export function lerp (a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Normalize hue to 0-360 range
 */
export function normalizeHue (hue: number): number {
  hue = hue % 360
  if (hue < 0) hue += 360
  return hue
}
