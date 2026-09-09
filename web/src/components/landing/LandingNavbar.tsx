'use client'

import React from 'react'
import Link from 'next/link'
import { LogoMark } from '@/components/brand/Logo'
import { useTranslation } from '@/lib/i18n'
import { LanguageToggle } from '@/components/ui/language-toggle'

export function LandingNavbar() {
  const { t } = useTranslation()

  return (
    <nav className="absolute top-0 z-50 w-full backdrop-blur-sm bg-black/20 border-b border-white/5">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 md:px-10 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl shadow-lg shadow-primary/20"
            style={{ background: 'oklch(0.62 0.19 35)', color: 'oklch(0.99 0.004 75)' }}
          >
            <LogoMark size={22} strokeWidth={2.1} />
          </span>
          <span className="font-heading text-lg font-extrabold tracking-tight" style={{ color: 'oklch(0.96 0.01 75)' }}>
            GigTim
          </span>
        </Link>

        <div className="hidden items-center gap-6 xl:gap-8 text-sm whitespace-nowrap lg:flex" style={{ color: 'oklch(0.75 0.015 60)' }}>
          <a href="#how-it-works" className="transition-opacity hover:opacity-100 hover:text-white">
            {t.nav.howItWorks}
          </a>
          <a href="#income" className="transition-opacity hover:opacity-100 hover:text-white">
            {t.nav.earnings}
          </a>
          <a href="#why-gigtim" className="transition-opacity hover:opacity-100 hover:text-white">
            {t.nav.whyGigtim}
          </a>
          <a href="#features" className="transition-opacity hover:opacity-100 hover:text-white">
            {t.nav.features}
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LanguageToggle />
          <Link
            href="/login"
            className="whitespace-nowrap rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: 'oklch(0.85 0.01 60)' }}
          >
            {t.nav.login}
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-flex whitespace-nowrap rounded-xl px-3.5 sm:px-4 py-2 text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-md shadow-primary/20 active:scale-[0.98]"
            style={{ background: 'oklch(0.55 0.19 35)', color: 'oklch(0.99 0.004 75)' }}
          >
            {t.nav.register}
          </Link>
        </div>
      </div>
    </nav>
  )
}
