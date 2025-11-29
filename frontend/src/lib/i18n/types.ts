export type Locale = 'ja' | 'en'

export const locales: Locale[] = ['ja', 'en']
export const defaultLocale: Locale = 'ja'

/**
 * Recursively extract nested keys from an object type
 * Example: { common: { copy: 'Copy' } } -> 'common.copy'
 */
export type NestedKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends object
      ? `${Prefix}${K}` | NestedKeys<T[K], `${Prefix}${K}.`>
      : never
}[keyof T & string]
