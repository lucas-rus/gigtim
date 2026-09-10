'use client'

import React from 'react'
import Link from 'next/link'
import { LogoMark } from '@/components/brand/Logo'
import { useTranslation } from '@/lib/i18n'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function LandingNavbar() {
  const { t } = useTranslation()

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 dark:bg-black/60 backdrop-blur-xl border-b border-zinc-200/80 dark:border-white/10 transition-colors">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#e14d28] text-white shadow-md shadow-[#e14d28]/30 transition-transform group-hover:scale-105">
            <LogoMark size={22} strokeWidth={2.1} />
          </span>
          <span className="font-heading text-lg font-extrabold tracking-tight text-zinc-950 dark:text-white transition-colors">
            GigTim
          </span>
        </Link>

        <div className="hidden items-center gap-6 xl:gap-8 text-sm whitespace-nowrap lg:flex text-zinc-600 dark:text-zinc-400">
          <a href="#how-it-works" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            {t.nav.howItWorks}
          </a>
          <a href="#income" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            {t.nav.earnings}
          </a>
          <a href="#why-gigtim" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            {t.nav.whyGigtim}
          </a>
          <a href="#features" className="transition-colors hover:text-zinc-950 dark:hover:text-white">
            {t.nav.features}
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          <LanguageToggle />
          <Link
            href="/login"
            className="whitespace-nowrap rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
          >
            {t.nav.login}
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-flex whitespace-nowrap rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors active:scale-[0.98] shadow-sm"
          >
            {t.nav.register}
          </Link>
        </div>
      </div>
    </nav>
  )
}
