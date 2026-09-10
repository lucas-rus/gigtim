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
      className={`inline-flex items-center rounded-full border border-zinc-200 dark:border-white/15 bg-white/80 dark:bg-black/60 p-0.5 backdrop-blur-md text-xs font-mono transition-colors shadow-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('ro')}
        aria-pressed={language === 'ro'}
        className={`rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-bold tracking-wider transition-all duration-200 ${
          language === 'ro'
            ? 'bg-[#e14d28] text-white shadow-md shadow-[#e14d28]/35 scale-[1.02]'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
        }`}
      >
        RO
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-bold tracking-wider transition-all duration-200 ${
          language === 'en'
            ? 'bg-[#e14d28] text-white shadow-md shadow-[#e14d28]/35 scale-[1.02]'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  )
}
