export interface I18nConfig<L extends readonly string[] = readonly string[]> {
  locales: L
  defaultLocale: L[number]
  messages: Record<string, any>
}

let globalConfig: I18nConfig | null = null

/**
 * Create and initialize i18n configuration
 * Call this once at the top of your app (e.g., in src/i18n.ts)
 */
export function createI18nConfig<L extends readonly string[]> (config: I18nConfig<L>): I18nConfig<L> {
  globalConfig = config
  return config
}

function getConfig (): I18nConfig {
  if (!globalConfig) {
    throw new Error('i18n not configured. Call createI18nConfig() in your i18n configuration file.')
  }
  return globalConfig
}

/**
 * Get the initialized i18n configuration
 */
export function getI18nConfig (): I18nConfig | null {
  return globalConfig
}

/**
 * Get messages object for server components
 * Provides full TypeScript type safety with object property access
 *
 * @example
 * // With type augmentation (.d.ts):
 * const messages = await getMessages(locale)
 *
 * // Without type augmentation:
 * const messages = await getMessages<Messages>(locale)
 */
export async function getMessages<M = any> (locale: string): Promise<M> {
  const config = getConfig()
  const moduleObj = config.messages[locale]
  // Convert ES module namespace to plain object (required for Client Components)
  return JSON.parse(JSON.stringify(moduleObj)) as M
}

/**
 * Get translation function for server components
 * Best for dynamic key access with template literals
 *
 * @example
 * const t = await getTranslations(locale)
 * return <div>{t(`tools.${toolId}.name`)}</div>
 */
export async function getTranslations<K extends string = string> (
  locale: string,
  namespace?: string
): Promise<(key: K) => string> {
  const config = getConfig()
  const moduleObj = config.messages[locale]
  // Convert ES module namespace to plain object
  const messages = JSON.parse(JSON.stringify(moduleObj))

  return ((key: K) => {
    const fullKey = namespace ? `${String(namespace)}.${key}` : key
    const keys = fullKey.split('.')
    let obj: any = messages

    for (const k of keys) {
      obj = obj?.[k]
      if (obj === undefined) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Missing key: "${fullKey}" in locale "${locale}"`)
        }
        return fullKey
      }
    }

    return obj
  }) as (key: K) => string
}

/**
 * Get locale from params (Next.js App Router)
 */
export async function getLocale (params: Promise<{ locale: string }>): Promise<string> {
  const { locale } = await params
  return locale
}

/**
 * Generate localized path for a specific locale
 *
 * @example
 * getLocalizedPath('/iromide', 'en') // -> '/en/iromide'
 * getLocalizedPath('/iromide', 'ja') // -> '/iromide' (if ja is default)
 */
export function getLocalizedPath (path: string, locale: string): string {
  const config = getConfig()
  if (locale === config.defaultLocale) {
    return path
  }
  return `/${locale}${path}`
}

/**
 * Get all available locales
 */
export function getLocales (): readonly string[] {
  const config = getConfig()
  return config.locales
}

/**
 * Get default locale
 */
export function getDefaultLocale (): string {
  const config = getConfig()
  return config.defaultLocale
}
