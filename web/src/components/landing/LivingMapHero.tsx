'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useGSAP } from '@gsap/react'
import { useTranslation } from '@/lib/i18n'
import {
  TIMISOARA_OSM_PATHS,
  TIMISOARA_LANDMARKS,
  WORKER_ROUTE_PATH,
} from './timisoara-osm-paths'

gsap.registerPlugin(useGSAP, MotionPathPlugin)

/**
 * "Orașul lucrează" — Immersive Living Map Hero with Authentic Timișoara OSM Cartography
 * 
 * Visuals: Pure black `#000000` canvas with authentic OpenStreetMap road and river vectors of Timișoara.
 * Behavior: Autoplay cycle (~2.5s per act) with zero scroll-jacking.
 * Typography & UI: Editorial serif italic accents, rounded-full pill CTAs, high-contrast monochrome polish.
 */

const TOTAL_ACTS = 4
const ACT_DURATION_MS = 2500

export function LivingMapHero() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const [currentAct, setCurrentAct] = useState(0)
  const currentTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Smoothly transition map elements to a specific act
  const transitionToAct = useCallback((actIndex: number) => {
    setCurrentAct(actIndex)

    if (!sectionRef.current) return

    if (currentTimelineRef.current) {
      currentTimelineRef.current.kill()
    }
    const q = gsap.utils.selector(sectionRef)
    gsap.killTweensOf(
      q(
        '[data-map-zoom], [data-shift-card], [data-match-toast], [data-itm-card], [data-dawn], [data-route], [data-worker], [data-pin], [data-itm-stamp], [data-pin-hero]'
      )
    )

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
    currentTimelineRef.current = tl

    // Invariant transformOrigin on [data-map-zoom] guarantees 0 cumulative drift
    if (actIndex === 0) {
      // Act 1: Panoramic night map with all shift pins glowing
      tl.to(q('[data-map-zoom]'), { scale: 1, x: 0, y: 0, duration: 0.65 })
      tl.to(q('[data-shift-card]'), { autoAlpha: 0, y: 15, duration: 0.2 }, 0)
      tl.to(q('[data-match-toast]'), { autoAlpha: 0, scale: 0.9, duration: 0.15 }, 0)
      tl.to(q('[data-itm-card]'), { autoAlpha: 0, scale: 0.85, duration: 0.2 }, 0)
      tl.to(q('[data-dawn]'), { opacity: 0, duration: 0.35 }, 0)
      tl.to(q('[data-route]'), { strokeDashoffset: 1, duration: 0.2 }, 0)
      tl.to(q('[data-worker]'), { opacity: 0, duration: 0.2 }, 0)
      tl.set(q('[data-worker], [data-pin-hero]'), { scale: 1 }, 0)
      tl.fromTo(
        q('[data-pin]'),
        { scale: 0.8, opacity: 0.6 },
        { scale: 1, opacity: 1, stagger: 0.03, duration: 0.35 },
        0.05
      )
    } else if (actIndex === 1) {
      // Act 2: Camera zooms in on Piața Unirii café pin, shift card rises
      tl.to(q('[data-map-zoom]'), { scale: 1.35, x: 0, y: 0, duration: 0.7 })
      tl.to(q('[data-dawn]'), { opacity: 0, duration: 0.25 }, 0)
      tl.to(q('[data-match-toast]'), { autoAlpha: 0, duration: 0.15 }, 0)
      tl.to(q('[data-itm-card]'), { autoAlpha: 0, duration: 0.2 }, 0)
      tl.to(q('[data-route]'), { strokeDashoffset: 1, duration: 0.2 }, 0)
      tl.to(q('[data-worker]'), { opacity: 0, duration: 0.2 }, 0)
      tl.set(q('[data-worker], [data-pin-hero]'), { scale: 1 }, 0)
      tl.fromTo(
        q('[data-shift-card]'),
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.35 },
        0.2
      )
    } else if (actIndex === 2) {
      // Act 3: Worker crosses Podul Michelangelo from Complex Studențesc to Unirii
      tl.to(q('[data-map-zoom]'), { scale: 1.18, x: -15, y: -10, duration: 0.65 })
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
        { scale: 1.35, duration: 0.12, repeat: 3, yoyo: true, transformOrigin: '50% 50%' },
        0.75
      )
    } else if (actIndex === 3) {
      // Act 4: Dawn sweep & stamped ITM register card
      tl.to(q('[data-map-zoom]'), { scale: 1.05, x: 0, y: 0, duration: 0.65 })
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

  // Check for ?act=X URL parameter on mount for direct act testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const actParam = params.get('act')
      if (actParam !== null) {
        const actNum = parseInt(actParam, 10)
        if (!isNaN(actNum) && actNum >= 0 && actNum <= 3) {
          const frame = requestAnimationFrame(() => {
            transitionToAct(actNum)
          })
          return () => cancelAnimationFrame(frame)
        }
      }
    }
  }, [transitionToAct])

  // Autoplay ticker
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      const nextAct = (currentAct + 1) % TOTAL_ACTS
      transitionToAct(nextAct)
    }, ACT_DURATION_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentAct, transitionToAct])

  // Initial setup on mount
  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef)
      gsap.set(q('[data-map-zoom]'), { scale: 1, x: 0, y: 0 })
      gsap.set(q('[data-shift-card]'), { autoAlpha: 0, y: 20 })
      gsap.set(q('[data-match-toast]'), { autoAlpha: 0, scale: 0.9 })
      gsap.set(q('[data-itm-card]'), { autoAlpha: 0, scale: 0.85 })
      gsap.set(q('[data-route]'), { strokeDashoffset: 1 })
      gsap.set(q('[data-worker]'), { opacity: 0, scale: 1 })
      gsap.set(q('[data-pin-hero]'), { scale: 1 })
      gsap.set(q('[data-dawn]'), { opacity: 0 })

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

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[680px] h-[95svh] sm:h-[100svh] sm:min-h-[640px] overflow-hidden select-none bg-slate-50 dark:bg-black text-zinc-950 dark:text-white transition-colors duration-300"
      aria-label="Orașul lucrează — turele pe harta orașului"
    >
      <style>{`
        /* SVG Map Color Rules (Automatic Light/Dark Mode) */
        .map-bg-rect { fill: #f8fafc; transition: fill 0.3s ease; }
        .map-bega-bed { stroke: #e0f2fe; }
        .map-bega-flow { stroke: url(#bega-water-flow-light); }
        .map-bega-flow-dash { stroke: #0284c7; }
        .map-road-residential { stroke: #e2e8f0; }
        .map-road-pedestrian { stroke: #cbd5e1; }
        .map-road-tertiary { stroke: #94a3b8; }
        .map-road-secondary-casing { stroke: #e2e8f0; }
        .map-road-secondary-core { stroke: #64748b; }
        .map-road-primary-casing { stroke: #cbd5e1; }
        .map-road-primary-core { stroke: #475569; }
        .map-road-primary-dash { stroke: #ffffff; }
        .map-label { fill: #475569; stroke: #f8fafc; stroke-width: 2.5px; paint-order: stroke fill; }
        .map-label-bridge { fill: #0284c7; stroke: #f8fafc; stroke-width: 3.5px; paint-order: stroke fill; font-weight: 800; }
        .map-label-campus { fill: #059669; stroke: #f8fafc; stroke-width: 2.5px; paint-order: stroke fill; }
        .map-label-hero { fill: #0f172a; }

        :is(.dark *) .map-bg-rect { fill: #000000; }
        :is(.dark *) .map-bega-bed { stroke: #05151c; }
        :is(.dark *) .map-bega-flow { stroke: url(#bega-water-flow-dark); }
        :is(.dark *) .map-bega-flow-dash { stroke: #267b9c; }
        :is(.dark *) .map-road-residential { stroke: #151515; }
        :is(.dark *) .map-road-pedestrian { stroke: #242220; }
        :is(.dark *) .map-road-tertiary { stroke: #222222; }
        :is(.dark *) .map-road-secondary-casing { stroke: #121212; }
        :is(.dark *) .map-road-secondary-core { stroke: #333333; }
        :is(.dark *) .map-road-primary-casing { stroke: #181818; }
        :is(.dark *) .map-road-primary-core { stroke: #484848; }
        :is(.dark *) .map-road-primary-dash { stroke: #888888; }
        :is(.dark *) .map-label { fill: #94a3b8; stroke: #000000; stroke-width: 2.5px; paint-order: stroke fill; }
        :is(.dark *) .map-label-bridge { fill: #38bdf8; stroke: #000000; stroke-width: 3.5px; paint-order: stroke fill; font-weight: 800; }
        :is(.dark *) .map-label-campus { fill: #34d399; stroke: #000000; stroke-width: 2.5px; paint-order: stroke fill; }
        :is(.dark *) .map-label-hero { fill: #ffffff; }
      `}</style>

      {/* ── Authentic Timișoara OSM Vector Map (Edge-to-Edge Adaptive Canvas) ── */}
      <div
        data-map-zoom
        className="absolute inset-0 h-full w-full pointer-events-none will-change-transform"
        style={{ transformOrigin: '50% 42%' }}
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bega-water-flow-light" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="bega-water-flow-dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#08242f" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#114b5f" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0d3443" stopOpacity="0.9" />
            </linearGradient>
            <filter id="hero-pin-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#e14d28" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Canvas Background Fill */}
          <rect width="1440" height="900" className="map-bg-rect" />

          {/* Group translated so Piața Unirii is in the visual center (x=720, y=380) */}
          <g transform="translate(60, 180)">
            {/* 1. Canalul Bega Waterway (Authentic Natural Curve) */}
            <path
              d={TIMISOARA_OSM_PATHS.water}
              className="map-bega-bed"
              strokeWidth="24"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={TIMISOARA_OSM_PATHS.water}
              className="map-bega-flow"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={TIMISOARA_OSM_PATHS.water}
              className="map-bega-flow-dash"
              strokeWidth="1.5"
              strokeDasharray="12 8"
              fill="none"
              opacity="0.65"
            />

            {/* 2. Residential & Minor Streets (City Texture) */}
            <path
              d={TIMISOARA_OSM_PATHS.residential}
              className="map-road-residential"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.75"
            />

            {/* 3. Pedestrian Arteries (Historic Cetate Core) */}
            <path
              d={TIMISOARA_OSM_PATHS.pedestrian}
              className="map-road-pedestrian"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />

            {/* 4. Tertiary Connecting Streets */}
            <path
              d={TIMISOARA_OSM_PATHS.tertiary}
              className="map-road-tertiary"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 5. Secondary Arteries & Boulevards (Double-Cased for Depth) */}
            <path
              d={TIMISOARA_OSM_PATHS.secondary}
              className="map-road-secondary-casing"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={TIMISOARA_OSM_PATHS.secondary}
              className="map-road-secondary-core"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 6. Primary Highways & Major Arteries */}
            <path
              d={TIMISOARA_OSM_PATHS.primary}
              className="map-road-primary-casing"
              strokeWidth="7.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={TIMISOARA_OSM_PATHS.primary}
              className="map-road-primary-core"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={TIMISOARA_OSM_PATHS.primary}
              className="map-road-primary-dash"
              strokeWidth="0.8"
              strokeDasharray="6 6"
              fill="none"
              opacity="0.5"
            />

            {/* 7. Landmark Typography (Clean Monospace, hidden on small mobile to avoid card overlap) */}
            <g className="hidden sm:block" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" letterSpacing="2">
              <text x="462" y="435" textAnchor="middle" className="map-label">PIAȚA VICTORIEI</text>
              <text x="960" y="258" textAnchor="middle" className="map-label">BASTION</text>
              <text x="1005" y="556" textAnchor="middle" className="map-label-bridge">PODUL MICHELANGELO</text>
              <text x="1260" y="732" textAnchor="middle" className="map-label-campus">COMPLEX STUDENȚESC</text>
              <text x="220" y="665" textAnchor="middle" className="map-label">IOSEFIN</text>
              <text x="1325" y="395" textAnchor="middle" className="map-label">FABRIC</text>
            </g>

            {/* 8. Worker Route (Complexul Studențesc -> Podul Michelangelo -> Piața Unirii) */}
            <path
              id="gigtim-route"
              data-route
              d={WORKER_ROUTE_PATH}
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="1"
              pathLength="1"
              opacity="0.95"
              fill="none"
            />

            {/* 9. Landmark Shift Pins with High-Prominence Center Hero Beacon */}
            {TIMISOARA_LANDMARKS.map((pin) => {
              if (pin.hero) {
                return (
                  <g
                    key="hero-center-pin"
                    data-pin
                    data-pin-hero
                    transform={`translate(${pin.x}, ${pin.y})`}
                    className="cursor-pointer"
                  >
                    {/* Animated multi-tier radar waves */}
                    <circle cx={0} cy={0} r={46} fill="rgba(225, 77, 40, 0.16)">
                      <animate attributeName="r" values="22;58;22" dur="2.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.75;0;0.75" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={0} cy={0} r={30} fill="rgba(225, 77, 40, 0.28)">
                      <animate attributeName="r" values="16;38;16" dur="2.6s" repeatCount="indefinite" begin="0.4s" />
                      <animate attributeName="opacity" values="0.85;0.1;0.85" dur="2.6s" repeatCount="indefinite" begin="0.4s" />
                    </circle>

                    {/* Glowing outer halo */}
                    <circle cx={0} cy={0} r={18} fill="#e14d28" opacity={0.35} />

                    {/* High-contrast brand red beacon with bold white border */}
                    <circle
                      cx={0}
                      cy={0}
                      r={11}
                      fill="#e14d28"
                      stroke="#ffffff"
                      strokeWidth={2.8}
                      filter="url(#hero-pin-glow)"
                    />

                    {/* Bright center dot */}
                    <circle cx={0} cy={0} r={4} fill="#ffffff" />

                    {/* Prominent floating capsule badge above the point */}
                    <g transform="translate(0, -24)" className="pointer-events-none select-none">
                      <rect
                        x="-52"
                        y="-12"
                        width="104"
                        height="22"
                        rx="11"
                        fill="#e14d28"
                        filter="drop-shadow(0 2px 8px rgba(225,77,40,0.5))"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="800"
                        fontFamily="JetBrains Mono, monospace"
                        letterSpacing="1.2"
                      >
                        PIAȚA UNIRII
                      </text>
                    </g>
                  </g>
                )
              }
              return (
                <g
                  key={`${pin.x}-${pin.y}`}
                  data-pin
                  transform={`translate(${pin.x}, ${pin.y})`}
                >
                  <circle cx={0} cy={0} r={pin.r * 2.5} fill="rgba(234, 179, 8, 0.2)" />
                  <circle cx={0} cy={0} r={pin.r} fill="#eab308" stroke="#ffffff" strokeWidth={1.5} />
                </g>
              )
            })}

            {/* 10. Worker Dot (Starts in Complexul Studențesc) */}
            <circle
              data-worker
              cx="1260"
              cy="700"
              r="8"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
          </g>
        </svg>
      </div>

      {/* ── Dawn Sweep Gradient (Act 4) ────────────────────── */}
      <div
        data-dawn
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(225, 77, 40, 0.3), rgba(234, 179, 8, 0.18) 55%, transparent 85%)',
        }}
        aria-hidden="true"
      />

      {/* ── Shift Detail Card (Act 2 & 3) — Adaptive Card ── */}
      <div
        data-shift-card
        className="absolute flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-3xl border border-zinc-200/90 dark:border-white/15 bg-white/95 dark:bg-zinc-950/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl top-[115px] right-4 sm:top-[125px] md:top-[135px] lg:top-[16%] sm:right-8 md:right-10 lg:right-[6%] transition-colors"
        aria-hidden="true"
      >
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs sm:text-sm font-bold text-zinc-950 dark:text-white">
            {t.hero.shiftCardTitle}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t.hero.urgent}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-base sm:text-lg font-extrabold text-[#c2410c] dark:text-amber-300">
            40 LEI/H
          </span>
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {t.hero.shiftHours}
          </span>
        </div>
        <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400">
          {t.hero.shiftLocation}
        </span>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="flex-1 inline-flex h-9 items-center justify-center rounded-full text-xs font-semibold shadow-sm bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
          >
            {t.hero.applyClick}
          </span>
        </div>
      </div>

      {/* ── Match Confirmation Toast (Act 3) — Human Touch ── */}
      <div
        data-match-toast
        className="absolute flex items-center gap-3 rounded-2xl border border-emerald-500/40 dark:border-emerald-500/30 bg-white/95 dark:bg-zinc-950/90 p-3.5 shadow-2xl backdrop-blur-xl top-[320px] right-4 sm:top-[285px] md:top-[305px] lg:top-[46%] sm:right-8 md:right-10 lg:right-[6%] max-w-[calc(100vw-2rem)] transition-colors"
        aria-hidden="true"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          ✓
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-xs sm:text-sm font-bold text-zinc-950 dark:text-white">
            {t.hero.matchWorker}
          </span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            {t.hero.matchShifts} · {t.hero.matchEta}
          </span>
        </div>
      </div>

      {/* ── ITM Register Card (Act 4) ──────────────────────── */}
      <div
        data-itm-card
        className="absolute left-1/2 top-[205px] sm:top-[22%] md:top-[24%] lg:top-[26%] flex w-56 sm:w-64 -translate-x-1/2 flex-col gap-2 rounded-2xl bg-white dark:bg-zinc-100 text-zinc-900 p-5 shadow-2xl border border-zinc-200 dark:border-white/20"
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] sm:text-[10px] tracking-widest font-bold text-zinc-500">
          {t.hero.itmCardTitle}
        </span>
        <span className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-300" />
        <span className="h-1.5 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-300" />
        <span className="h-1.5 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-300" />
        <span
          data-itm-stamp
          className="self-end rounded border-2 border-emerald-600 px-2 py-0.5 font-mono text-[10px] sm:text-xs font-bold text-emerald-700"
        >
          {t.hero.itmCompliance}
        </span>
      </div>

      {/* ── Headline + Value Prop + Pill CTAs (Bottom Left) ─────── */}
      <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 lg:bottom-16 left-4 sm:left-6 md:left-8 lg:left-12 z-20 flex max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl flex-col gap-2.5 sm:gap-4 lg:gap-5 pr-4 sm:pr-0">
        {/* Status Chip (Hidden on mobile per rule) */}
        <div className="hidden sm:inline-flex items-center gap-2 self-start rounded-full border border-zinc-200/90 dark:border-white/15 bg-white/90 dark:bg-zinc-950/80 px-3.5 py-1.5 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e14d28] dark:bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e14d28] dark:bg-amber-400" />
          </span>
          <span className="font-mono text-[9px] sm:text-[10px] lg:text-[11px] font-bold tracking-widest text-zinc-900 dark:text-amber-300">
            {t.hero.liveBadge}
          </span>
        </div>

        {/* Hero Title with Bending Spoons Serif Italic Highlight */}
        <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.12] sm:leading-[1.1] md:leading-[1.08] tracking-tight text-zinc-950 dark:text-white transition-colors">
          {t.hero.titleLine1}
          <br />
          <span className="font-serif italic font-normal text-[#c2410c] dark:text-amber-300">{t.hero.titleLine2}</span>
        </h1>

        {/* Hero Body */}
        <p className="max-w-md text-xs sm:text-sm lg:text-base leading-relaxed md:leading-normal lg:text-lg text-zinc-600 dark:text-zinc-400 transition-colors">
          {t.hero.description}
        </p>

        {/* Bending Spoons Pill CTAs */}
        <div className="flex flex-row gap-2.5 sm:gap-3 pt-0.5 sm:pt-1">
          <Link
            href="/register"
            className="group inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-6 sm:px-8 text-xs sm:text-sm font-semibold shadow-sm transition-all duration-300 active:scale-[0.98]"
          >
            {t.hero.createAccount}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <a
            href="#why-gigtim"
            className="inline-flex h-11 sm:h-12 items-center justify-center rounded-full border border-zinc-300 dark:border-white/20 bg-white/80 dark:bg-white/5 backdrop-blur-md px-5 sm:px-7 text-xs sm:text-sm font-medium text-zinc-900 dark:text-white transition-colors duration-200 hover:bg-zinc-100 dark:hover:bg-white/10 active:scale-[0.98]"
          >
            {t.hero.whyGigtim}
          </a>
        </div>
      </div>



      {/* ── Seamless atmospheric dissolve into page body ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 sm:h-36 z-10 select-none bg-gradient-to-b from-transparent via-slate-50/80 to-white dark:via-black/75 dark:to-black transition-colors"
        aria-hidden="true"
      />
    </section>
  )
}
