'use client'

import React from 'react'
import { useLanguage } from '@/lib/i18n'

interface LanguageToggleProps {
  className?: string
}

export function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`inline-flex items-center rounded-full border border-border/80 bg-background/60 p-0.5 backdrop-blur-md text-xs font-mono transition-colors ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('ro')}
        aria-pressed={language === 'ro'}
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider transition-all duration-200 ${
          language === 'ro'
            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        RO
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider transition-all duration-200 ${
          language === 'en'
            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        EN
      </button>
    </div>
  )
}
