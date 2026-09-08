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
  MapPin,
} from 'lucide-react'
import { LogoTile } from '@/components/brand/Logo'
import { LivingMapShowcase } from '@/components/landing/LivingMapShowcase'
import { Reveal } from '@/components/landing/Reveal'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* ── Sticky Navbar ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoTile size={36} withWordmark />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Navigare principală">
            <a href="#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
              Cum funcționează
            </a>
            <a href="#why-gigtim" className="text-muted-foreground transition-colors hover:text-foreground">
              De ce GigTim
            </a>
            <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
              Funcționalități
            </a>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
            >
              Conectare
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-primary-strong px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:brightness-110 active:scale-[0.99] transition-all"
            >
              Creează cont
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero & Interactive Showcase ────────────────────── */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 overflow-hidden" id="how-it-works">
        {/* Subtle Ambient Background Gradients */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute top-96 -left-48 h-[400px] w-[400px] rounded-full bg-accent/6 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12 sm:space-y-16">
          {/* Main Hero Header */}
          <div className="mx-auto max-w-3xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono font-semibold text-primary shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span>LIVE ÎN TIMIȘOARA &amp; ROMÂNIA</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Orașul lucrează.{' '}
              <br />
              <span className="bg-gradient-to-r from-primary-strong to-accent bg-clip-text text-transparent">
                Tu doar alegi tura.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground font-sans">
              Platforma modernă de zilieri pentru industria HoReCa. Conectăm direct lucrătorii verificați cu
              restaurantele și cafenelele locale — fără comisioane ascunse și cu export ITM automat conform Legii 52/2011.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-strong px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.99] transition-all"
              >
                Creează cont gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shifts"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-8 text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
              >
                <MapPin className="h-4 w-4 text-primary" />
                Vezi turele deschise
              </Link>
            </div>
          </div>

          {/* Autonomous Living Map Interactive Showcase (Zero Scroll Hijacking) */}
          <div className="pt-4">
            <LivingMapShowcase />
          </div>
        </div>
      </section>

      {/* ── De Ce GigTim — Trust & Performance Matrix ──────── */}
      <section id="why-gigtim" className="border-t border-border/50 bg-card/40 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center space-y-3 mb-14 sm:mb-16">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-3.5 py-1 text-xs font-mono text-muted-foreground">
                <Lock className="h-3 w-3 text-primary" />
                <span>SIGURANȚĂ &amp; CONFORMITATE LEGALĂ</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                De ce aleg afacerile și lucrătorii <span className="text-primary-strong">GigTim</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Cifre reale, proceduri legale simplificate și încredere totală la fiecare tură.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: <Zap className="h-6 w-6 text-primary-strong" />,
                  value: '< 2 min',
                  label: 'Publicare tură',
                  desc: 'Publici o tură în câteva atingeri de pe mobil sau laptop.',
                },
                {
                  icon: <CheckCircle2 className="h-6 w-6 text-primary-strong" />,
                  value: '99.2%',
                  label: 'Rată de prezentare',
                  desc: 'Lucrători verificați cu recenzii și scor de fiabilitate.',
                },
                {
                  icon: <Lock className="h-6 w-6 text-primary-strong" />,
                  value: '100%',
                  label: 'Legea 52/2011',
                  desc: 'Registrul zilierilor ITM se generează automat și conform.',
                },
                {
                  icon: <PhoneCall className="h-6 w-6 text-primary-strong" />,
                  value: '24/7',
                  label: 'Suport dedicat',
                  desc: 'Echipa noastră locală este alături de tine la fiecare pas.',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 space-y-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15">
                    {stat.icon}
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
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

      {/* ── Funcționalități Cheie ───────────────────────────── */}
      <section id="features" className="border-t border-border/50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center space-y-3 mb-14 sm:mb-16">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Tot ce ai nevoie, <span className="text-primary-strong">într-un singur loc</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                De la afișarea pe hartă până la generarea raportului ITM — tot fluxul este automatizat.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Shield className="h-6 w-6 text-primary-strong" />,
                  title: 'Verificare identitate securizată',
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
