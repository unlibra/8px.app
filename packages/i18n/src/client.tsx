'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo } from 'react'

interface I18nContextValue {
  locale: string
  messages: any
  defaultLocale: string
  locales: readonly string[]
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

/**
 * I18n Provider - Provides i18n context to client components
 * Simply pass locale and messages - other config is handled internally
 */
export function I18nProvider ({
  locale,
  messages,
  locales,
  defaultLocale,
  children
}: {
  locale: string
  messages: any
  locales?: readonly string[]
  defaultLocale?: string
  children: ReactNode
}) {
  const value = useMemo(() => ({
    locale,
    messages,
    defaultLocale: defaultLocale ?? locale,
    locales: locales ?? [locale]
  }), [locale, messages, defaultLocale, locales])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

function useI18n () {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('i18n hooks must be used within I18nProvider')
  }
  return context
}

/**
 * Get messages object for client components
 * Provides full TypeScript type safety with object property access
 *
 * @example
 * // With type augmentation (.d.ts):
 * const messages = useMessages()
 *
 * // Without type augmentation:
 * const messages = useMessages<Messages>()
 */
export function useMessages<M = any> (): M {
  return useI18n().messages as M
}

/**
 * Get translation function for client components
 * Best for dynamic key access with template literals
 *
 * @example
 * const t = useTranslations()
 * return <div>{t(`tools.${toolId}.name`)}</div>
 */
export function useTranslations<K extends string = string> (namespace?: string): (key: K) => string {
  const { locale, messages } = useI18n()

  return useCallback(
    ((key: K) => {
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
    }) as (key: K) => string,
    [namespace, messages, locale]
  )
}

/**
 * Get current locale
 */
export function useLocale (): string {
  return useI18n().locale
}

/**
 * Generate localized path based on current locale
 * Default locale uses root path, other locales are prefixed
 *
 * @example
 * const getPath = useLocalizedPath()
 * return <Link href={getPath('/iromide')} />
 */
export function useLocalizedPath () {
  const { locale, defaultLocale } = useI18n()
  return useCallback(
    (path: string) => {
      if (locale === defaultLocale) {
        return path
      }
      return `/${locale}${path}`
    },
    [locale, defaultLocale]
  )
}

/**
 * Get localized path for a specific locale
 */
export function getLocalizedPath (path: string, locale: string, defaultLocale: string): string {
  if (locale === defaultLocale) {
    return path
  }
  return `/${locale}${path}`
}

/**
 * Get all available locales
 */
export function useLocales (): readonly string[] {
  return useI18n().locales
}
