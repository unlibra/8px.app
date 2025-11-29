import enMessages from '@/messages/en'
import jaMessages from '@/messages/ja'

import type { Locale } from './types'

const messagesMap = {
  ja: jaMessages,
  en: enMessages
}

/**
 * Get messages for a specific locale
 */
export async function getMessages (locale: Locale) {
  return messagesMap[locale]
}

/**
 * Get translation function for server components
 * Supports both namespaced and global key access
 */
export async function getTranslations (locale: Locale, namespace?: string) {
  const msgs = await getMessages(locale)

  return (key: string) => {
    const fullKey = namespace ? `${String(namespace)}.${key}` : key
    const keys = fullKey.split('.')
    let obj: any = msgs

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
  }
}

/**
 * Get current locale from async params (Next.js 15+)
 */
export async function getLocale (params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  return locale as Locale
}
