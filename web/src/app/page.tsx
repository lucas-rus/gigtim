import Link from 'next/link'
import {
  Shield,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Star,
  Users2,
  Zap,
  CheckCircle2,
  PhoneCall,
  Lock,
  ArrowRight,
} from 'lucide-react'
import { LogoMark, LogoTile } from '@/components/brand/Logo'
import { LivingMapHero } from '@/components/landing/LivingMapHero'
import { Reveal } from '@/components/landing/Reveal'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* ── Navbar (floating over the night-map hero) ──────── */}
      <nav className="absolute top-0 z-50 w-full backdrop-blur-sm bg-black/20 border-b border-white/5">
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
            <a href="#how-it-works" className="transition-opacity hover:opacity-100 hover:text-white">
              Cum funcționează
            </a>
            <a href="#why-gigtim" className="transition-opacity hover:opacity-100 hover:text-white">
              De ce GigTim
            </a>
            <a href="#features" className="transition-opacity hover:opacity-100 hover:text-white">
              Funcționalități
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
                <span className="font-semibold tracking-wide">SIGURANȚĂ &amp; CONFORMITATE LEGALĂ</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                De ce aleg afacerile și lucrătorii <span className="text-primary-strong">GigTim</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Cifre reale, proceduri legale simplificate și încredere totală la fiecare tură completată.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: <Zap className="h-6 w-6" />,
                  value: '< 2 min',
                  label: 'Publicare tură',
                  desc: 'Publici o tură în câteva atingeri de pe mobil sau laptop.',
                },
                {
                  icon: <CheckCircle2 className="h-6 w-6" />,
                  value: '99.2%',
                  label: 'Rată de prezentare',
                  desc: 'Lucrători verificați cu recenzii și scor de fiabilitate.',
                },
                {
                  icon: <Lock className="h-6 w-6" />,
                  value: '100%',
                  label: 'Legea 52/2011',
                  desc: 'Registrul zilierilor ITM se generează automat și conform.',
                },
                {
                  icon: <PhoneCall className="h-6 w-6" />,
                  value: '24/7',
                  label: 'Suport dedicat',
                  desc: 'Echipa noastră locală este alături de tine la fiecare pas.',
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
                Simplu ca <span className="text-primary-strong">1, 2, 3</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Începe să lucrezi sau să angajezi în mai puțin de 5 minute.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Creează contul gratuit',
                  desc: 'Înregistrează-te ca Lucrător sau Angajator. Completează profilul și verifică datele de identitate rapid conform GDPR.',
                  tile: 'bg-primary-strong text-primary-foreground',
                },
                {
                  step: '02',
                  title: 'Publică sau aplică',
                  desc: 'Angajatorii publică ture pe hartă cu detalii complete. Lucrătorii aplică cu un singur click fără birocrație.',
                  tile: 'bg-accent text-accent-foreground',
                },
                {
                  step: '03',
                  title: 'Lucrează și ești plătit',
                  desc: 'Prezintă-te la tură, finalizează munca, registrul ITM se semnează electronic și primești plata garantată.',
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

      {/* ── Funcționalități Cheie ───────────────────────────── */}
      <section id="features" className="border-t border-border/50 bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center space-y-3 mb-14 sm:mb-16">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Tot ce ai nevoie, <span className="text-primary-strong">într-un singur loc</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                De la harta interactivă live până la generarea raportului ITM — tot fluxul este automatizat.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Shield className="h-6 w-6 text-primary-strong" />,
                  title: 'Verificare ID securizată',
                  desc: 'Identitatea lucrătorilor este stocată criptat conform GDPR. CNP-ul și seria CI sunt validate înainte de aplicare.',
                },
                {
                  icon: <ClipboardList className="h-6 w-6 text-primary-strong" />,
                  title: 'Management ture intuitiv',
                  desc: 'Publică ture, filtrează candidați după calificări și acceptă aplicările dorite într-un singur panou simplu.',
                },
                {
                  icon: <MessageSquare className="h-6 w-6 text-primary-strong" />,
                  title: 'Chat direct în timp real',
                  desc: 'Comunică instant cu lucrătorii acceptați prin mesageria privată integrată, sincronizată pe web și mobil.',
                },
                {
                  icon: <BarChart3 className="h-6 w-6 text-primary-strong" />,
                  title: 'Export ITM automat',
                  desc: 'Generează registrul zilierilor conform Legii 52/2011 cu toate rubricile obligatorii completate automat.',
                },
                {
                  icon: <Star className="h-6 w-6 text-primary-strong" />,
                  title: 'Sistem mutual de recenzii',
                  desc: 'Recenzii după fiecare tură completată. Scorul de fiabilitate ajută angajatorii să aleagă cei mai serioși zilieri.',
                },
                {
                  icon: <Users2 className="h-6 w-6 text-primary-strong" />,
                  title: 'Comunitate HoReCa locală',
                  desc: 'Forum dedicat pentru sfaturi, recomandări, legislație și oportunități în Timișoara și județele vecine.',
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
                  Gata să începi?
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
                  Alătură-te zilierilor și angajatorilor din Timișoara care folosesc GigTim pentru o muncă mai rapidă,
                  mai simplă și 100% legală.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-strong px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.99] transition-all"
                  >
                    Creează cont gratuit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-border/80 bg-card px-8 text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
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
      <footer className="border-t border-border/50 bg-card/40 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <LogoTile size={32} withWordmark />
              <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} GigTim</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">
                Autentificare
              </Link>
              <Link href="/register" className="hover:text-foreground transition-colors">
                Înregistrare
              </Link>
              <a href="#" className="hover:text-foreground transition-colors">
                Termeni și Condiții
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Politica de Confidențialitate
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
