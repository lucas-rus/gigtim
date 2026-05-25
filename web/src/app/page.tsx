import Link from 'next/link'
import { Shield, ClipboardList, MessageSquare, BarChart3, Star, Users2, Zap, CheckCircle2, PhoneCall, Lock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-bold">
              G
            </div>
            <span className="text-lg font-bold tracking-tight font-heading text-primary dark:text-primary">GigTim</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
              Funcționalități
            </a>
            <a href="#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
              Cum funcționează
            </a>
            <a href="#stats" className="text-muted-foreground transition-colors hover:text-foreground">
              De ce GigTim
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-accent"
            >
              Conectare
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
            >
              Începe acum
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative">
        {/* Background gradient effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute top-60 -left-40 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
          <div className="absolute top-40 -right-40 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-28 md:pt-32 md:pb-40">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary font-mono uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              Acum activ în toată România 🇷🇴
            </div>

            <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl md:text-6xl lg:text-7xl">
              Găsește zilieri{' '}
              <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
                de încredere
              </span>
              <br />
              în câteva minute
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl font-sans">
              Platformă de gig-economy pentru piața HoReCa din România.
              Conectăm lucrătorii zilieri verificați cu afacerile care au nevoie de ei.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
              >
                Creează cont gratuit
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border/60 px-8 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-foreground hover:bg-accent/50"
              >
                Cum funcționează?
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-14 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
              {[
                { value: '100+', label: 'Angajatori activi' },
                { value: '1,500+', label: 'Zilieri verificați' },
                { value: '10,000+', label: 'Ture completate' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight font-heading md:text-4xl">
              Tot ce ai nevoie,{' '}
              <span className="text-primary">într-un singur loc</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              De la publicarea turei până la generarea raportului ITM — totul automatizat.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Shield className="h-6 w-6 text-primary animate-pulse" />,
                title: 'Verificare ID automată',
                desc: 'Identitatea lucrătorilor este verificată automat prin Persona — OCR pe CI + recunoaștere facială.',
              },
              {
                icon: <ClipboardList className="h-6 w-6 text-primary" />,
                title: 'Management ture',
                desc: 'Publică ture, primește aplicări, acceptă sau respinge candidați — totul dintr-un singur panou.',
              },
              {
                icon: <MessageSquare className="h-6 w-6 text-primary" />,
                title: 'Chat în timp real',
                desc: 'Comunică instant cu lucrătorii acceptați prin chat-ul integrat, cu notificări push.',
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-primary" />,
                title: 'Export ITM automat',
                desc: 'Generează automat registrul zilierilor conform Legii 52/2011 — CNP, CI, date complete.',
              },
              {
                icon: <Star className="h-6 w-6 text-primary" />,
                title: 'Sistem de recenzii',
                desc: 'Recenzii mutuale după fiecare tură. Scorul de fiabilitate ajută angajatorii să aleagă mai bine.',
              },
              {
                icon: <Users2 className="h-6 w-6 text-primary" />,
                title: 'Forum comunitar',
                desc: 'Sfaturi, întrebări legale, oportunități — o comunitate activă de zilieri și angajatori.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#eff6ff] dark:bg-muted text-2xl transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold font-heading">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight font-heading md:text-4xl">
              Simplu ca{' '}
              <span className="text-primary">1, 2, 3</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Începe să lucrezi sau să angajezi în mai puțin de 5 minute.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Creează contul',
                desc: 'Înregistrează-te ca Angajat sau Angajator. Completează profilul și verifică-ți identitatea.',
                gradient: 'from-blue-500 to-cyan-400',
              },
              {
                step: '2',
                title: 'Publică sau aplică',
                desc: 'Angajatorii publică ture cu detalii complete. Lucrătorii aplică cu un singur click.',
                gradient: 'from-primary to-purple-400',
              },
              {
                step: '3',
                title: 'Lucrează și câștigă',
                desc: 'Prezintă-te la tură, completează munca, primește plata. Lasă o recenzie.',
                gradient: 'from-purple-500 to-pink-400',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white text-xl font-bold shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold font-heading">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats / Trust ──────────────────────────────────── */}
      <section id="stats" className="relative border-t border-border/40 bg-card/30">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight font-heading md:text-4xl">
              De ce aleg afacerile{' '}
              <span className="text-primary">GigTim</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Zap className="h-6 w-6 text-primary" />, value: '< 2 min', label: 'Timp de publicare tură' },
              { icon: <CheckCircle2 className="h-6 w-6 text-primary" />, value: '99.2%', label: 'Rată de prezentare' },
              { icon: <PhoneCall className="h-6 w-6 text-primary" />, value: '24/7', label: 'Suport disponibil' },
              { icon: <Lock className="h-6 w-6 text-primary" />, value: '100%', label: 'Conformitate legală' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-card p-6 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded bg-[#eff6ff] dark:bg-muted">{stat.icon}</div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground font-mono uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-purple-500/10 p-10 md:p-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-[80px]" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-purple-500/10 blur-[80px]" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight font-heading md:text-4xl">
                Gata să începi?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Alătură-te miilor de zilieri și angajatori care folosesc GigTim
                pentru a-și simplifica munca zilnică.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
                >
                  Creează cont gratuit
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center rounded-xl border border-border/60 px-8 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-foreground hover:bg-accent/50"
                >
                  Am deja cont
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                G
              </div>
              <span className="font-bold">GigTim</span>
              <span className="text-xs text-muted-foreground">
                © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">Termeni</a>
              <a href="#" className="transition-colors hover:text-foreground">Confidențialitate</a>
              <a href="#" className="transition-colors hover:text-foreground">Contact</a>
              <a href="#" className="transition-colors hover:text-foreground">Ajutor</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
