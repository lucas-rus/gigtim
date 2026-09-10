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
    <div className="min-h-screen bg-black font-sans text-white overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* ── Frosted Minimalist Navbar ──────── */}
      <LandingNavbar />

      {/* ── Immersive Living Map Hero with Real Timișoara OSM Geometry ── */}
      <LivingMapHero />

      {/* ── Editorial Statement Block (Bending Spoons Split Narrative) ── */}
      <section className="relative py-20 sm:py-28 border-t border-white/10 bg-black">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-mono text-zinc-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                </span>
                <span className="font-semibold tracking-wide uppercase">{t.statement.badge}</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
                {t.statement.titlePart1}{' '}
                <span className="font-serif italic font-normal text-amber-300">
                  {t.statement.titlePart2}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-8 border-t border-white/10 text-base sm:text-lg text-zinc-400 leading-relaxed">
                <p>{t.statement.col1}</p>
                <p>{t.statement.col2}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── De Ce GigTim — Bending Spoons Large Metric Callouts ──────── */}
      <section id="why-gigtim" className="relative py-20 sm:py-28 border-t border-white/10 bg-black">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="max-w-2xl space-y-4 mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-mono text-zinc-400">
                <span className="font-semibold tracking-wide uppercase">{t.whyGigtim.badge}</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                {t.whyGigtim.titlePrefix}
                <span className="font-serif italic font-normal text-amber-300">
                  {t.whyGigtim.titleHighlight}
                </span>
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed">
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
                  className="border-t border-white/15 pt-6 sm:pt-8 flex flex-col justify-between space-y-6 group"
                >
                  <div className="font-heading text-3xl sm:text-4xl lg:text-3xl xl:text-5xl font-extrabold text-white tracking-tight group-hover:text-amber-300 transition-colors whitespace-nowrap">
                    {stat.value}
                  </div>
                  <div className="space-y-2">
                    <div className="font-mono text-xs font-bold tracking-wider text-zinc-300 uppercase">
                      {stat.label}
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
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
      <section id="how-it-works" className="border-t border-white/10 py-20 sm:py-28 bg-black">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="max-w-2xl space-y-4 mb-14 sm:mb-18">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                {t.howItWorks.titlePrefix}
                <span className="font-serif italic font-normal text-amber-300">
                  {t.howItWorks.titleHighlight}
                </span>
              </h2>
              <p className="text-base text-zinc-400">
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
                  className="relative flex flex-col justify-between rounded-[32px] border border-white/10 bg-zinc-950/80 p-8 sm:p-10 hover:border-white/25 transition-all duration-300"
                >
                  <div className="space-y-6">
                    <span className="inline-block font-mono text-xs font-bold tracking-widest text-zinc-500 uppercase">
                      {item.step}
                    </span>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-400">
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
      <section id="income" className="border-t border-white/10 py-20 sm:py-28 bg-black">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="max-w-2xl space-y-4 mb-14 sm:mb-18">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-mono text-zinc-400">
                <FileCheck className="h-3.5 w-3.5 text-amber-300" />
                <span className="font-semibold tracking-wide uppercase">{t.income.badge}</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                {t.income.titlePrefix}
                <span className="font-serif italic font-normal text-amber-300">
                  {t.income.titleHighlight}
                </span>
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed">
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
                  className="relative flex flex-col justify-between rounded-[28px] border border-white/10 bg-zinc-950/80 p-7 hover:border-white/25 transition-all duration-300 space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-heading text-base font-bold text-white">
                        {item.role}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        {item.shiftDesc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-2xl font-extrabold text-white">
                        {item.hourly}
                        <span className="text-xs font-sans font-normal text-zinc-400 ml-1">{t.income.perHour}</span>
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">{t.income.estimatedTotal}</span>
                      <span className="font-mono font-bold text-emerald-400">
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
            <div className="mt-10 rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{t.income.guarantee1Title}</span>
                    <span className="text-[11px] text-zinc-400">{t.income.guarantee1Desc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white font-bold text-sm font-mono">
                    0%
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{t.income.guarantee2Title}</span>
                    <span className="text-[11px] text-zinc-400">{t.income.guarantee2Desc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 font-bold text-xs font-mono">
                    ITM
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{t.income.guarantee3Title}</span>
                    <span className="text-[11px] text-zinc-400">{t.income.guarantee3Desc}</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Funcționalități Cheie — 6-Grid Minimalist Feature Cards ── */}
      <section id="features" className="border-t border-white/10 py-20 sm:py-28 bg-black">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="max-w-2xl space-y-4 mb-14 sm:mb-18">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                {t.features.titlePrefix}
                <span className="font-serif italic font-normal text-amber-300">
                  {t.features.titleHighlight}
                </span>
              </h2>
              <p className="text-base text-zinc-400">
                {t.features.subtitle}
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Shield className="h-5 w-5 text-white" />,
                  title: t.features.f1Title,
                  desc: t.features.f1Desc,
                },
                {
                  icon: <ClipboardList className="h-5 w-5 text-white" />,
                  title: t.features.f2Title,
                  desc: t.features.f2Desc,
                },
                {
                  icon: <MessageSquare className="h-5 w-5 text-white" />,
                  title: t.features.f3Title,
                  desc: t.features.f3Desc,
                },
                {
                  icon: <BarChart3 className="h-5 w-5 text-white" />,
                  title: t.features.f4Title,
                  desc: t.features.f4Desc,
                },
                {
                  icon: <Star className="h-5 w-5 text-white" />,
                  title: t.features.f5Title,
                  desc: t.features.f5Desc,
                },
                {
                  icon: <Users className="h-5 w-5 text-white" />,
                  title: t.features.f6Title,
                  desc: t.features.f6Desc,
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[28px] border border-white/10 bg-zinc-950/60 p-8 transition-all duration-300 hover:border-white/25 hover:bg-zinc-900/40"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                    {feature.icon}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA Banner — Full-Width Bending Spoons Statement ─────── */}
      <section className="border-t border-white/10 py-20 sm:py-28 bg-black">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[36px] border border-white/15 bg-gradient-to-b from-zinc-950 to-black p-10 sm:p-16 text-center shadow-2xl">
              <div className="relative mx-auto max-w-2xl space-y-6">
                <h2 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {t.cta.title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
                  {t.cta.subtitle}
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-black shadow-sm hover:bg-zinc-200 active:scale-[0.98] transition-all"
                  >
                    {t.cta.createAccountFree}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-sm font-medium text-white hover:bg-white/10 active:scale-[0.98] transition-colors"
                  >
                    {t.cta.alreadyHaveAccount}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer — Minimalist Dark Editorial ─────────────────────────── */}
      <footer className="border-t border-white/10 bg-black py-12">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <LogoTile size={32} withWordmark />
              <span className="text-xs text-zinc-500">© {new Date().getFullYear()} {t.footer.rights}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-zinc-400">
              <Link href="/login" className="hover:text-white transition-colors">
                {t.footer.login}
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                {t.footer.register}
              </Link>
              <a href="#" className="hover:text-white transition-colors">
                {t.footer.terms}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {t.footer.privacy}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
