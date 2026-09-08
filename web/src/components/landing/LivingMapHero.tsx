'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useGSAP } from '@gsap/react'
import { Play, Pause } from 'lucide-react'

gsap.registerPlugin(useGSAP, MotionPathPlugin)

/**
 * "Orașul lucrează" — Immersive Living Map Hero with Snappy Autoplay & Manual Act Switcher.
 * 
 * Visuals: Exact immersive night-map canvas from the approved Zori design identity.
 * Behavior: Autoplay cycle (~2.8s per act) with zero scroll-jacking, plus minimal Swiss-style act switcher buttons.
 * Mobile: Fully responsive viewport scaling, cards positioned safely above bottom CTAs.
 */

const PINS = [
  { x: 900, y: 320, r: 7, hero: true },
  { x: 360, y: 210, r: 5 },
  { x: 620, y: 480, r: 5 },
  { x: 1130, y: 560, r: 6 },
  { x: 1040, y: 180, r: 4 },
  { x: 210, y: 430, r: 5 },
  { x: 760, y: 700, r: 5 },
  { x: 1290, y: 340, r: 4 },
]

const ACTS = [
  { id: 0, label: '01', caption: 'Turele se aprind pe hartă' },
  { id: 1, label: '02', caption: 'Alege o tură, vezi detaliile' },
  { id: 2, label: '03', caption: 'Match: lucrătorul e pe drum' },
  { id: 3, label: '04', caption: 'Zorii: registrul ITM, gata automat' },
]

const ACT_DURATION_MS = 2500 // Snappy 2.5s per act

export function LivingMapHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const [currentAct, setCurrentAct] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const currentTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Smoothly transition map elements to a specific act
  const transitionToAct = useCallback((actIndex: number) => {
    setCurrentAct(actIndex)

    if (!sectionRef.current) return

    // Safely kill active timeline and any ongoing tweens to prevent memory leaks
    if (currentTimelineRef.current) {
      currentTimelineRef.current.kill()
    }
    const q = gsap.utils.selector(sectionRef)
    gsap.killTweensOf(
      q(
        '[data-map-zoom], [data-shift-card], [data-match-toast], [data-itm-card], [data-dawn], [data-route], [data-worker], [data-pin], [data-itm-stamp]'
      )
    )

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
    currentTimelineRef.current = tl

    if (actIndex === 0) {
      // Act 1: Night map with all shift pins glowing
      tl.to(q('[data-map-zoom]'), { scale: 1, svgOrigin: '720 450', duration: 0.65 })
      tl.to(q('[data-shift-card]'), { autoAlpha: 0, y: 15, duration: 0.2 }, 0)
      tl.to(q('[data-match-toast]'), { autoAlpha: 0, scale: 0.9, duration: 0.15 }, 0)
      tl.to(q('[data-itm-card]'), { autoAlpha: 0, scale: 0.85, duration: 0.2 }, 0)
      tl.to(q('[data-dawn]'), { opacity: 0, duration: 0.35 }, 0)
      tl.to(q('[data-route]'), { strokeDashoffset: 1, duration: 0.2 }, 0)
      tl.to(q('[data-worker]'), { opacity: 0, duration: 0.2 }, 0)
      tl.fromTo(
        q('[data-pin]'),
        { scale: 0.8, opacity: 0.6 },
        { scale: 1, opacity: 1, stagger: 0.03, duration: 0.35 },
        0.05
      )
    } else if (actIndex === 1) {
      // Act 2: Camera zooms to café pin, shift card rises
      tl.to(q('[data-map-zoom]'), { scale: 1.5, svgOrigin: '900 320', duration: 0.7 })
      tl.to(q('[data-dawn]'), { opacity: 0, duration: 0.25 }, 0)
      tl.to(q('[data-match-toast]'), { autoAlpha: 0, duration: 0.15 }, 0)
      tl.to(q('[data-itm-card]'), { autoAlpha: 0, duration: 0.2 }, 0)
      tl.to(q('[data-route]'), { strokeDashoffset: 1, duration: 0.2 }, 0)
      tl.to(q('[data-worker]'), { opacity: 0, duration: 0.2 }, 0)
      tl.fromTo(
        q('[data-shift-card]'),
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.35 },
        0.2
      )
    } else if (actIndex === 2) {
      // Act 3: Worker traverses route to match & mutual pulse
      tl.to(q('[data-map-zoom]'), { scale: 1.4, svgOrigin: '720 400', duration: 0.65 })
      tl.to(q('[data-shift-card]'), { autoAlpha: 1, y: 0, duration: 0.2 }, 0)
      tl.to(q('[data-itm-card]'), { autoAlpha: 0, duration: 0.2 }, 0)
      tl.to(q('[data-dawn]'), { opacity: 0, duration: 0.2 }, 0)
      tl.to(q('[data-route]'), { strokeDashoffset: 0, duration: 0.65 }, 0.1)
      tl.to(q('[data-worker]'), { opacity: 1, duration: 0.1 }, 0.1)
      tl.fromTo(
        q('[data-worker]'),
        { motionPath: { path: '#gigtim-route', align: '#gigtim-route', alignOrigin: [0.5, 0.5], end: 0 } },
        { motionPath: { path: '#gigtim-route', align: '#gigtim-route', alignOrigin: [0.5, 0.5], end: 1 }, duration: 0.7, ease: 'power1.inOut' },
        0.1
      )
      tl.fromTo(
        q('[data-match-toast]'),
        { autoAlpha: 0, y: 8, scale: 0.94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.5)' },
        0.7
      )
      tl.to(
        [...q('[data-worker]'), ...q('[data-pin-hero]')],
        { scale: 1.5, duration: 0.12, repeat: 3, yoyo: true, transformOrigin: '50% 50%' },
        0.75
      )
    } else if (actIndex === 3) {
      // Act 4: Dawn sweep & stamped ITM register card
      tl.to(q('[data-map-zoom]'), { scale: 1.18, svgOrigin: '720 450', duration: 0.65 })
      tl.to(q('[data-shift-card]'), { autoAlpha: 0, y: -14, duration: 0.2 }, 0)
      tl.to(q('[data-match-toast]'), { autoAlpha: 0, duration: 0.15 }, 0)
      tl.to(q('[data-route]'), { strokeDashoffset: 0, opacity: 0.35, duration: 0.25 }, 0)
      tl.to(q('[data-dawn]'), { opacity: 1, duration: 0.65 }, 0.1)
      tl.fromTo(
        q('[data-itm-card]'),
        { autoAlpha: 0, scale: 0.88, y: 16 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.35 },
        0.2
      )
      tl.fromTo(
        q('[data-itm-stamp]'),
        { autoAlpha: 0, scale: 1.6, rotate: 12 },
        { autoAlpha: 1, scale: 1, rotate: -6, duration: 0.25, ease: 'power3.in' },
        0.5
      )
    }
  }, [])

  // Autoplay ticker — 0 React re-renders during an act, 100% leak-free
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    timerRef.current = setTimeout(() => {
      const nextAct = (currentAct + 1) % ACTS.length
      transitionToAct(nextAct)
    }, ACT_DURATION_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPaused, currentAct, transitionToAct])

  // Initial setup on mount: starts immediately after opening!
  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef)
      gsap.set(q('[data-shift-card]'), { autoAlpha: 0, y: 20 })
      gsap.set(q('[data-match-toast]'), { autoAlpha: 0, scale: 0.9 })
      gsap.set(q('[data-itm-card]'), { autoAlpha: 0, scale: 0.85 })
      gsap.set(q('[data-route]'), { strokeDashoffset: 1 })
      gsap.set(q('[data-worker]'), { opacity: 0 })
      gsap.set(q('[data-dawn]'), { opacity: 0 })

      // Pins ignite immediately with energy on Act 0
      gsap.from(q('[data-pin]'), {
        opacity: 0,
        scale: 0,
        duration: 0.4,
        stagger: 0.04,
        ease: 'back.out(2)',
      })

      return () => {
        if (currentTimelineRef.current) currentTimelineRef.current.kill()
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    },
    { scope: sectionRef }
  )

  const activeActData = ACTS[currentAct]

  return (
    <section
      ref={sectionRef}
      className="relative h-[92svh] sm:h-[100svh] min-h-[640px] overflow-hidden select-none"
      style={{ background: 'oklch(0.15 0.015 55)' }}
      aria-label="Orașul lucrează — turele pe harta orașului"
    >
      <style>{`
        @keyframes hero-act-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>

      {/* ── Night Map Vector (Edge-to-Edge) ────────────────── */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <g data-map-zoom>
          {/* Streets Grid */}
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
            r="8"
            fill="oklch(0.72 0.14 150)"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        </g>
      </svg>

      {/* ── Dawn Sweep Gradient (Act 4) ────────────────────── */}
      <div
        data-dawn
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, oklch(0.62 0.19 35 / 0.5), oklch(0.82 0.15 80 / 0.22) 55%, transparent 85%)',
        }}
        aria-hidden="true"
      />

      {/* ── Shift Detail Card (Act 2 & 3) — Personal Timișoara HoReCa ── */}
      <div
        data-shift-card
        className="absolute flex w-52 sm:w-68 flex-col gap-1.5 rounded-2xl border p-3.5 sm:p-4 shadow-2xl backdrop-blur-md"
        style={{
          right: '5%',
          top: '15%',
          background: 'oklch(0.205 0.012 50 / 0.95)',
          borderColor: 'oklch(1 0 0 / 0.14)',
        }}
        aria-hidden="true"
      >
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs sm:text-sm font-bold" style={{ color: 'oklch(0.96 0.01 75)' }}>
            Barista Specialist
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-medium">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            URGENT
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm sm:text-base font-extrabold" style={{ color: 'oklch(0.82 0.15 80)' }}>
            40 LEI/H
          </span>
          <span className="font-mono text-xs opacity-75" style={{ color: 'oklch(0.92 0.01 75)' }}>
            17:00–23:00 (240 lei)
          </span>
        </div>
        <span className="text-[11px] sm:text-xs" style={{ color: 'oklch(0.7 0.015 60)' }}>
          Cafeneaua din Cetate · Piața Unirii
        </span>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="flex-1 inline-flex h-8 sm:h-9 items-center justify-center rounded-xl text-[11px] sm:text-xs font-semibold shadow"
            style={{ background: 'oklch(0.62 0.19 35)', color: 'oklch(0.99 0.004 75)' }}
          >
            Aplică cu un click
          </span>
        </div>
      </div>

      {/* ── Match Confirmation Toast (Act 3) — Human Touch ── */}
      <div
        data-match-toast
        className="absolute flex items-center gap-3 rounded-2xl border p-3 shadow-2xl backdrop-blur-md"
        style={{
          right: '5%',
          top: '48%',
          background: 'oklch(0.18 0.012 50 / 0.95)',
          borderColor: 'oklch(0.48 0.13 150 / 0.5)',
        }}
        aria-hidden="true"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm">
          ✓
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-xs sm:text-sm font-bold" style={{ color: 'oklch(0.96 0.01 75)' }}>
            Andrei M. · Barista
          </span>
          <span className="text-[11px] font-mono" style={{ color: 'oklch(0.48 0.13 150)' }}>
            4.9 ★ (28 ture) · Sosește în 12 min
          </span>
        </div>
      </div>

      {/* ── ITM Register Card (Act 4) ──────────────────────── */}
      <div
        data-itm-card
        className="absolute left-1/2 top-[20%] sm:top-[26%] flex w-48 sm:w-60 -translate-x-1/2 flex-col gap-2 rounded-xl p-4 sm:p-5 shadow-2xl"
        style={{ background: 'oklch(0.99 0.008 75)' }}
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] sm:text-[10px] tracking-widest font-bold" style={{ color: 'oklch(0.4 0.02 55)' }}>
          REGISTRUL ZILIERILOR
        </span>
        <span className="h-1.5 rounded-full" style={{ background: 'oklch(0.9 0.01 75)' }} />
        <span className="h-1.5 w-3/4 rounded-full" style={{ background: 'oklch(0.9 0.01 75)' }} />
        <span className="h-1.5 w-5/6 rounded-full" style={{ background: 'oklch(0.9 0.01 75)' }} />
        <span
          data-itm-stamp
          className="self-end rounded border-2 px-2 py-0.5 font-mono text-[10px] sm:text-xs font-bold"
          style={{ color: 'oklch(0.48 0.13 150)', borderColor: 'oklch(0.48 0.13 150)' }}
        >
          CONFORM · LEGEA 52/2011
        </span>
      </div>

      {/* ── Headline + Value Prop + CTAs (Bottom Left) ─────── */}
      <div className="absolute bottom-8 sm:bottom-16 left-5 sm:left-12 z-20 flex max-w-xl flex-col gap-3.5 sm:gap-5 pr-4 sm:pr-0">
        {/* Status Chip */}
        <div
          className="inline-flex items-center gap-2 self-start rounded-full border px-3.5 py-1.5 backdrop-blur-md"
          style={{ borderColor: 'oklch(0.82 0.15 80 / 0.4)', background: 'oklch(0.18 0.01 50 / 0.7)' }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: 'oklch(0.82 0.15 80)' }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'oklch(0.82 0.15 80)' }} />
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-widest" style={{ color: 'oklch(0.82 0.15 80)' }}>
            TURE LIVE PE HARTA ORAȘULUI
          </span>
        </div>

        {/* Hero Title */}
        <h1
          className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight"
          style={{ color: 'oklch(0.96 0.01 75)' }}
        >
          Orașul lucrează.
          <br />
          <span style={{ color: 'oklch(0.82 0.15 80)' }}>Tu doar alegi tura.</span>
        </h1>

        {/* Hero Body */}
        <p className="max-w-md text-sm sm:text-base leading-relaxed md:text-lg" style={{ color: 'oklch(0.78 0.015 60)' }}>
          Ture de o zi în HoReCa, pe harta orașului tău. Aplici cu un click, angajatorul te
          acceptă, iar registrul ITM se generează automat.
        </p>

        {/* CTAs */}
        <div className="flex flex-row gap-3 pt-1">
          <Link
            href="/register"
            className="group inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-xl px-5 sm:px-7 text-sm font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:brightness-110 active:scale-[0.99]"
            style={{ background: 'oklch(0.55 0.19 35)', color: 'oklch(0.99 0.004 75)' }}
          >
            Creează cont
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <a
            href="#why-gigtim"
            className="inline-flex h-11 sm:h-12 items-center justify-center rounded-xl border px-4 sm:px-7 text-sm font-medium transition-colors duration-200 hover:bg-white/5"
            style={{ borderColor: 'oklch(1 0 0 / 0.2)', color: 'oklch(0.88 0.01 60)' }}
          >
            De ce GigTim?
          </a>
        </div>
      </div>

      {/* ── Act Switcher Buttons & Captions (Top Right on Mobile, Bottom Right on Desktop) ──── */}
      <div className="absolute top-20 right-4 sm:top-auto sm:bottom-16 sm:right-12 z-20 flex flex-col items-end gap-2">
        {/* Minimal Swiss Pill Switcher */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 rounded-xl border p-1 backdrop-blur-md shadow-xl"
          style={{ background: 'oklch(0.18 0.012 50 / 0.85)', borderColor: 'oklch(1 0 0 / 0.15)' }}
          role="tablist"
          aria-label="Comută actul demonstrației"
        >
          {ACTS.map((act) => {
            const isActive = currentAct === act.id
            return (
              <button
                key={act.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => transitionToAct(act.id)}
                className={`relative flex flex-col items-center justify-center h-7 sm:h-8 w-7 sm:w-8 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all duration-200 ${
                  isActive
                    ? 'shadow-md scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  background: isActive ? 'oklch(0.82 0.15 80)' : 'transparent',
                  color: isActive ? 'oklch(0.15 0.015 55)' : 'oklch(0.92 0.01 75)',
                }}
              >
                <span className={`leading-none ${isActive ? '-translate-y-[1px]' : ''}`}>
                  {act.label}
                </span>
                {/* Active progress micro-indicator — GPU compositor animation (0 React renders!) */}
                {isActive && (
                  <span className="absolute bottom-[3px] sm:bottom-1 left-1/2 -translate-x-1/2 w-3.5 sm:w-4 h-0.5 rounded-full bg-black/25 overflow-hidden">
                    <span
                      key={`progress-${act.id}`}
                      className="block h-full bg-black/80 origin-left"
                      style={{
                        animation: `hero-act-progress ${ACT_DURATION_MS}ms linear forwards`,
                        animationPlayState: isPaused ? 'paused' : 'running',
                      }}
                    />
                  </span>
                )}
              </button>
            )
          })}

          {/* Play/Pause Toggle */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center justify-center h-7 sm:h-8 w-7 sm:w-8 rounded-lg transition-opacity opacity-70 hover:opacity-100"
            style={{ color: 'oklch(0.92 0.01 75)' }}
            title={isPaused ? 'Reia redarea automată' : 'Pauză animație'}
            aria-label={isPaused ? 'Reia animația' : 'Pauză animație'}
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        </div>

        {/* Narrative Caption */}
        <div className="text-right">
          <span
            className="font-mono text-[10px] sm:text-[11px] tracking-widest font-semibold drop-shadow-xs"
            style={{ color: 'oklch(0.72 0.015 60)' }}
          >
            {`${currentAct + 1}/4 — ${activeActData.caption.toUpperCase()}`}
          </span>
        </div>
      </div>

      {/* ── Seamless atmospheric dissolve into the page body (Zero weird curves or shapes) ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 sm:h-36 z-10 select-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, oklch(0.15 0.015 55 / 0.4) 35%, var(--background) 100%)',
        }}
        aria-hidden="true"
      />
    </section>
  )
}
