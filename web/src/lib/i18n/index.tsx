'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ro, type TranslationDictionary } from './dictionaries/ro'
import { en } from './dictionaries/en'

export type Language = 'ro' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationDictionary
}

const dictionaries: Record<Language, TranslationDictionary> = {
  ro,
  en,
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ro',
  setLanguage: () => {},
  t: ro,
})

const COOKIE_KEY = 'gigtim_lang'
const STORAGE_KEY = 'gigtim_language'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ro')

  useEffect(() => {
    // Read from localStorage or cookie
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null
      if (saved && (saved === 'ro' || saved === 'en')) {
        setLanguageState(saved)
        document.documentElement.lang = saved
        return
      }

      // Check cookie
      const match = document.cookie.match(new RegExp('(^| )' + COOKIE_KEY + '=([^;]+)'))
      if (match && (match[2] === 'ro' || match[2] === 'en')) {
        const lang = match[2] as Language
        setLanguageState(lang)
        document.documentElement.lang = lang
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
      document.cookie = `${COOKIE_KEY}=${lang}; path=/; max-age=31536000; SameSite=Lax`
      document.documentElement.lang = lang
    } catch {
      // Ignore
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: dictionaries[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export function useTranslation() {
  const { t, language, setLanguage } = useContext(LanguageContext)
  return { t, language, setLanguage }
}
