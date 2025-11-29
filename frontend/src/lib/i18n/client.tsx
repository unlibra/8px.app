'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, } from 'react'

import type { Locale } from './types'

interface I18nContextValue {
  locale: Locale
  messages: Record<string, any>
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider ({
  locale,
  messages,
  children
}: {
  locale: Locale
  messages: Record<string, any>
  children: ReactNode
}) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  )
}

function useI18nContext () {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider')
  }
  return context
}

/**
 * Get translation function for client components
 * Supports both namespaced and global key access
 */
export function useTranslations (namespace?: string) {
  const { locale, messages } = useI18nContext()

  return useCallback(
    (key: string) => {
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
    },
    [namespace, messages, locale]
  )
}

/**
 * Get current locale
 */
export function useLocale (): Locale {
  return useI18nContext().locale
}
