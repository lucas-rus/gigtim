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
  Lock,
  ArrowRight,
  Quote,
  Coins,
  Coffee,
  Sparkles,
  MapPin,
  FileCheck,
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
            <a href="#community" className="transition-opacity hover:opacity-100 hover:text-white">
              Povești locale
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
                <span className="font-semibold tracking-wide">SIGURANȚĂ &amp; CONFORMITATE LEGALĂ · TIMIȘOARA</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                De ce aleg afacerile și lucrătorii <span className="text-primary-strong">GigTim</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Cifre reale, proceduri legale simplificate și încredere reciprocă la fiecare tură din Timișoara.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: <Zap className="h-6 w-6" />,
                  value: '< 2 min',
                  label: 'Găsire rapidă',
                  desc: 'Terasă plină în Unirii? Publici tura și găsești om serios în doar câteva minute.',
                },
                {
                  icon: <CheckCircle2 className="h-6 w-6" />,
                  value: '99.2%',
                  label: 'Prezență la tură',
                  desc: 'Zilieri verificați cu recenzii locale. Fără absențe surpriză în mijlocul serviciului.',
                },
                {
                  icon: <Lock className="h-6 w-6" />,
                  value: '100%',
                  label: 'Legea 52/2011',
                  desc: 'Registrul Electronic al Zilierilor ITM se generează automat și se semnează pe telefon.',
                },
                {
                  icon: <Coins className="h-6 w-6" />,
                  value: 'Plată pe loc',
                  label: 'Remunerație sigură',
                  desc: 'Tarife orare clare (35–50 lei/h), plătite direct după tură fără comisioane ascunse.',
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
                Fie că ai nevoie urgentă de ajutor pe terasă sau cauți o tură flexibilă de weekend, începi în mai puțin de 5 minute.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Creează contul gratuit',
                  desc: 'Înregistrează-te ca Lucrător sau Angajator în 60 de secunde. Lucrătorii își adaugă actul de identitate doar când aplică la prima tură, respectând confidențialitatea GDPR.',
                  tile: 'bg-primary-strong text-primary-foreground',
                },
                {
                  step: '02',
                  title: 'Publică sau aplică pe hartă',
                  desc: 'Localurile din Timișoara publică turele cu tarif clar și locație exactă. Lucrătorii văd distanța, programul și aplică cu un singur click fără birocrație.',
                  tile: 'bg-accent text-accent-foreground',
                },
                {
                  step: '03',
                  title: 'Lucrează, ITM gata & ești plătit',
                  desc: 'Prezintă-te la tură, finalizează munca, registrul ITM este validat electronic pe loc și primești plata garantată direct la final de tură.',
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

      {/* ── Povești Locale — Real People from Timișoara HoReCa ── */}
      <section id="community" className="border-t border-border/50 bg-card/25 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center space-y-3.5 mb-14 sm:mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-mono text-primary shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-semibold tracking-wide">COMUNITATEA GIGTIM · TIMIȘOARA</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                Oameni reali. <span className="text-primary-strong">Povești autentice</span> din Cetate, Unirii și Complex.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Cum ajută GigTim cafenelele locale să rezolve urgențele de personal și oferă studenților libertatea de a munci flexibil și legal.
              </p>
            </div>
          </Reveal>

          {/* Testimonial Bento Grid */}
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: D-na Maria (Employer / Cafe Owner) */}
              <div className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/90 p-7 sm:p-9 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      <Quote className="h-6 w-6 opacity-75" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                        Proprietar Afacere Locală
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>5.0 (42 ture)</span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/90 italic">
                    „În weekendul festivalului din Piața Unirii am avut o avalanșă de clienți pe terasă. Un barista s-a îmbolnăvit vineri la prânz. Am publicat tura pe GigTim, iar în 20 de minute aveam un student priceput la espressor. Contractul de zilier și registrul ITM s-au semnat direct pe telefon.”
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary-strong font-heading font-bold text-sm">
                      M
                    </div>
                    <div>
                      <div className="font-heading text-sm font-bold text-foreground flex items-center gap-1.5">
                        D-na Maria
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          ✓ CUI Verificat
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Cafeneaua din Cetate · Piața Unirii
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline-block">
                    Angajator Activ
                  </span>
                </div>
              </div>

              {/* Card 2: Alex M. (Worker / Student Barista) */}
              <div className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/90 p-7 sm:p-9 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      <Coffee className="h-6 w-6 opacity-75" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                        Zilier &amp; Student
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>4.9 (34 ture)</span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/90 italic">
                    „Turele de weekend de 6-8 ore mă ajută să-mi plătesc căminul și cheltuielile fără să lipsesc de la cursuri la UVT în timpul săptămânii. Știu dinainte cât câștig pe oră (40 lei/h), iar banii îmi intră direct după ce termin tura.”
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary-strong font-heading font-bold text-sm">
                      A
                    </div>
                    <div>
                      <div className="font-heading text-sm font-bold text-foreground flex items-center gap-1.5">
                        Alex M.
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          ✓ CI Verificată
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Student UVT · Barista Piața Unirii
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline-block">
                    40 lei/oră
                  </span>
                </div>
              </div>

              {/* Card 3: Sorin B. (Event Manager) */}
              <div className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/90 p-7 sm:p-9 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      <Users2 className="h-6 w-6 opacity-75" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                        Manager Evenimente &amp; Catering
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>4.9 (118 zilieri)</span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/90 italic">
                    „Pentru evenimente mari și nunți în Timișoara am nevoie de 6-8 ospătari de încredere pentru o singură seară. Fără GigTim ar fi însemnat zeci de apeluri disperate. Acum totul este transparent și 100% conform Legii 52/2011.”
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary-strong font-heading font-bold text-sm">
                      S
                    </div>
                    <div>
                      <div className="font-heading text-sm font-bold text-foreground flex items-center gap-1.5">
                        Sorin B.
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          ✓ Partener HoReCa
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Catering &amp; Evenimente Timișoara
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline-block">
                    100% Legal
                  </span>
                </div>
              </div>

              {/* Card 4: Elena R. (Worker / Waiter) */}
              <div className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/90 p-7 sm:p-9 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      <Quote className="h-6 w-6 opacity-75" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                        Ospătar &amp; Ajutor Bar
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>5.0 (19 ture)</span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/90 italic">
                    „Apreciez că nu există promisiuni false. Aplici cu un click pe hartă, vezi locația exactă, orele și remunerația. La final de zi, munca ta e respectată și ai siguranța legii de partea ta.”
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary-strong font-heading font-bold text-sm">
                      E
                    </div>
                    <div>
                      <div className="font-heading text-sm font-bold text-foreground flex items-center gap-1.5">
                        Elena R.
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          ✓ Profil Verificat
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Piața Libertății · Timișoara
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline-block">
                    Plată Sigură
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Transparență & Câștiguri Banner (Stitch-inspired) */}
          <Reveal>
            <div className="mt-12 rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card/90 to-card p-6 sm:p-10 shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary">
                    <FileCheck className="h-4 w-4" />
                    TRANSPARENȚĂ TOTALĂ A VENITURILOR
                  </span>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                    Cât se câștigă în HoReCa Timișoara prin GigTim?
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
                    Fiecare tură are remunerația afișată transparent din primul moment. Fără negocieri incomode sau rețineri neanunțate.
                  </p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-4 sm:gap-8">
                  <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-center min-w-[130px]">
                    <div className="font-mono text-xl sm:text-2xl font-black text-primary-strong">
                      35–50 lei
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Tarif mediu / oră
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-center min-w-[130px]">
                    <div className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      210–300 lei
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Câștig / tură de 6h
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-center min-w-[130px]">
                    <div className="font-mono text-xl sm:text-2xl font-black text-foreground">
                      Legea 52
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Registru ITM generat
                    </div>
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
              <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} GigTim · Timișoara</span>
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
