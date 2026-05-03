'use client'
import { useLanguage } from './LanguageContext'
import { translations } from './translations'

export function useTranslation() {
  const { lang } = useLanguage()
  return translations[lang]
}
