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
  { x: 750, y: 350, r: 8, hero: true }, // Cafeneaua din Cetate · Piața Unirii
  { x: 740, y: 160, r: 5 },             // Iulius Town
  { x: 715, y: 445, r: 6 },             // Piața Victoriei / Opera
  { x: 850, y: 640, r: 6 },             // Complex Studențesc
  { x: 795, y: 570, r: 5 },             // Parcul Rozelor / Terasa Bega
  { x: 450, y: 580, r: 5 },             // Iosefin / Piața Mocioni
  { x: 1120, y: 430, r: 5 },            // Fabric / Piața Traian
  { x: 980, y: 360, r: 4.5 },           // Take Ionescu
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
      // Act 1: Night map with all shift pins glowing — panoramic view over Timișoara
      tl.to(q('[data-map-zoom]'), { scale: 1, svgOrigin: '750 450', duration: 0.65 })
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
      // Act 2: Smooth camera zoom to Piața Unirii café pin, shift card rises (NO drift up-and-right!)
      tl.to(q('[data-map-zoom]'), { scale: 1.35, svgOrigin: '750 380', duration: 0.7 })
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
      // Act 3: Worker crosses Podul Michelangelo from Complex Studențesc to Unirii
      tl.to(q('[data-map-zoom]'), { scale: 1.3, svgOrigin: '790 480', duration: 0.65 })
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
      tl.to(q('[data-map-zoom]'), { scale: 1.15, svgOrigin: '750 450', duration: 0.65 })
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
          transitionToAct(actNum)
        }
      }
    }
  }, [transitionToAct])

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
      className="relative min-h-[680px] h-[95svh] sm:h-[100svh] sm:min-h-[640px] overflow-hidden select-none"
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
        <defs>
          <linearGradient id="bega-water" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a3b47" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#214d5e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1a3b47" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="bega-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2a657d" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#3888a8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2a657d" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <g data-map-zoom>
          {/* ── Parks / Green Spaces along Bega & Cetate ── */}
          <g fill="#1a2e22" opacity="0.45">
            {/* Parcul Botanic (North of Cetate) */}
            <path d="M 640 270 L 710 270 L 700 320 L 630 320 Z" />
            {/* Parcul Central Anton Scudier (South-West of Cathedral) */}
            <path d="M 600 520 L 680 520 L 670 580 L 590 570 Z" />
            {/* Parcul Justiției */}
            <path d="M 700 515 L 750 515 L 745 540 L 695 540 Z" />
            {/* Parcul Rozelor (Rose Park along Bega) */}
            <path d="M 765 545 L 830 545 L 820 600 L 760 595 Z" />
            {/* Parcul Copiilor (Children's Park) */}
            <path d="M 840 550 L 920 550 L 910 610 L 835 605 Z" />
            {/* Parcul Regina Maria (East) */}
            <path d="M 1030 510 L 1110 500 L 1100 540 L 1025 545 Z" />
          </g>

          {/* ── Secondary Streets Grid (Fabric, Iosefin, Elisabetin, Circumvalațiunii) ── */}
          <g stroke="#2a2522" strokeWidth="1.5" opacity="0.65">
            {/* Fabric Grid (East) */}
            <path d="M 1000 240 L 1380 240 M 1000 300 L 1400 300 M 1050 420 L 1400 420 M 1020 480 L 1380 480" />
            <path d="M 1080 200 L 1080 500 M 1160 200 L 1160 520 M 1240 200 L 1240 540 M 1320 200 L 1320 550" />

            {/* Iosefin & Elisabetin Grid (South-West) */}
            <path d="M 200 580 L 560 580 M 180 640 L 600 640 M 220 700 L 680 700 M 240 760 L 720 760" />
            <path d="M 280 520 L 280 820 M 360 520 L 360 840 M 440 520 L 440 850 M 520 520 L 520 850 M 600 520 L 600 860" />

            {/* Circumvalațiunii & Mehala (North-West) */}
            <path d="M 380 180 L 660 180 M 340 240 L 640 240 M 320 300 L 620 300 M 300 360 L 600 360" />
            <path d="M 420 120 L 420 420 M 480 120 L 480 420 M 540 140 L 540 420 M 600 160 L 600 420" />

            {/* Complexul Studențesc Grid (South-East) */}
            <path d="M 800 640 L 1080 640 M 800 700 L 1080 700 M 820 760 L 1080 760" />
            <path d="M 880 580 L 880 800 M 940 580 L 940 800 M 1000 580 L 1000 800" />
          </g>

          {/* ── Architectural Landmarks & Historic Plazas ── */}
          {/* Bastionul Maria Theresia (Historic Star Fortification) */}
          <path
            d="M 805 370 L 845 385 L 835 415 L 865 430 L 850 460 L 810 440 Z"
            fill="#3a251d"
            stroke="oklch(0.62 0.19 35)"
            strokeWidth="1.8"
            opacity="0.85"
          />

          {/* Piața Unirii (Rectangular Baroque Square) */}
          <g>
            <rect x="725" y="330" width="50" height="40" rx="3" fill="#2d2824" stroke="oklch(0.82 0.15 80)" strokeWidth="2" opacity="0.9" />
            {/* Domul Romano-Catolic mark */}
            <rect x="768" y="342" width="6" height="16" rx="1.5" fill="oklch(0.82 0.15 80)" />
            {/* Biserica Sârbească mark */}
            <rect x="726" y="342" width="6" height="16" rx="1.5" fill="oklch(0.82 0.15 80)" />
          </g>

          {/* Piața Libertății (Square with Red Brick Tone) */}
          <rect x="728" y="390" width="34" height="30" rx="3" fill="#2d2824" stroke="#b08968" strokeWidth="1.5" opacity="0.85" />

          {/* Piața Victoriei / Operei (Grand Corso from Opera to Cathedral) */}
          <g>
            <path d="M 726 430 L 744 430 L 738 490 L 720 490 Z" fill="#282420" stroke="oklch(0.82 0.15 80)" strokeWidth="1.8" opacity="0.9" />
            {/* Opera Română mark (North end) */}
            <rect x="724" y="426" width="22" height="7" rx="1.5" fill="oklch(0.62 0.19 35)" />
            {/* Catedrala Mitropolitană mark (South end) */}
            <polygon points="720,490 738,490 729,508" fill="oklch(0.82 0.15 80)" />
          </g>

          {/* Iulius Town / Mall Complex (North) */}
          <rect x="700" y="140" width="80" height="45" rx="6" fill="#252220" stroke="#4a5568" strokeWidth="1.5" opacity="0.7" />

          {/* ── Primary Arteries & Boulevards of Timișoara ── */}
          <g stroke="#3d3630" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Calea Aradului (North past Iulius Town) */}
            <path d="M 740 330 L 740 185 L 740 0" />
            {/* Calea Torontalului (North-West) */}
            <path d="M 725 330 L 670 200 L 580 0" />
            {/* Inelul 1 / Bulevardul Revoluției din 1989 & Take Ionescu (East) */}
            <path d="M 760 380 L 805 380 L 870 365 L 1440 340" />
            {/* Bulevardul Republicii (West to Gara de Nord) */}
            <path d="M 720 430 L 580 430 L 360 425 L 0 425" />
            {/* Bulevardul Michelangelo & Vasile Pârvan (South across Bega) */}
            <path d="M 810 440 L 830 545 L 850 640 L 860 900" strokeWidth="3.5" />
            {/* Bulevardul 16 Decembrie 1989 / Calea Șagului (South-West) */}
            <path d="M 700 495 L 600 525 L 480 620 L 380 900" strokeWidth="3.5" />
            {/* Calea Martirilor 1989 (South to Giroc) */}
            <path d="M 780 640 L 780 900" />
            {/* Bulevardul Liviu Rebreanu (Ring 2 South) */}
            <path d="M 0 780 L 1440 760" strokeWidth="2.5" opacity="0.7" />
            {/* Bulevardul Simion Bărnuțiu (Fabric to East) */}
            <path d="M 1050 355 L 1440 345" />
            {/* Splaiul Tudor Vladimirescu & Splaiul Nistrului (Along Bega) */}
            <path d="M 0 500 L 540 505 L 820 530 L 1440 520" strokeWidth="1.8" opacity="0.5" />
            <path d="M 0 540 L 540 545 L 840 565 L 1440 560" strokeWidth="1.8" opacity="0.5" />
          </g>

          {/* ── CANALUL BEGA (Real geographic meandering waterway) ── */}
          {/* Waterway Glow */}
          <path
            d="M 0 520 C 180 515, 340 510, 520 525 C 640 535, 730 525, 830 545 C 920 565, 1060 525, 1220 535 C 1340 545, 1400 540, 1440 540"
            stroke="url(#bega-glow)"
            strokeWidth="28"
            strokeLinecap="round"
          />
          {/* Main Riverbed */}
          <path
            d="M 0 520 C 180 515, 340 510, 520 525 C 640 535, 730 525, 830 545 C 920 565, 1060 525, 1220 535 C 1340 545, 1400 540, 1440 540"
            stroke="url(#bega-water)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Flow Centerline */}
          <path
            d="M 0 520 C 180 515, 340 510, 520 525 C 640 535, 730 525, 830 545 C 920 565, 1060 525, 1220 535 C 1340 545, 1400 540, 1440 540"
            stroke="#3888a8"
            strokeWidth="2"
            strokeDasharray="12 8"
            opacity="0.6"
          />

          {/* ── Bridges of Timișoara across Bega ── */}
          {/* Podul Ștefan cel Mare (Iosefin) */}
          <line x1="320" y1="500" x2="320" y2="530" stroke="#fdfbf9" strokeWidth="3.5" strokeLinecap="square" />
          {/* Podul Traian / Maria (Cathedral) */}
          <line x1="535" y1="512" x2="545" y2="538" stroke="#fdfbf9" strokeWidth="4" strokeLinecap="square" />
          {/* Podul Tinereții */}
          <line x1="685" y1="518" x2="685" y2="544" stroke="#fdfbf9" strokeWidth="3.5" strokeLinecap="square" />
          {/* Podul Michelangelo (Central University artery) */}
          <line x1="825" y1="532" x2="835" y2="558" stroke="#fdfbf9" strokeWidth="4.5" strokeLinecap="square" />
          {/* Podul Decebal / Neptun (Fabric) */}
          <line x1="1040" y1="515" x2="1045" y2="545" stroke="#fdfbf9" strokeWidth="3.5" strokeLinecap="square" />

          {/* ── Subtle District & Landmark Typography ── */}
          <g fontSize="10" fontWeight="700" letterSpacing="2" fill="#8c827a" opacity="0.65" className="font-mono">
            <text x="735" y="320" textAnchor="middle">CETATE</text>
            <text x="785" y="355">PIAȚA UNIRII</text>
            <text x="748" y="465">PIAȚA VICTORIEI</text>
            <text x="865" y="420">BASTION</text>
            <text x="740" y="132" textAnchor="middle">IULIUS TOWN</text>
            <text x="960" y="555" fill="#3888a8" opacity="0.8">CANALUL BEGA</text>
            <text x="890" y="675">COMPLEX STUDENȚESC</text>
            <text x="360" y="560">IOSEFIN</text>
            <text x="1150" y="390">FABRIC</text>
          </g>

          {/* ── Worker Route (drawn in Act 3) ── */}
          <path
            id="gigtim-route"
            data-route
            d="M 850 640 C 840 590, 832 555, 830 535 C 825 450, 810 395, 750 350"
            stroke="oklch(0.82 0.15 80)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="1"
            pathLength="1"
            opacity="0.95"
          />

          {/* ── Shift Pins ── */}
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
                stroke={pin.hero ? '#ffffff' : undefined}
                strokeWidth={pin.hero ? 2 : undefined}
              />
            </g>
          ))}

          {/* ── Worker Dot (starts in Complexul Studențesc) ── */}
          <circle
            data-worker
            cx="850"
            cy="640"
            r="8"
            fill="oklch(0.72 0.14 150)"
            stroke="#ffffff"
            strokeWidth="2"
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
        className="absolute flex w-68 max-w-[calc(100vw-2rem)] flex-col gap-1.5 rounded-2xl border p-3.5 sm:p-4 shadow-2xl backdrop-blur-md top-[145px] right-4 sm:top-[16%] sm:right-[6%]"
        style={{
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
        className="absolute flex items-center gap-3 rounded-2xl border p-3 shadow-2xl backdrop-blur-md top-[360px] right-4 sm:top-[46%] sm:right-[6%] max-w-[calc(100vw-2rem)]"
        style={{
          background: 'oklch(0.18 0.012 50 / 0.95)',
          borderColor: 'oklch(0.48 0.13 150 / 0.5)',
        }}
        aria-hidden="true"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm">
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
        className="absolute left-1/2 top-[175px] sm:top-[26%] flex w-52 sm:w-60 -translate-x-1/2 flex-col gap-2 rounded-xl p-4 sm:p-5 shadow-2xl"
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
      <div className="absolute bottom-6 sm:bottom-16 left-4 sm:left-12 z-20 flex max-w-xl flex-col gap-2.5 sm:gap-5 pr-4 sm:pr-0">
        {/* Status Chip */}
        <div
          className="inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-md"
          style={{ borderColor: 'oklch(0.82 0.15 80 / 0.4)', background: 'oklch(0.18 0.01 50 / 0.7)' }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: 'oklch(0.82 0.15 80)' }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'oklch(0.82 0.15 80)' }} />
          </span>
          <span className="font-mono text-[9px] sm:text-[11px] font-bold tracking-widest" style={{ color: 'oklch(0.82 0.15 80)' }}>
            TURE LIVE PE HARTA ORAȘULUI
          </span>
        </div>

        {/* Hero Title */}
        <h1
          className="font-heading text-2xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight"
          style={{ color: 'oklch(0.96 0.01 75)' }}
        >
          Orașul lucrează.
          <br />
          <span style={{ color: 'oklch(0.82 0.15 80)' }}>Tu doar alegi tura.</span>
        </h1>

        {/* Hero Body */}
        <p className="max-w-md text-xs sm:text-base leading-relaxed md:text-lg opacity-90" style={{ color: 'oklch(0.78 0.015 60)' }}>
          Ture de o zi în HoReCa, pe harta orașului tău. Aplici cu un click, angajatorul te
          acceptă, iar registrul ITM se generează automat.
        </p>

        {/* CTAs */}
        <div className="flex flex-row gap-2.5 sm:gap-3 pt-0.5 sm:pt-1">
          <Link
            href="/register"
            className="group inline-flex h-10 sm:h-12 items-center justify-center gap-2 rounded-xl px-4 sm:px-7 text-xs sm:text-sm font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:brightness-110 active:scale-[0.99]"
            style={{ background: 'oklch(0.55 0.19 35)', color: 'oklch(0.99 0.004 75)' }}
          >
            Creează cont
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <a
            href="#why-gigtim"
            className="inline-flex h-10 sm:h-12 items-center justify-center rounded-xl border px-3.5 sm:px-7 text-xs sm:text-sm font-medium transition-colors duration-200 hover:bg-white/5"
            style={{ borderColor: 'oklch(1 0 0 / 0.2)', color: 'oklch(0.88 0.01 60)' }}
          >
            De ce GigTim?
          </a>
        </div>
      </div>

      {/* ── Act Switcher Buttons & Captions (Top Right on Mobile, Bottom Right on Desktop) ──── */}
      <div className="absolute top-[72px] right-4 sm:top-auto sm:bottom-16 sm:right-12 z-20 flex flex-col items-end gap-1">
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
            className="font-mono text-[9px] sm:text-[11px] tracking-wider font-semibold drop-shadow-xs block"
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
