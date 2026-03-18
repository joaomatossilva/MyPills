import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { AppLanguage, LanguageContextValue, LanguageProviderProps } from '../types/language'
import { availableLanguages, languageLocales, languageStorageKey, translations } from '../localization/translations'

const cultureCookieName = '.AspNetCore.Culture'

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

function detectInitialLanguage(): AppLanguage {
  const storedLanguage = window.localStorage.getItem(languageStorageKey)
  if (storedLanguage === 'en' || storedLanguage === 'pt') {
    return storedLanguage
  }

  const browserLanguage = navigator.language.toLowerCase()
  return browserLanguage.startsWith('pt') ? 'pt' : 'en'
}

function persistLanguage(language: AppLanguage): void {
  window.localStorage.setItem(languageStorageKey, language)
  document.cookie = `${cultureCookieName}=c=${language}|uic=${language}; path=/; max-age=31536000; SameSite=Lax`
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<AppLanguage>(detectInitialLanguage)

  useEffect(() => {
    persistLanguage(language)
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage)
  }

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    locale: languageLocales[language],
    setLanguage,
    text: translations[language],
    availableLanguages
  }), [language])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}

