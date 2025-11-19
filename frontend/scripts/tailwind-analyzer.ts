/**
 * Tailwind Color Analyzer
 * Analyzes Tailwind colors to extract lightness, chroma, and hue shift curves
 */

import type { LCh } from '../src/lib/color-utils'
import { hexToLch } from '../src/lib/color-utils'
import type { TailwindColorName, TailwindShade } from '../src/lib/tailwind-colors'
import {
  getColorNames,
  getShades,
  isGrayScale,
  tailwindColors
} from '../src/lib/tailwind-colors'

/**
 * Single color data point with metadata
 */
export interface ColorDataPoint {
  name: TailwindColorName
  shade: TailwindShade
  hex: string
  lch: LCh
}

/**
 * Statistics for a shade level
 */
export interface ShadeStatistics {
  shade: TailwindShade
  // Lightness stats
  avgL: number
  medianL: number
  minL: number
  maxL: number
  // Chroma stats (excluding grays)
  avgC: number
  medianC: number
  minC: number
  maxC: number
  // Hue shift stats (relative to shade 500)
  avgHueShift: number
  medianHueShift: number
}

/**
 * Color-specific analysis
 */
export interface ColorAnalysis {
  name: TailwindColorName
  baseHue: number // Hue at shade 500
  dataPoints: ColorDataPoint[]
  hueShifts: Record<TailwindShade, number> // Hue shift from shade 500
  chromaRatios: Record<TailwindShade, number> // C / max(C) ratio
}

/**
 * Convert all Tailwind colors to LCh
 */
export function analyzeTailwindColors (): ColorDataPoint[] {
  const dataPoints: ColorDataPoint[] = []
  const colorNames = getColorNames()
  const shades = getShades()

  for (const name of colorNames) {
    for (const shade of shades) {
      const hex = tailwindColors[name][shade]
      const lch = hexToLch(hex)

      if (lch) {
        dataPoints.push({
          name,
          shade,
          hex,
          lch
        })
      }
    }
  }

  return dataPoints
}

/**
 * Calculate statistics for each shade level
 */
export function calculateShadeStatistics (dataPoints: ColorDataPoint[]): Record<TailwindShade, ShadeStatistics> {
  const shades = getShades()
  const statistics: Partial<Record<TailwindShade, ShadeStatistics>> = {}

  for (const shade of shades) {
    const shadeData = dataPoints.filter(dp => dp.shade === shade)
    const chromaData = shadeData.filter(dp => !isGrayScale(dp.name))

    // Lightness values
    const lValues = shadeData.map(dp => dp.lch.l).sort((a, b) => a - b)
    const avgL = lValues.reduce((sum, v) => sum + v, 0) / lValues.length
    const medianL = lValues[Math.floor(lValues.length / 2)]
    const minL = Math.min(...lValues)
    const maxL = Math.max(...lValues)

    // Chroma values (excluding grays)
    const cValues = chromaData.map(dp => dp.lch.c).sort((a, b) => a - b)
    const avgC = cValues.length > 0 ? cValues.reduce((sum, v) => sum + v, 0) / cValues.length : 0
    const medianC = cValues.length > 0 ? cValues[Math.floor(cValues.length / 2)] : 0
    const minC = cValues.length > 0 ? Math.min(...cValues) : 0
    const maxC = cValues.length > 0 ? Math.max(...cValues) : 0

    // For hue shift, we need to compare with shade 500
    const hueShifts: number[] = []
    const colorNames = getColorNames().filter(name => !isGrayScale(name))

    for (const name of colorNames) {
      const shade500 = dataPoints.find(dp => dp.name === name && dp.shade === 500)
      const currentShade = dataPoints.find(dp => dp.name === name && dp.shade === shade)

      if (shade500 && currentShade) {
        let shift = currentShade.lch.h - shade500.lch.h
        // Handle hue wraparound
        if (shift > 180) shift -= 360
        if (shift < -180) shift += 360
        hueShifts.push(shift)
      }
    }

    const avgHueShift = hueShifts.length > 0
      ? hueShifts.reduce((sum, v) => sum + v, 0) / hueShifts.length
      : 0
    const medianHueShift = hueShifts.length > 0
      ? hueShifts.sort((a, b) => a - b)[Math.floor(hueShifts.length / 2)]
      : 0

    statistics[shade] = {
      shade,
      avgL,
      medianL,
      minL,
      maxL,
      avgC,
      medianC,
      minC,
      maxC,
      avgHueShift,
      medianHueShift
    }
  }

  return statistics as Record<TailwindShade, ShadeStatistics>
}

/**
 * Analyze individual color to understand its characteristics
 */
export function analyzeColor (name: TailwindColorName, dataPoints: ColorDataPoint[]): ColorAnalysis {
  const colorData = dataPoints.filter(dp => dp.name === name)
  const shade500 = colorData.find(dp => dp.shade === 500)

  if (!shade500) {
    throw new Error(`No shade 500 found for ${name}`)
  }

  const baseHue = shade500.lch.h
  const maxChroma = Math.max(...colorData.map(dp => dp.lch.c))

  const hueShifts: Partial<Record<TailwindShade, number>> = {}
  const chromaRatios: Partial<Record<TailwindShade, number>> = {}

  for (const dp of colorData) {
    let shift = dp.lch.h - baseHue
    if (shift > 180) shift -= 360
    if (shift < -180) shift += 360
    hueShifts[dp.shade] = shift

    chromaRatios[dp.shade] = maxChroma > 0 ? dp.lch.c / maxChroma : 0
  }

  return {
    name,
    baseHue,
    dataPoints: colorData,
    hueShifts: hueShifts as Record<TailwindShade, number>,
    chromaRatios: chromaRatios as Record<TailwindShade, number>
  }
}

/**
 * Get lightness curve data points
 * Returns [shade, avgL] pairs for curve fitting
 */
export function getLightnessCurveData (statistics: Record<TailwindShade, ShadeStatistics>): Array<[number, number]> {
  const shades = getShades()
  return shades.map(shade => [shade, statistics[shade].avgL])
}

/**
 * Get chroma curve data points (normalized 0-1)
 * Returns [shade, avgC/maxC] pairs
 */
export function getChromaCurveData (statistics: Record<TailwindShade, ShadeStatistics>): Array<[number, number]> {
  const shades = getShades()
  const chromaValues = shades.map(shade => statistics[shade].avgC)
  const maxChroma = Math.max(...chromaValues)

  return shades.map(shade => [shade, statistics[shade].avgC / maxChroma])
}

/**
 * Get hue shift curve data points
 * Returns [shade, avgHueShift] pairs
 */
export function getHueShiftCurveData (statistics: Record<TailwindShade, ShadeStatistics>): Array<[number, number]> {
  const shades = getShades()
  return shades.map(shade => [shade, statistics[shade].avgHueShift])
}

/**
 * Print analysis summary (for debugging/development)
 */
export function printAnalysisSummary (statistics: Record<TailwindShade, ShadeStatistics>): void {
  console.log('\n=== Tailwind Color Analysis ===\n')

  console.log('Shade | Avg L  | Med L  | Avg C  | Hue Shift')
  console.log('------|--------|--------|--------|----------')

  const shades = getShades()
  for (const shade of shades) {
    const stats = statistics[shade]
    console.log(
      `${String(shade).padEnd(5)} | ` +
      `${stats.avgL.toFixed(2).padStart(6)} | ` +
      `${stats.medianL.toFixed(2).padStart(6)} | ` +
      `${stats.avgC.toFixed(2).padStart(6)} | ` +
      `${stats.avgHueShift.toFixed(2).padStart(9)}`
    )
  }

  console.log('\n')
}

/**
 * Export analysis data as JSON
 */
export function exportAnalysisData (): {
  statistics: Record<TailwindShade, ShadeStatistics>
  colorAnalyses: Record<TailwindColorName, ColorAnalysis>
} {
  const dataPoints = analyzeTailwindColors()
  const statistics = calculateShadeStatistics(dataPoints)

  const colorAnalyses: Partial<Record<TailwindColorName, ColorAnalysis>> = {}
  const colorNames = getColorNames().filter(name => !isGrayScale(name))

  for (const name of colorNames) {
    colorAnalyses[name] = analyzeColor(name, dataPoints)
  }

  return {
    statistics,
    colorAnalyses: colorAnalyses as Record<TailwindColorName, ColorAnalysis>
  }
}
