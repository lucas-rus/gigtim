'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useGSAP } from '@gsap/react'
import { MapPin, CheckCircle2, ShieldCheck, ArrowRight, Play, Pause, ChevronRight } from 'lucide-react'

gsap.registerPlugin(useGSAP, MotionPathPlugin)

const PINS = [
  { x: 900, y: 320, r: 7, hero: true, label: 'Piața Unirii' },
  { x: 360, y: 210, r: 5, label: 'Iosefin' },
  { x: 620, y: 480, r: 5, label: 'Elisabetin' },
  { x: 1130, y: 560, r: 6, label: 'Complex Studențesc' },
  { x: 1040, y: 180, r: 4, label: 'Circumvalațiunii' },
  { x: 210, y: 430, r: 5, label: 'Dâmbovița' },
  { x: 760, y: 700, r: 5, label: 'Girocului' },
  { x: 1290, y: 340, r: 4, label: 'Fabric' },
]

export const STEPS = [
  {
    index: 0,
    number: '01',
    title: 'Ture live pe hartă',
    subtitle: 'Descoperi instant cererea din oraș',
    desc: 'Zeci de restaurante, cafenele și hoteluri din Timișoara publică ture urgente în timp real. Toate locațiile sunt cartografiate exact.',
    badge: 'Vizualizare Live',
  },
  {
    index: 1,
    number: '02',
    title: 'Alegi și aplici cu 1 click',
    subtitle: 'Fără CV-uri sau așteptare inutilă',
    desc: 'Vezi plata pe oră (minim 35 RON), programul exact și atribuțiile. Aplici pe loc fără birocrație.',
    badge: 'Fără CV',
  },
  {
    index: 2,
    number: '03',
    title: 'Match rapid & confirmat',
    subtitle: 'Angajatorul te acceptă instant',
    desc: 'Primești confirmarea pe telefon și intri în chat direct cu managerul locației. Totul este clar înainte să pleci spre tură.',
    badge: '< 5 Minute',
  },
  {
    index: 3,
    number: '04',
    title: 'Registru ITM & plată legală',
    subtitle: 'Conform Legii 52/2011 a zilierilor',
    desc: 'Registrul oficial al zilierilor se generează și se semnează electronic în aplicație. Plata este sigură și garantată.',
    badge: '100% Legal',
  },
]

const STEP_DURATION = 4500 // 4.5s per step

export function LivingMapShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  // Step transition animator
  const goToStep = useCallback((stepIdx: number) => {
    setCurrentStep(stepIdx)
    setProgress(0)

    if (!containerRef.current) return
    const q = gsap.utils.selector(containerRef)

    // Timeline for transitioning between acts
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })

    if (stepIdx === 0) {
      // Act 1: Full city map with glowing pins
      tl.to(q('[data-map-zoom]'), { scale: 1, x: 0, y: 0, duration: 0.8 })
      tl.to(q('[data-shift-card]'), { autoAlpha: 0, y: 20, duration: 0.3 }, 0)
      tl.to(q('[data-itm-card]'), { autoAlpha: 0, scale: 0.8, duration: 0.3 }, 0)
      tl.to(q('[data-dawn]'), { opacity: 0, duration: 0.5 }, 0)
      tl.to(q('[data-route]'), { strokeDashoffset: 1, duration: 0.3 }, 0)
      tl.to(q('[data-worker]'), { opacity: 0, duration: 0.2 }, 0)
      tl.fromTo(
        q('[data-pin]'),
        { scale: 0.8, opacity: 0.6 },
        { scale: 1, opacity: 1, stagger: 0.05, duration: 0.5 },
        0.2
      )
    } else if (stepIdx === 1) {
      // Act 2: Zoom to café pin & shift card rises
      tl.to(q('[data-map-zoom]'), { scale: 1.45, svgOrigin: '900 320', duration: 0.9 })
      tl.to(q('[data-dawn]'), { opacity: 0, duration: 0.3 }, 0)
      tl.to(q('[data-itm-card]'), { autoAlpha: 0, duration: 0.2 }, 0)
      tl.to(q('[data-route]'), { strokeDashoffset: 1, duration: 0.2 }, 0)
      tl.to(q('[data-worker]'), { opacity: 0, duration: 0.2 }, 0)
      tl.fromTo(
        q('[data-shift-card]'),
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        0.3
      )
    } else if (stepIdx === 2) {
      // Act 3: Worker traverses route to match
      tl.to(q('[data-map-zoom]'), { scale: 1.35, svgOrigin: '700 420', duration: 0.8 })
      tl.to(q('[data-shift-card]'), { autoAlpha: 1, y: 0, duration: 0.3 }, 0)
      tl.to(q('[data-itm-card]'), { autoAlpha: 0, duration: 0.2 }, 0)
      tl.to(q('[data-dawn]'), { opacity: 0, duration: 0.3 }, 0)
      tl.to(q('[data-route]'), { strokeDashoffset: 0, duration: 0.8 }, 0.2)
      tl.to(q('[data-worker]'), { opacity: 1, duration: 0.1 }, 0.2)
      tl.fromTo(
        q('[data-worker]'),
        { motionPath: { path: '#gigtim-route', align: '#gigtim-route', alignOrigin: [0.5, 0.5], end: 0 } },
        { motionPath: { path: '#gigtim-route', align: '#gigtim-route', alignOrigin: [0.5, 0.5], end: 1 }, duration: 0.9, ease: 'power1.inOut' },
        0.2
      )
      tl.to(
        [...q('[data-worker]'), ...q('[data-pin-hero]')],
        { scale: 1.6, duration: 0.15, repeat: 3, yoyo: true, transformOrigin: '50% 50%' },
        1.05
      )
    } else if (stepIdx === 3) {
      // Act 4: Dawn sweep and stamped ITM register
      tl.to(q('[data-map-zoom]'), { scale: 1.15, svgOrigin: '720 450', duration: 0.8 })
      tl.to(q('[data-shift-card]'), { autoAlpha: 0, y: -16, duration: 0.3 }, 0)
      tl.to(q('[data-route]'), { strokeDashoffset: 0, opacity: 0.3, duration: 0.4 }, 0)
      tl.to(q('[data-dawn]'), { opacity: 1, duration: 0.8 }, 0.1)
      tl.fromTo(
        q('[data-itm-card]'),
        { autoAlpha: 0, scale: 0.85, y: 20 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.5 },
        0.3
      )
      tl.fromTo(
        q('[data-itm-stamp]'),
        { autoAlpha: 0, scale: 1.8, rotate: 12 },
        { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.3, ease: 'power3.in' },
        0.7
      )
    }
  }, [])

  // Autoplay ticker
  useEffect(() => {
    if (isPaused) return
    const interval = 50 // tick every 50ms
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (interval / STEP_DURATION) * 100
        if (next >= 100) {
          const nextStep = (currentStep + 1) % STEPS.length
          goToStep(nextStep)
          return 0
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isPaused, currentStep, goToStep])

  // Initial animation on mount
  useGSAP(
    () => {
      const q = gsap.utils.selector(containerRef)
      gsap.set(q('[data-shift-card]'), { autoAlpha: 0, y: 20 })
      gsap.set(q('[data-itm-card]'), { autoAlpha: 0, scale: 0.85 })
      gsap.set(q('[data-route]'), { strokeDashoffset: 1 })
      gsap.set(q('[data-worker]'), { opacity: 0 })
      gsap.set(q('[data-dawn]'), { opacity: 0 })

      gsap.from(q('[data-pin]'), {
        opacity: 0,
        scale: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(2)',
      })
    },
    { scope: containerRef }
  )

  const activeStepData = STEPS[currentStep]

  return (
    <div className="w-full space-y-8" ref={containerRef}>
      {/* ── Interactive Step Selector Pills ────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {STEPS.map((step) => {
            const isActive = currentStep === step.index
            return (
              <button
                key={step.index}
                onClick={() => goToStep(step.index)}
                className={`group relative flex items-center gap-2.5 rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 min-h-[40px] whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-strong text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                    : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-lg text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-black/20 text-white'
                      : 'bg-muted text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  {step.number}
                </span>
                <span>{step.title}</span>

                {/* Progress bar inside active pill */}
                {isActive && !isPaused && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-white/40 overflow-hidden"
                  >
                    <span
                      className="block h-full bg-white transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Autoplay Play/Pause Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          title={isPaused ? 'Reia redarea automată' : 'Pauză animație'}
        >
          {isPaused ? <Play className="h-3.5 w-3.5 text-accent" /> : <Pause className="h-3.5 w-3.5 text-primary" />}
          <span className="hidden sm:inline">{isPaused ? 'Reia turul' : 'Autoplay'}</span>
        </button>
      </div>

      {/* ── Main Showcase Grid: Stage + Details ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Vector Stage (7 cols) */}
        <div
          className="relative lg:col-span-7 h-[360px] sm:h-[460px] rounded-3xl border border-border/80 overflow-hidden shadow-2xl bg-[#111419]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Night Map Vector */}
          <svg
            className="absolute inset-0 h-full w-full select-none"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            aria-hidden="true"
          >
            <g data-map-zoom>
              {/* Streets */}
              <g stroke="oklch(0.29 0.02 55)" strokeWidth="2">
                <path d="M0 180 L1440 140" />
                <path d="M0 390 L1440 360" strokeWidth="3.5" />
                <path d="M0 640 L1440 690" strokeWidth="3" />
                <path d="M0 810 L1440 780" />
                <path d="M230 0 L280 900" />
                <path d="M540 0 L500 900" strokeWidth="3.5" />
                <path d="M870 0 L920 900" strokeWidth="3" />
                <path d="M1180 0 L1150 900" />
                <path d="M700 0 L680 900" strokeWidth="1.5" />
              </g>

              {/* Bega River */}
              <path
                d="M0 520 C 260 470, 520 560, 780 510 C 1000 470, 1200 520, 1440 490"
                stroke="oklch(0.33 0.03 220)"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.45"
              />

              {/* Architectural Blocks */}
              <g stroke="oklch(0.25 0.02 55)" strokeWidth="1.5">
                <path d="M320 90 L450 90 L450 160 L320 160 Z" />
                <path d="M600 240 L730 240 L730 330 L600 330 Z" />
                <path d="M960 590 L1090 590 L1090 670 L960 670 Z" />
                <path d="M120 690 L250 690 L250 770 L120 770 Z" />
                <path d="M1230 120 L1360 120 L1360 200 L1230 200 Z" />
                <path d="M380 560 L470 560 L470 620 L380 620 Z" />
              </g>

              {/* Worker Route (drawn in Act 3) */}
              <path
                id="gigtim-route"
                data-route
                d="M330 640 C 480 610, 620 470, 900 330"
                stroke="oklch(0.82 0.15 80)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="1"
                pathLength="1"
                opacity="0.9"
              />

              {/* Shift Pins */}
              {PINS.map((pin) => (
                <g key={`${pin.x}-${pin.y}`} data-pin {...(pin.hero ? { 'data-pin-hero': true } : {})}>
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={pin.r * 2.8}
                    fill={pin.hero ? 'oklch(0.7 0.19 35 / 0.3)' : 'oklch(0.82 0.15 80 / 0.18)'}
                  />
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={pin.r}
                    fill={pin.hero ? 'oklch(0.7 0.19 35)' : 'oklch(0.82 0.15 80)'}
                  />
                </g>
              ))}

              {/* Worker Dot */}
              <circle
                data-worker
                cx="330"
                cy="640"
                r="8.5"
                fill="oklch(0.72 0.14 150)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          </svg>

          {/* Dawn Sweep (Act 4) */}
          <div
            data-dawn
            className="pointer-events-none absolute inset-0 transition-opacity"
            style={{
              background:
                'linear-gradient(to top, oklch(0.62 0.19 35 / 0.5), oklch(0.82 0.15 80 / 0.22) 55%, transparent 85%)',
            }}
            aria-hidden="true"
          />

          {/* Shift Bottom Card (Act 2 & 3) */}
          <div
            data-shift-card
            className="absolute flex w-52 sm:w-64 flex-col gap-1.5 rounded-2xl border p-3.5 sm:p-4 shadow-2xl backdrop-blur-md transition-all"
            style={{
              right: '6%',
              top: '16%',
              background: 'oklch(0.205 0.012 50 / 0.95)',
              borderColor: 'oklch(1 0 0 / 0.15)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs sm:text-sm font-bold text-white">
                Barista / Ospătar
              </span>
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="font-mono text-xs font-bold" style={{ color: 'oklch(0.82 0.15 80)' }}>
              35 RON/oră · Piața Unirii
            </span>
            <span className="text-[11px] text-white/70">
              Cafenea Centrul Vechi · Azi, 18:00
            </span>
            <span
              className="mt-1 inline-flex h-8 items-center justify-center rounded-xl text-[11px] font-semibold text-white shadow"
              style={{ background: 'oklch(0.62 0.19 35)' }}
            >
              Aplică cu 1 click →
            </span>
          </div>

          {/* ITM Register Card (Act 4) */}
          <div
            data-itm-card
            className="absolute left-1/2 top-[22%] sm:top-[26%] flex w-52 sm:w-60 -translate-x-1/2 flex-col gap-2 rounded-xl p-4 sm:p-5 shadow-2xl bg-white text-zinc-900"
          >
            <div className="flex items-center justify-between border-b pb-1">
              <span className="font-mono text-[9px] sm:text-[10px] tracking-wider font-bold text-zinc-600">
                REGISTRUL ZILIERILOR
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="space-y-1 py-0.5">
              <div className="h-1.5 rounded-full bg-zinc-200 w-full" />
              <div className="h-1.5 rounded-full bg-zinc-200 w-4/5" />
              <div className="h-1.5 rounded-full bg-zinc-200 w-2/3" />
            </div>
            <span
              data-itm-stamp
              className="self-end rounded border-2 border-emerald-600 px-2 py-0.5 font-mono text-[10px] sm:text-xs font-bold text-emerald-700 mt-1"
            >
              CONFORM · LEGEA 52/2011
            </span>
          </div>

          {/* Stage Bottom Overlay Info */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none text-white/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-[10px] sm:text-xs tracking-wider uppercase">
                Timișoara Live
              </span>
            </div>
            <span className="font-mono text-[10px] sm:text-xs tracking-wider opacity-60">
              Pas {currentStep + 1} din 4
            </span>
          </div>
        </div>

        {/* Right Column: Step Narrative & Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono font-semibold text-primary">
              <span>{activeStepData.badge}</span>
              <span>·</span>
              <span>Pasul {activeStepData.number}</span>
            </div>

            <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {activeStepData.title}
            </h3>

            <p className="text-sm font-semibold text-foreground/80">
              {activeStepData.subtitle}
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              {activeStepData.desc}
            </p>
          </div>

          {/* Feature highlights for this step */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-4 space-y-2.5">
            {currentStep === 0 && (
              <>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Hartă interactivă dedicată HoReCa</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Filtre rapide după rol (Barista, Ospătar, Bucătar)</span>
                </div>
              </>
            )}
            {currentStep === 1 && (
              <>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Plata per oră vizibilă direct și transparent</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Aplicare securizată fără încărcare de documente fizice</span>
                </div>
              </>
            )}
            {currentStep === 2 && (
              <>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Notificare în timp real când ești acceptat</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Canal direct de mesagerie cu angajatorul</span>
                </div>
              </>
            )}
            {currentStep === 3 && (
              <>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Generare automată a registrului zilierilor ITM</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Zero riscuri de amenzi pentru angajatori</span>
                </div>
              </>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-strong px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.99] transition-all"
            >
              Începe acum gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border/80 bg-card px-6 text-sm font-medium text-foreground hover:bg-accent/10 transition-colors"
            >
              Autentificare
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
