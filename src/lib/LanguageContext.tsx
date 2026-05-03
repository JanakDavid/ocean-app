'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Lang } from './translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('app-lang') as Lang | null
    if (stored === 'en' || stored === 'cs') {
      setLangState(stored)
      document.documentElement.lang = stored
    }
    setMounted(true)
  }, [])

  const setLang = (next: Lang) => {
    setLangState(next)
    localStorage.setItem('app-lang', next)
    document.documentElement.lang = next
  }

  const effectiveLang: Lang = mounted ? lang : 'en'

  return (
    <LanguageContext.Provider value={{ lang: effectiveLang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
