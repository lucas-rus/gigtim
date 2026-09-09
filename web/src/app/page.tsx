'use client'

import Link from 'next/link'
import {
  Shield,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Star,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Coins,
  Coffee,
  FileCheck,
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
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* ── Navbar (floating over the night-map hero) ──────── */}
      <LandingNavbar />

      {/* ── Immersive Living Map Hero (Autoplay + Manual Switcher, No Scroll-Jacking) ── */}
      <LivingMapHero />

      {/* ── De Ce GigTim — Trust & Performance Matrix ──────── */}
      <section
        id="why-gigtim"
        className="relative py-16 sm:py-24 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 70% 45% at 50% 0%, oklch(0.82 0.15 80 / 0.09), transparent 70%), var(--background)',
        }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center space-y-3.5 mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-mono text-primary shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="font-semibold tracking-wide">{t.whyGigtim.badge}</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {t.whyGigtim.titlePrefix}<span className="text-primary-strong">{t.whyGigtim.titleHighlight}</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                {t.whyGigtim.subtitle}
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: <Zap className="h-6 w-6" />,
                  value: t.whyGigtim.stat1Value,
                  label: t.whyGigtim.stat1Label,
                  desc: t.whyGigtim.stat1Desc,
                },
                {
                  icon: <CheckCircle2 className="h-6 w-6" />,
                  value: t.whyGigtim.stat2Value,
                  label: t.whyGigtim.stat2Label,
                  desc: t.whyGigtim.stat2Desc,
                },
                {
                  icon: <Lock className="h-6 w-6" />,
                  value: t.whyGigtim.stat3Value,
                  label: t.whyGigtim.stat3Label,
                  desc: t.whyGigtim.stat3Desc,
                },
                {
                  icon: <Coins className="h-6 w-6" />,
                  value: t.whyGigtim.stat4Value,
                  label: t.whyGigtim.stat4Label,
                  desc: t.whyGigtim.stat4Desc,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/5 space-y-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-strong transition-all duration-300 group-hover:bg-primary-strong group-hover:text-primary-foreground group-hover:scale-105">
                    {stat.icon}
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {stat.value}
                  </div>
                  <div>
                    <div className="font-heading text-sm font-semibold text-foreground">
                      {stat.label}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {stat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Cum Funcționează — Editorial Workflow ───────────── */}
      <section id="how-it-works" className="border-t border-border/50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center space-y-3 mb-14 sm:mb-16">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {t.howItWorks.titlePrefix}<span className="text-primary-strong">{t.howItWorks.titleHighlight}</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t.howItWorks.subtitle}
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: t.howItWorks.step1Num,
                  title: t.howItWorks.step1Title,
                  desc: t.howItWorks.step1Desc,
                  tile: 'bg-primary-strong text-primary-foreground',
                },
                {
                  step: t.howItWorks.step2Num,
                  title: t.howItWorks.step2Title,
                  desc: t.howItWorks.step2Desc,
                  tile: 'bg-accent text-accent-foreground',
                },
                {
                  step: t.howItWorks.step3Num,
                  title: t.howItWorks.step3Title,
                  desc: t.howItWorks.step3Desc,
                  tile: 'bg-secondary text-secondary-foreground',
                },
              ].map((item) => (
                <div key={item.step} className="relative text-center rounded-2xl border border-border/70 bg-card/40 p-8 space-y-4 hover:border-primary/30 transition-colors">
                  <div
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-mono font-bold shadow-lg ${item.tile}`}
                  >
                    {item.step}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Transparență a Câștigurilor — Real Numbers in Timișoara ── */}
      <section id="income" className="border-t border-border/50 bg-card/25 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center space-y-3.5 mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-mono text-primary shadow-xs">
                <FileCheck className="h-3.5 w-3.5" />
                <span className="font-semibold tracking-wide">{t.income.badge}</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {t.income.titlePrefix}<span className="text-primary-strong">{t.income.titleHighlight}</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                {t.income.subtitle}
              </p>
            </div>
          </Reveal>

          {/* Role Rates Grid */}
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  role: t.income.role1Title,
                  icon: <Coffee className="h-5 w-5" />,
                  hourly: t.income.role1Hourly,
                  shiftTotal: t.income.role1Total,
                  shiftDesc: t.income.role1Desc,
                  badge: t.income.role1Badge,
                  accent: 'border-primary/30',
                },
                {
                  role: t.income.role2Title,
                  icon: <Utensils className="h-5 w-5" />,
                  hourly: t.income.role2Hourly,
                  shiftTotal: t.income.role2Total,
                  shiftDesc: t.income.role2Desc,
                  badge: t.income.role2Badge,
                  accent: 'border-accent/30',
                },
                {
                  role: t.income.role3Title,
                  icon: <Trees className="h-5 w-5" />,
                  hourly: t.income.role3Hourly,
                  shiftTotal: t.income.role3Total,
                  shiftDesc: t.income.role3Desc,
                  badge: t.income.role3Badge,
                  accent: 'border-secondary/40',
                },
                {
                  role: t.income.role4Title,
                  icon: <PartyPopper className="h-5 w-5" />,
                  hourly: t.income.role4Hourly,
                  shiftTotal: t.income.role4Total,
                  shiftDesc: t.income.role4Desc,
                  badge: t.income.role4Badge,
                  accent: 'border-primary/30',
                },
              ].map((item) => (
                <div
                  key={item.role}
                  className={`relative flex flex-col justify-between rounded-3xl border ${item.accent} bg-card/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary-strong">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-heading text-base font-bold text-foreground">
                        {item.role}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.shiftDesc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-2xl font-extrabold text-foreground">
                        {item.hourly}
                        <span className="text-xs font-sans font-normal text-muted-foreground ml-1">{t.income.perHour}</span>
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t.income.estimatedTotal}</span>
                      <span className="font-mono font-bold text-primary">
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
            <div className="mt-10 rounded-2xl border border-border/60 bg-muted/20 p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t.income.guarantee1Title}</span>
                    <span className="text-[11px] text-muted-foreground">{t.income.guarantee1Desc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-strong font-bold text-sm">
                    0%
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t.income.guarantee2Title}</span>
                    <span className="text-[11px] text-muted-foreground">{t.income.guarantee2Desc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground font-bold text-sm">
                    ITM
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{t.income.guarantee3Title}</span>
                    <span className="text-[11px] text-muted-foreground">{t.income.guarantee3Desc}</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Funcționalități Cheie ───────────────────────────── */}
      <section id="features" className="border-t border-border/50 bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center space-y-3 mb-14 sm:mb-16">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {t.features.titlePrefix}<span className="text-primary-strong">{t.features.titleHighlight}</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t.features.subtitle}
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Shield className="h-6 w-6 text-primary-strong" />,
                  title: t.features.f1Title,
                  desc: t.features.f1Desc,
                },
                {
                  icon: <ClipboardList className="h-6 w-6 text-primary-strong" />,
                  title: t.features.f2Title,
                  desc: t.features.f2Desc,
                },
                {
                  icon: <MessageSquare className="h-6 w-6 text-primary-strong" />,
                  title: t.features.f3Title,
                  desc: t.features.f3Desc,
                },
                {
                  icon: <BarChart3 className="h-6 w-6 text-primary-strong" />,
                  title: t.features.f4Title,
                  desc: t.features.f4Desc,
                },
                {
                  icon: <Star className="h-6 w-6 text-primary-strong" />,
                  title: t.features.f5Title,
                  desc: t.features.f5Desc,
                },
                {
                  icon: <Users className="h-6 w-6 text-primary-strong" />,
                  title: t.features.f6Title,
                  desc: t.features.f6Desc,
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border/80 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="border-t border-border/50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-card to-accent/10 border border-primary/25 p-8 sm:p-14 shadow-2xl">
              <div className="relative mx-auto max-w-2xl text-center space-y-4">
                <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  {t.cta.title}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
                  {t.cta.subtitle}
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-strong px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.99] transition-all"
                  >
                    {t.cta.createAccountFree}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-border/80 bg-card px-8 text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
                  >
                    {t.cta.alreadyHaveAccount}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border/50 bg-card/40 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <LogoTile size={32} withWordmark />
              <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} {t.footer.rights}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">
                {t.footer.login}
              </Link>
              <Link href="/register" className="hover:text-foreground transition-colors">
                {t.footer.register}
              </Link>
              <a href="#" className="hover:text-foreground transition-colors">
                {t.footer.terms}
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                {t.footer.privacy}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

