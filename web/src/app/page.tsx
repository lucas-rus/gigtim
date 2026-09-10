'use client'

import Link from 'next/link'
import {
  Shield,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Star,
  ArrowRight,
  FileCheck,
  Coffee,
  Utensils,
  Trees,
  PartyPopper,
  Users,
} from 'lucide-react'
import { LogoTile } from '@/components/brand/Logo'
import { LivingMapHero } from '@/components/landing/LivingMapHero'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { Reveal } from '@/components/landing/Reveal'
import { useTranslation } from '@/lib/i18n'

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans text-zinc-950 dark:text-white overflow-x-hidden selection:bg-[#e14d28]/20 selection:text-[#e14d28] transition-colors duration-300">
      {/* ── Frosted Minimalist Navbar ──────── */}
      <LandingNavbar />

      {/* ── Immersive Living Map Hero with Real Timișoara OSM Geometry ── */}
      <LivingMapHero />

      {/* ── Editorial Statement Block (Bending Spoons Split Narrative) ── */}
      <section className="relative py-20 sm:py-28 border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-black transition-colors">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/90 dark:border-white/15 bg-zinc-100/90 dark:bg-white/5 px-4 py-1.5 text-xs font-mono text-zinc-700 dark:text-zinc-400 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e14d28] dark:bg-amber-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e14d28] dark:bg-amber-400" />
                </span>
                <span className="font-semibold tracking-wide uppercase">{t.statement.badge}</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white max-w-4xl leading-[1.12] transition-colors">
                {t.statement.titlePart1}{' '}
                <span className="font-serif italic font-normal text-[#c2410c] dark:text-amber-300">
                  {t.statement.titlePart2}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-8 border-t border-zinc-200 dark:border-white/10 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed transition-colors">
                <p>{t.statement.col1}</p>
                <p>{t.statement.col2}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── De Ce GigTim — Bending Spoons Large Metric Callouts ──────── */}
      <section id="why-gigtim" className="relative py-20 sm:py-28 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black transition-colors">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="max-w-2xl space-y-4 mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/90 dark:border-white/15 bg-zinc-100/90 dark:bg-white/5 px-4 py-1.5 text-xs font-mono text-zinc-700 dark:text-zinc-400 shadow-sm">
                <span className="font-semibold tracking-wide uppercase">{t.whyGigtim.badge}</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white transition-colors">
                {t.whyGigtim.titlePrefix}
                <span className="font-serif italic font-normal text-[#c2410c] dark:text-amber-300">
                  {t.whyGigtim.titleHighlight}
                </span>
              </h2>
              <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed transition-colors">
                {t.whyGigtim.subtitle}
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  value: t.whyGigtim.stat1Value,
                  label: t.whyGigtim.stat1Label,
                  desc: t.whyGigtim.stat1Desc,
                },
                {
                  value: t.whyGigtim.stat2Value,
                  label: t.whyGigtim.stat2Label,
                  desc: t.whyGigtim.stat2Desc,
                },
                {
                  value: t.whyGigtim.stat3Value,
                  label: t.whyGigtim.stat3Label,
                  desc: t.whyGigtim.stat3Desc,
                },
                {
                  value: t.whyGigtim.stat4Value,
                  label: t.whyGigtim.stat4Label,
                  desc: t.whyGigtim.stat4Desc,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="border-t border-zinc-200 dark:border-white/15 pt-6 sm:pt-8 flex flex-col justify-between space-y-6 group transition-colors"
                >
                  <div className="font-heading text-3xl sm:text-4xl lg:text-3xl xl:text-5xl font-extrabold text-zinc-950 dark:text-white tracking-tight group-hover:text-[#c2410c] dark:group-hover:text-amber-300 transition-colors whitespace-nowrap">
                    {stat.value}
                  </div>
                  <div className="space-y-2">
                    <div className="font-mono text-xs font-bold tracking-wider text-zinc-800 dark:text-zinc-300 uppercase transition-colors">
                      {stat.label}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed transition-colors">
                      {stat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Cum Funcționează — Minimal Monolithic Cards ───────────── */}
      <section id="how-it-works" className="border-t border-zinc-200 dark:border-white/10 py-20 sm:py-28 bg-white dark:bg-black transition-colors">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="max-w-2xl space-y-4 mb-14 sm:mb-18">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white transition-colors">
                {t.howItWorks.titlePrefix}
                <span className="font-serif italic font-normal text-[#c2410c] dark:text-amber-300">
                  {t.howItWorks.titleHighlight}
                </span>
              </h2>
              <p className="text-base text-zinc-600 dark:text-zinc-400 transition-colors">
                {t.howItWorks.subtitle}
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  step: t.howItWorks.step1Num,
                  title: t.howItWorks.step1Title,
                  desc: t.howItWorks.step1Desc,
                },
                {
                  step: t.howItWorks.step2Num,
                  title: t.howItWorks.step2Title,
                  desc: t.howItWorks.step2Desc,
                },
                {
                  step: t.howItWorks.step3Num,
                  title: t.howItWorks.step3Title,
                  desc: t.howItWorks.step3Desc,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative flex flex-col justify-between rounded-[32px] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/80 p-8 sm:p-10 hover:border-zinc-300 dark:hover:border-white/25 transition-all duration-300 shadow-sm dark:shadow-none"
                >
                  <div className="space-y-6">
                    <span className="inline-block font-mono text-xs font-bold tracking-widest text-zinc-500 uppercase">
                      {item.step}
                    </span>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white leading-snug transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 transition-colors">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Transparență a Câștigurilor — Real Numbers in Timișoara ── */}
      <section id="income" className="border-t border-zinc-200 dark:border-white/10 py-20 sm:py-28 bg-zinc-50/50 dark:bg-black transition-colors">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="max-w-2xl space-y-4 mb-14 sm:mb-18">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/90 dark:border-white/15 bg-zinc-100/90 dark:bg-white/5 px-4 py-1.5 text-xs font-mono text-zinc-700 dark:text-zinc-400 shadow-sm">
                <FileCheck className="h-3.5 w-3.5 text-[#c2410c] dark:text-amber-300" />
                <span className="font-semibold tracking-wide uppercase">{t.income.badge}</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white transition-colors">
                {t.income.titlePrefix}
                <span className="font-serif italic font-normal text-[#c2410c] dark:text-amber-300">
                  {t.income.titleHighlight}
                </span>
              </h2>
              <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed transition-colors">
                {t.income.subtitle}
              </p>
            </div>
          </Reveal>

          {/* Role Rates Grid */}
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  role: t.income.role1Title,
                  icon: <Coffee className="h-5 w-5" />,
                  hourly: t.income.role1Hourly,
                  shiftTotal: t.income.role1Total,
                  shiftDesc: t.income.role1Desc,
                  badge: t.income.role1Badge,
                },
                {
                  role: t.income.role2Title,
                  icon: <Utensils className="h-5 w-5" />,
                  hourly: t.income.role2Hourly,
                  shiftTotal: t.income.role2Total,
                  shiftDesc: t.income.role2Desc,
                  badge: t.income.role2Badge,
                },
                {
                  role: t.income.role3Title,
                  icon: <Trees className="h-5 w-5" />,
                  hourly: t.income.role3Hourly,
                  shiftTotal: t.income.role3Total,
                  shiftDesc: t.income.role3Desc,
                  badge: t.income.role3Badge,
                },
                {
                  role: t.income.role4Title,
                  icon: <PartyPopper className="h-5 w-5" />,
                  hourly: t.income.role4Hourly,
                  shiftTotal: t.income.role4Total,
                  shiftDesc: t.income.role4Desc,
                  badge: t.income.role4Badge,
                },
              ].map((item) => (
                <div
                  key={item.role}
                  className="relative flex flex-col justify-between rounded-[28px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-7 hover:border-zinc-300 dark:hover:border-white/25 transition-all duration-300 shadow-sm dark:shadow-none space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white transition-colors">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 transition-colors">
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-heading text-base font-bold text-zinc-950 dark:text-white transition-colors">
                        {item.role}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 transition-colors">
                        {item.shiftDesc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-200 dark:border-white/10 transition-colors">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-2xl font-extrabold text-zinc-950 dark:text-white transition-colors">
                        {item.hourly}
                        <span className="text-xs font-sans font-normal text-zinc-500 dark:text-zinc-400 ml-1">{t.income.perHour}</span>
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 transition-colors">{t.income.estimatedTotal}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 transition-colors">
                        {item.shiftTotal} {t.income.net}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Transparency Guarantees Row */}
          <Reveal>
            <div className="mt-10 rounded-[28px] border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/80 p-6 sm:p-8 shadow-sm dark:shadow-none transition-colors">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-950 dark:text-white block transition-colors">{t.income.guarantee1Title}</span>
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400 transition-colors">{t.income.guarantee1Desc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white font-bold text-sm font-mono transition-colors">
                    0%
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-950 dark:text-white block transition-colors">{t.income.guarantee2Title}</span>
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400 transition-colors">{t.income.guarantee2Desc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-[#c2410c] dark:text-amber-400 font-bold text-xs font-mono transition-colors">
                    ITM
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-950 dark:text-white block transition-colors">{t.income.guarantee3Title}</span>
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400 transition-colors">{t.income.guarantee3Desc}</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Funcționalități Cheie — 6-Grid Minimalist Feature Cards (Hidden on mobile for concise, on-point layout) ── */}
      <section id="features" className="hidden md:block border-t border-zinc-200 dark:border-white/10 py-20 sm:py-28 bg-white dark:bg-black transition-colors">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="max-w-2xl space-y-4 mb-14 sm:mb-18">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white transition-colors">
                {t.features.titlePrefix}
                <span className="font-serif italic font-normal text-[#c2410c] dark:text-amber-300">
                  {t.features.titleHighlight}
                </span>
              </h2>
              <p className="text-base text-zinc-600 dark:text-zinc-400 transition-colors">
                {t.features.subtitle}
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Shield className="h-5 w-5 text-zinc-900 dark:text-white" />,
                  title: t.features.f1Title,
                  desc: t.features.f1Desc,
                },
                {
                  icon: <ClipboardList className="h-5 w-5 text-zinc-900 dark:text-white" />,
                  title: t.features.f2Title,
                  desc: t.features.f2Desc,
                },
                {
                  icon: <MessageSquare className="h-5 w-5 text-zinc-900 dark:text-white" />,
                  title: t.features.f3Title,
                  desc: t.features.f3Desc,
                },
                {
                  icon: <BarChart3 className="h-5 w-5 text-zinc-900 dark:text-white" />,
                  title: t.features.f4Title,
                  desc: t.features.f4Desc,
                },
                {
                  icon: <Star className="h-5 w-5 text-zinc-900 dark:text-white" />,
                  title: t.features.f5Title,
                  desc: t.features.f5Desc,
                },
                {
                  icon: <Users className="h-5 w-5 text-zinc-900 dark:text-white" />,
                  title: t.features.f6Title,
                  desc: t.features.f6Desc,
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[28px] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-8 transition-all duration-300 hover:border-zinc-300 dark:hover:border-white/25 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/40 shadow-sm dark:shadow-none"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-zinc-950 dark:text-white transition-colors">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 transition-colors">{feature.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA Banner — Full-Width Bending Spoons Statement ─────── */}
      <section className="border-t border-zinc-200 dark:border-white/10 py-20 sm:py-28 bg-zinc-50/50 dark:bg-black transition-colors">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[36px] border border-zinc-200/90 dark:border-white/15 bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-950 dark:to-black p-10 sm:p-16 text-center shadow-xl dark:shadow-2xl transition-colors">
              <div className="relative mx-auto max-w-2xl space-y-6">
                <h2 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white transition-colors">
                  {t.cta.title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed transition-colors">
                  {t.cta.subtitle}
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-8 text-sm font-semibold shadow-sm active:scale-[0.98] transition-all"
                  >
                    {t.cta.createAccountFree}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 dark:border-white/20 bg-white/80 dark:bg-white/5 px-8 text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10 active:scale-[0.98] transition-colors"
                  >
                    {t.cta.alreadyHaveAccount}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer — Minimalist Adaptive Editorial ─────────────────────────── */}
      <footer className="border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black py-12 transition-colors">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <LogoTile size={32} withWordmark />
              <span className="text-xs text-zinc-500">© {new Date().getFullYear()} {t.footer.rights}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/login" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                {t.footer.login}
              </Link>
              <Link href="/register" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                {t.footer.register}
              </Link>
              <a href="#" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                {t.footer.terms}
              </a>
              <a href="#" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                {t.footer.privacy}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
