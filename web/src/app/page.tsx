import Link from 'next/link'
import { Shield, ClipboardList, MessageSquare, BarChart3, Star, Users2, Zap, CheckCircle2, PhoneCall, Lock } from 'lucide-react'
import { LogoMark, LogoTile } from '@/components/brand/Logo'
import { LivingMapHero } from '@/components/landing/LivingMapHero'
import { Reveal } from '@/components/landing/Reveal'

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background font-sans text-foreground">
      {/* ── Navbar (floating over the night-map hero) ──────── */}
      <nav className="absolute top-0 z-50 w-full backdrop-blur-sm bg-black/15 border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
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

          <div className="hidden items-center gap-8 text-sm md:flex" style={{ color: 'oklch(0.75 0.015 60)' }}>
            <a href="#features" className="transition-opacity hover:opacity-100 hover:text-white">
              Funcționalități
            </a>
            <a href="#how-it-works" className="transition-opacity hover:opacity-100 hover:text-white">
              Cum funcționează
            </a>
            <a href="#stats" className="transition-opacity hover:opacity-100 hover:text-white">
              De ce GigTim
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: 'oklch(0.85 0.01 60)' }}
            >
              Conectare
            </Link>
            <Link
              href="/register"
              className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-md shadow-primary/20 active:scale-[0.98]"
              style={{ background: 'oklch(0.55 0.19 35)', color: 'oklch(0.99 0.004 75)' }}
            >
              Începe acum
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero: the living map, four acts on scroll ──────── */}
      <LivingMapHero />

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                Tot ce ai nevoie, <span className="text-primary-strong">într-un singur loc</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                De la publicarea turei până la generarea raportului ITM — totul automatizat.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Shield className="h-6 w-6 text-primary-strong" />,
                  title: 'Verificare ID automată',
                  desc: 'Identitatea lucrătorilor este verificată conform GDPR — CNP și serie CI stocate criptat și verificate înainte de aplicare.',
                },
                {
                  icon: <ClipboardList className="h-6 w-6 text-primary-strong" />,
                  title: 'Management ture',
                  desc: 'Publică ture, primește aplicări, acceptă sau respinge candidați — totul dintr-un singur panou simplu și rapid.',
                },
                {
                  icon: <MessageSquare className="h-6 w-6 text-primary-strong" />,
                  title: 'Chat în timp real',
                  desc: 'Comunică instant cu lucrătorii acceptați prin chat-ul integrat, cu sincronizare directă.',
                },
                {
                  icon: <BarChart3 className="h-6 w-6 text-primary-strong" />,
                  title: 'Export ITM automat',
                  desc: 'Generează automat registrul zilierilor conform Legii 52/2011 — CNP, CI, ore lucrate, remunerație netă.',
                },
                {
                  icon: <Star className="h-6 w-6 text-primary-strong" />,
                  title: 'Sistem de recenzii',
                  desc: 'Recenzii mutuale după fiecare tură. Scorul de fiabilitate ajută angajatorii să aleagă cei mai serioși lucrători.',
                },
                {
                  icon: <Users2 className="h-6 w-6 text-primary-strong" />,
                  title: 'Comunitate HoReCa',
                  desc: 'Forum dedicat pentru sfaturi, recomandări și oportunități locale în domeniul HoReCa din Timișoara și România.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border/80 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                Simplu ca <span className="text-primary-strong">1, 2, 3</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Începe să lucrezi sau să angajezi în mai puțin de 5 minute.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Creează contul',
                  desc: 'Înregistrează-te ca Lucrător sau Angajator. Completează profilul și verifică datele de identitate.',
                  tile: 'bg-primary-strong text-primary-foreground',
                },
                {
                  step: '2',
                  title: 'Publică sau aplică',
                  desc: 'Angajatorii publică ture pe hartă cu detalii complete. Lucrătorii aplică cu un singur click.',
                  tile: 'bg-accent text-accent-foreground',
                },
                {
                  step: '3',
                  title: 'Lucrează și ești plătit',
                  desc: 'Prezintă-te la tură, finalizează munca, primește plata conform Legii 52/2011 și lasă o recenzie.',
                  tile: 'bg-secondary text-secondary-foreground',
                },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div
                    className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold shadow-lg ${item.tile}`}
                  >
                    {item.step}
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Stats / Trust ──────────────────────────────────── */}
      <section id="stats" className="relative border-t border-border/40 bg-card/30">
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                De ce aleg afacerile <span className="text-primary-strong">GigTim</span>
              </h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <Zap className="h-6 w-6 text-primary-strong" />, value: '< 2 min', label: 'Timp de publicare tură' },
                { icon: <CheckCircle2 className="h-6 w-6 text-primary-strong" />, value: '99.2%', label: 'Rată de prezentare' },
                { icon: <PhoneCall className="h-6 w-6 text-primary-strong" />, value: '24/7', label: 'Suport disponibil' },
                { icon: <Lock className="h-6 w-6 text-primary-strong" />, value: '100%', label: 'Conformitate legală' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/80 bg-card p-6 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">{stat.icon}</div>
                  <div className="font-mono text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 p-10 md:p-16">
              <div className="relative mx-auto max-w-2xl text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">Gata să începi?</h2>
                <p className="mt-4 text-muted-foreground">
                  Alătură-te zilierilor și angajatorilor care folosesc GigTim pentru a-și simplifica munca zilnică.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/register"
                    className="group inline-flex h-12 items-center gap-2 rounded-xl bg-primary-strong px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:brightness-110 active:scale-[0.99]"
                  >
                    Creează cont gratuit
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-12 items-center rounded-xl border border-border/60 px-8 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-accent/10 hover:text-foreground"
                  >
                    Am deja cont
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <LogoTile size={32} withWordmark />
              <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/login" className="transition-colors hover:text-foreground">Autentificare</Link>
              <Link href="/register" className="transition-colors hover:text-foreground">Înregistrare</Link>
              <a href="#" className="transition-colors hover:text-foreground">Termeni</a>
              <a href="#" className="transition-colors hover:text-foreground">Confidențialitate</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
