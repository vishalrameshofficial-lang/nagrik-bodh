'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { SupportedLang } from '@/types'
import en from './en.json'
import ta from './ta.json'

type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }

const translations: Record<SupportedLang, typeof en> = { en, ta: ta as typeof en }

interface I18nContextValue {
  lang: SupportedLang
  setLang: (lang: SupportedLang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return path
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : path
}

export function I18nProvider({
  children,
  initialLang = 'en',
}: {
  children: React.ReactNode
  initialLang?: SupportedLang
}) {
  const [lang, setLangState] = useState<SupportedLang>(initialLang)

  const setLang = useCallback((newLang: SupportedLang) => {
    setLangState(newLang)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang
      localStorage.setItem('nb_lang', newLang)
    }
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const msgs = translations[lang] as Record<string, unknown>
      let str = getNestedValue(msgs, key)
      if (str === key) {
        // Fallback to English
        str = getNestedValue(translations.en as Record<string, unknown>, key)
      }
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`{${k}}`, 'g'), String(v))
        })
      }
      return str
    },
    [lang]
  )

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
