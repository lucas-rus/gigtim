'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useGSAP } from '@gsap/react'
import { Play, Pause } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

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
  { id: 0, label: '01' },
  { id: 1, label: '02' },
  { id: 2, label: '03' },
  { id: 3, label: '04' },
]

const ACT_DURATION_MS = 2500 // Snappy 2.5s per act

export function LivingMapHero() {
  const { t } = useTranslation()
  const actCaptions = [
    t.hero.act1Caption,
    t.hero.act2Caption,
    t.hero.act3Caption,
    t.hero.act4Caption,
  ]
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
        '[data-map-zoom], [data-shift-card], [data-match-toast], [data-itm-card], [data-dawn], [data-route], [data-worker], [data-pin], [data-itm-stamp], [data-pin-hero]'
      )
    )

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
    currentTimelineRef.current = tl

    // CRITICAL: svgOrigin is strictly invariant ('750 450') across ALL acts to guarantee 0 cumulative matrix drift!
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
      // Act 2: Smooth camera zoom to Piața Unirii café pin, shift card rises (Zero drift!)
      tl.to(q('[data-map-zoom]'), { scale: 1.25, x: 0, y: 25, duration: 0.7 })
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
      tl.to(q('[data-map-zoom]'), { scale: 1.2, x: -20, y: -15, duration: 0.65 })
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
      tl.to(q('[data-map-zoom]'), { scale: 1.06, x: 0, y: 0, duration: 0.65 })
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
      gsap.set(q('[data-map-zoom]'), { scale: 1, x: 0, y: 0 })
      gsap.set(q('[data-shift-card]'), { autoAlpha: 0, y: 20 })
      gsap.set(q('[data-match-toast]'), { autoAlpha: 0, scale: 0.9 })
      gsap.set(q('[data-itm-card]'), { autoAlpha: 0, scale: 0.85 })
      gsap.set(q('[data-route]'), { strokeDashoffset: 1 })
      gsap.set(q('[data-worker]'), { opacity: 0, scale: 1 })
      gsap.set(q('[data-pin-hero]'), { scale: 1 })
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

      {/* ── Night Map Vector (Edge-to-Edge Realistic Timișoara Cartography) ── */}
      {/* Hardware-accelerated CSS transform container — strictly 0.000% matrix accumulation error */}
      <div
        data-map-zoom
        className="absolute inset-0 h-full w-full pointer-events-none will-change-transform"
        style={{ transformOrigin: '52% 42%' }}
      >
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bega-water" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#142e38" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#1b4252" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#214d5e" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#163440" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="bega-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2a657d" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#3888a8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2a657d" stopOpacity="0.15" />
          </linearGradient>
        </defs>


          {/* 1. Parks & Green Belts along Bega & Citadel */}
          <g fill="#17281c" opacity="0.5">
            {/* Parcul Botanic (North of Cetate) */}
            <path d="M 620 250 C 660 250, 710 260, 710 300 C 680 315, 630 310, 615 280 Z" />
            {/* Parcul Central Anton Scudier (West of Cathedral) */}
            <path d="M 580 500 C 630 495, 675 510, 670 560 C 620 565, 580 550, 575 515 Z" />
            {/* Parcul Justiției (Between Cathedral and Michelangelo) */}
            <path d="M 690 505 C 730 505, 755 510, 750 535 C 710 535, 685 525, 685 510 Z" />
            {/* Parcul Rozelor (Rose Park along Bega) */}
            <path d="M 760 535 C 810 535, 830 545, 825 585 C 780 585, 755 570, 755 545 Z" />
            {/* Parcul Copiilor Ion Creangă (Children's Park) */}
            <path d="M 835 540 C 895 540, 925 550, 920 595 C 865 595, 830 585, 830 550 Z" />
            {/* Parcul Regina Maria (East) */}
            <path d="M 1030 500 C 1080 490, 1120 500, 1115 535 C 1065 540, 1025 530, 1025 510 Z" />
            {/* Pădurea Verde hint (Far North-East) */}
            <path d="M 1200 80 C 1280 70, 1380 90, 1360 180 C 1270 170, 1190 140, 1200 80 Z" />
          </g>

          {/* 2. Urban Blocks / Building Footprints (Atmospheric city texture) */}
          <g fill="#1f1b18" stroke="#2a2420" strokeWidth="1" opacity="0.6">
            {/* Cetate Quarter Blocks */}
            <rect x="655" y="325" width="45" height="40" rx="3" />
            <rect x="655" y="380" width="45" height="35" rx="3" />
            <rect x="785" y="325" width="40" height="40" rx="3" />
            <rect x="785" y="380" width="40" height="35" rx="3" />
            {/* Complex Studențesc Dorms & Campus */}
            <rect x="870" y="650" width="55" height="30" rx="2" />
            <rect x="940" y="650" width="55" height="30" rx="2" />
            <rect x="870" y="700" width="55" height="30" rx="2" />
            <rect x="940" y="700" width="55" height="30" rx="2" />
            {/* Iosefin Residential Blocks */}
            <rect x="360" y="590" width="60" height="40" rx="2" />
            <rect x="440" y="590" width="60" height="40" rx="2" />
            <rect x="360" y="650" width="60" height="40" rx="2" />
            <rect x="440" y="650" width="60" height="40" rx="2" />
            {/* Fabric Residential Blocks */}
            <rect x="1100" y="370" width="50" height="35" rx="2" />
            <rect x="1170" y="370" width="50" height="35" rx="2" />
            <rect x="1100" y="425" width="50" height="35" rx="2" />
            <rect x="1170" y="425" width="50" height="35" rx="2" />
          </g>

          {/* 3. Secondary / Residential Streets (Grid Network) */}
          <g stroke="#26211d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
            {/* Fabric Street Grid (East) */}
            <path d="M 980 240 L 1400 240 M 980 300 L 1420 300 M 1040 420 L 1420 420 M 1020 480 L 1400 480" />
            <path d="M 1060 200 L 1060 510 M 1140 200 L 1140 525 M 1220 200 L 1220 535 M 1300 200 L 1300 545 M 1380 200 L 1380 550" />

            {/* Iosefin & Elisabetin Grid (South-West) */}
            <path d="M 160 580 L 560 580 M 140 640 L 620 640 M 180 700 L 680 700 M 200 760 L 720 760 M 220 820 L 750 820" />
            <path d="M 260 515 L 260 850 M 340 515 L 340 860 M 420 520 L 420 870 M 500 520 L 500 880 M 580 520 L 580 880" />

            {/* Circumvalațiunii & Mehala (North-West) */}
            <path d="M 360 160 L 650 160 M 320 220 L 630 220 M 300 280 L 610 280 M 280 340 L 590 340 M 260 400 L 570 400" />
            <path d="M 400 100 L 400 420 M 460 100 L 460 420 M 520 120 L 520 420 M 580 140 L 580 420" />

            {/* Complexul Studențesc & Girocului Grid (South-East) */}
            <path d="M 800 640 L 1120 640 M 800 700 L 1120 700 M 810 760 L 1120 760 M 820 820 L 1120 820" />
            <path d="M 870 580 L 870 860 M 935 580 L 935 860 M 1000 580 L 1000 860 M 1065 580 L 1065 860" />
          </g>

          {/* 4. Railway tracks to Gara de Nord (West) */}
          <g stroke="#3a3430" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5">
            <path d="M 0 380 L 320 380 L 360 420" />
            <path d="M 0 385 L 320 385 L 360 425" />
          </g>

          {/* 5. MAIN ROADS & BOULEVARDS (Double-Cased for "Actual Road" Appearance) */}
          {/* ROAD CASING (Outer dark contour giving roads physical body & depth) */}
          <g stroke="#1a1715" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Calea Aradului (North past Iulius Town) */}
            <path d="M 740 330 L 740 185 L 740 0" />
            {/* Calea Torontalului (North-West) */}
            <path d="M 720 330 L 660 190 L 560 0" />
            {/* Inelul 1 / Bulevardul Take Ionescu & Revoluției 1989 (East) */}
            <path d="M 750 375 L 810 375 L 880 360 L 1440 335" />
            {/* Bulevardul Simion Bărnuțiu (Fabric to Airport) */}
            <path d="M 1040 355 L 1440 345" />
            {/* Bulevardul Republicii (West to Gara de Nord) */}
            <path d="M 715 430 L 570 430 L 360 425 L 0 425" />
            {/* Bulevardul Michelangelo & Vasile Pârvan (South across Bega) */}
            <path d="M 810 435 L 830 545 L 850 640 L 860 900" />
            {/* Bulevardul 16 Decembrie 1989 / Calea Șagului (South-West to Shopping City) */}
            <path d="M 700 495 L 600 525 L 480 620 L 380 900" />
            {/* Calea Martirilor 1989 (Girocului - South to Giroc) */}
            <path d="M 780 640 L 780 900" />
            {/* Bulevardul Liviu Rebreanu (Ring 2 South) */}
            <path d="M 0 780 L 1440 760" />
            {/* Splaiul Tudor Vladimirescu & Splaiul Nistrului (South bank along Bega) */}
            <path d="M 0 540 L 525 545 L 830 565 L 1440 560" />
            {/* Splaiul Nicolae Titulescu (North bank along Bega) */}
            <path d="M 0 495 L 525 500 L 820 525 L 1440 515" />
          </g>

          {/* ROAD SURFACE / FILL (Warm charcoal asphalt fill with visible width) */}
          <g stroke="#3a322b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            {/* Calea Aradului */}
            <path d="M 740 330 L 740 185 L 740 0" />
            {/* Calea Torontalului */}
            <path d="M 720 330 L 660 190 L 560 0" />
            {/* Take Ionescu & Revoluției 1989 */}
            <path d="M 750 375 L 810 375 L 880 360 L 1440 335" />
            {/* Simion Bărnuțiu */}
            <path d="M 1040 355 L 1440 345" />
            {/* Republicii */}
            <path d="M 715 430 L 570 430 L 360 425 L 0 425" />
            {/* Michelangelo & Vasile Pârvan */}
            <path d="M 810 435 L 830 545 L 850 640 L 860 900" />
            {/* 16 Decembrie / Calea Șagului */}
            <path d="M 700 495 L 600 525 L 480 620 L 380 900" />
            {/* Calea Martirilor */}
            <path d="M 780 640 L 780 900" />
            {/* Liviu Rebreanu (Ring 2) */}
            <path d="M 0 780 L 1440 760" strokeWidth="3" />
            {/* Splaiuri along Bega */}
            <path d="M 0 540 L 525 545 L 830 565 L 1440 560" strokeWidth="2.5" />
            <path d="M 0 495 L 525 500 L 820 525 L 1440 515" strokeWidth="2.5" />
          </g>

          {/* ROAD CENTERLINES (Subtle lane markings on major boulevards) */}
          <g stroke="#52483e" strokeWidth="0.8" strokeDasharray="8 6" strokeLinecap="round" opacity="0.6">
            <path d="M 740 330 L 740 0" />
            <path d="M 810 435 L 830 545 L 850 640 L 860 900" />
            <path d="M 700 495 L 600 525 L 480 620 L 380 900" />
            <path d="M 750 375 L 880 360 L 1440 335" />
            <path d="M 715 430 L 360 425 L 0 425" />
          </g>

          {/* 6. CANALUL BEGA (Authentic geographic meandering waterway) */}
          {/* River Bed Trench / Banks */}
          <path
            d="M 0 520 C 180 515, 340 510, 520 525 C 640 535, 730 525, 830 545 C 920 565, 1060 525, 1220 535 C 1340 545, 1400 540, 1440 540"
            stroke="#0f2228"
            strokeWidth="26"
            strokeLinecap="round"
            fill="none"
          />
          {/* Waterway Glow */}
          <path
            d="M 0 520 C 180 515, 340 510, 520 525 C 640 535, 730 525, 830 545 C 920 565, 1060 525, 1220 535 C 1340 545, 1400 540, 1440 540"
            stroke="url(#bega-glow)"
            strokeWidth="22"
            strokeLinecap="round"
            fill="none"
          />
          {/* Main Water Stream */}
          <path
            d="M 0 520 C 180 515, 340 510, 520 525 C 640 535, 730 525, 830 545 C 920 565, 1060 525, 1220 535 C 1340 545, 1400 540, 1440 540"
            stroke="url(#bega-water)"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          {/* Water Center Current */}
          <path
            d="M 0 520 C 180 515, 340 510, 520 525 C 640 535, 730 525, 830 545 C 920 565, 1060 525, 1220 535 C 1340 545, 1400 540, 1440 540"
            stroke="#3888a8"
            strokeWidth="1.8"
            strokeDasharray="14 10"
            opacity="0.65"
            fill="none"
          />

          {/* 7. BRIDGES OVER BEGA (Engineered bridge decks with shadow and railings) */}
          {/* Podul Ștefan cel Mare (Iosefin) */}
          <g>
            <line x1="318" y1="504" x2="318" y2="536" stroke="#12100e" strokeWidth="7" strokeLinecap="butt" />
            <line x1="318" y1="504" x2="318" y2="536" stroke="#f0ebe6" strokeWidth="4" strokeLinecap="butt" />
            <line x1="315" y1="504" x2="315" y2="536" stroke="#4a423b" strokeWidth="1" />
            <line x1="321" y1="504" x2="321" y2="536" stroke="#4a423b" strokeWidth="1" />
          </g>
          {/* Podul Traian / Maria (Cathedral to 16 Decembrie) */}
          <g>
            <line x1="532" y1="510" x2="542" y2="540" stroke="#12100e" strokeWidth="7.5" strokeLinecap="butt" />
            <line x1="532" y1="510" x2="542" y2="540" stroke="#f0ebe6" strokeWidth="4.5" strokeLinecap="butt" />
          </g>
          {/* Podul Tinereții */}
          <g>
            <line x1="685" y1="516" x2="685" y2="546" stroke="#12100e" strokeWidth="6.5" strokeLinecap="butt" />
            <line x1="685" y1="516" x2="685" y2="546" stroke="#f0ebe6" strokeWidth="4" strokeLinecap="butt" />
          </g>
          {/* Podul Michelangelo (Central University Artery) */}
          <g>
            <line x1="823" y1="530" x2="835" y2="560" stroke="#12100e" strokeWidth="8" strokeLinecap="butt" />
            <line x1="823" y1="530" x2="835" y2="560" stroke="#fdfbf9" strokeWidth="5" strokeLinecap="butt" />
            <line x1="820" y1="530" x2="832" y2="560" stroke="#e14d28" strokeWidth="1.2" />
          </g>
          {/* Podul Decebal / Neptun (Fabric) */}
          <g>
            <line x1="1040" y1="513" x2="1046" y2="547" stroke="#12100e" strokeWidth="7" strokeLinecap="butt" />
            <line x1="1040" y1="513" x2="1046" y2="547" stroke="#f0ebe6" strokeWidth="4" strokeLinecap="butt" />
          </g>

          {/* 8. ARCHITECTURAL SQUARES & CETATE PEDESTRIAN STREETS */}
          {/* Bastionul Maria Theresia (Historic Star Fortification) */}
          <path
            d="M 805 370 L 845 385 L 835 415 L 865 430 L 850 460 L 810 440 Z"
            fill="#33201a"
            stroke="oklch(0.62 0.19 35)"
            strokeWidth="2"
            opacity="0.9"
          />

          {/* Piața Unirii (Grand Baroque Square with Domul Romano-Catolic & Biserica Sârbească) */}
          <g>
            <rect x="725" y="328" width="52" height="42" rx="4" fill="#2b241e" stroke="oklch(0.82 0.15 80)" strokeWidth="2.2" opacity="0.95" />
            {/* Domul Romano-Catolic mark (East) */}
            <rect x="769" y="340" width="6" height="18" rx="1.5" fill="oklch(0.82 0.15 80)" />
            {/* Biserica Sârbească mark (West) */}
            <rect x="727" y="340" width="6" height="18" rx="1.5" fill="oklch(0.82 0.15 80)" />
            {/* Monumentul Sfintei Treimi (Center Column) */}
            <circle cx="751" cy="349" r="2.5" fill="oklch(0.82 0.15 80)" />
          </g>

          {/* Piața Libertății (Red Brick Square & Tram Loop) */}
          <g>
            <rect x="728" y="388" width="36" height="32" rx="3" fill="#2d221c" stroke="#b08968" strokeWidth="1.8" opacity="0.9" />
            {/* Statuia Sfânta Maria și Sfântul Ioan Nepomuk */}
            <circle cx="746" cy="404" r="2" fill="#b08968" />
          </g>

          {/* Piața Victoriei / Operei (Grand Pedestrian Corso from Opera to Cathedral) */}
          <g>
            <path d="M 724 428 L 746 428 L 740 492 L 718 492 Z" fill="#29221c" stroke="oklch(0.82 0.15 80)" strokeWidth="2" opacity="0.95" />
            {/* Opera Națională Română (North End) */}
            <rect x="722" y="423" width="26" height="8" rx="2" fill="oklch(0.62 0.19 35)" />
            {/* Catedrala Mitropolitană (South End, facing Bega) */}
            <polygon points="718,492 740,492 729,514" fill="oklch(0.82 0.15 80)" />
            <circle cx="729" cy="503" r="3" fill="#fdfbf9" />
            {/* Fântâna cu Pești (Mid-Corso) */}
            <circle cx="732" cy="460" r="2" fill="#3888a8" />
          </g>

          {/* Cetate Pedestrian Streets Connecting the Plazas */}
          <g stroke="#3a3028" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
            {/* Strada Vasile Alecsandri (Libertății to Unirii) */}
            <line x1="746" y1="370" x2="746" y2="388" />
            {/* Strada Alba Iulia (Victoriei to Libertății) */}
            <line x1="735" y1="420" x2="735" y2="428" />
            {/* Strada Florimund Mercy (Unirii to Bastion) */}
            <line x1="777" y1="360" x2="810" y2="380" />
            {/* Strada Eugeniu de Savoya */}
            <line x1="710" y1="350" x2="795" y2="350" />
          </g>

          {/* Iulius Town / UBC Office Towers Complex (North) */}
          <g>
            <rect x="690" y="135" width="100" height="50" rx="8" fill="#211e1c" stroke="#5a6578" strokeWidth="1.8" opacity="0.8" />
            {/* UBC Tower 1 & 2 marks */}
            <rect x="705" y="145" width="18" height="14" rx="2" fill="#5a6578" opacity="0.9" />
            <rect x="735" y="145" width="22" height="14" rx="2" fill="#5a6578" opacity="0.9" />
            <rect x="765" y="145" width="16" height="14" rx="2" fill="#5a6578" opacity="0.9" />
          </g>

          {/* 9. DISTRICT & LANDMARK TYPOGRAPHY (Crisp, High-Tech Romanian Monospace) */}
          <g fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" letterSpacing="2" fill="#8c827a" opacity="0.75">
            <text x="735" y="318" textAnchor="middle">CETATE</text>
            <text x="788" y="354">PIAȚA UNIRII</text>
            <text x="750" y="468">PIAȚA VICTORIEI</text>
            <text x="872" y="420">BASTION</text>
            <text x="740" y="128" textAnchor="middle">IULIUS TOWN</text>
            <text x="960" y="555" fill="#3888a8" opacity="0.85">CANALUL BEGA</text>
            <text x="890" y="675">COMPLEX STUDENȚESC</text>
            <text x="360" y="560">IOSEFIN</text>
            <text x="1150" y="390">FABRIC</text>
          </g>

          {/* 10. WORKER ROUTE (Complexul Studențesc -> Podul Michelangelo -> Bastion -> Piața Unirii) */}
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
            fill="none"
          />

          {/* 11. SHIFT PINS AT REAL LANDMARKS */}
          {PINS.map((pin) => (
            <g
              key={`${pin.x}-${pin.y}`}
              data-pin
              {...(pin.hero ? { 'data-pin-hero': true } : {})}
              transform={`translate(${pin.x}, ${pin.y})`}
            >
              <circle
                cx={0}
                cy={0}
                r={pin.r * 2.8}
                fill={pin.hero ? 'oklch(0.7 0.19 35 / 0.3)' : 'oklch(0.82 0.15 80 / 0.18)'}
              />
              <circle
                cx={0}
                cy={0}
                r={pin.r}
                fill={pin.hero ? 'oklch(0.7 0.19 35)' : 'oklch(0.82 0.15 80)'}
                stroke={pin.hero ? '#ffffff' : undefined}
                strokeWidth={pin.hero ? 2 : undefined}
              />
            </g>
          ))}

          {/* 12. WORKER DOT (Starts in Complexul Studențesc) */}
          <circle
            data-worker
            cx="850"
            cy="640"
            r="8"
            fill="oklch(0.72 0.14 150)"
            stroke="#ffffff"
            strokeWidth="2"
          />
      </svg>
      </div>

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
        className="absolute flex w-68 max-w-[calc(100vw-2rem)] flex-col gap-1.5 rounded-2xl border p-3.5 sm:p-4 shadow-2xl backdrop-blur-md top-[180px] right-4 sm:top-[125px] md:top-[135px] lg:top-[16%] sm:right-8 md:right-10 lg:right-[6%]"
        style={{
          background: 'oklch(0.205 0.012 50 / 0.95)',
          borderColor: 'oklch(1 0 0 / 0.14)',
        }}
        aria-hidden="true"
      >
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs sm:text-sm font-bold" style={{ color: 'oklch(0.96 0.01 75)' }}>
            {t.hero.shiftCardTitle}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-medium">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t.hero.urgent}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm sm:text-base font-extrabold" style={{ color: 'oklch(0.82 0.15 80)' }}>
            40 LEI/H
          </span>
          <span className="font-mono text-xs opacity-75" style={{ color: 'oklch(0.92 0.01 75)' }}>
            {t.hero.shiftHours}
          </span>
        </div>
        <span className="text-[11px] sm:text-xs" style={{ color: 'oklch(0.7 0.015 60)' }}>
          {t.hero.shiftLocation}
        </span>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="flex-1 inline-flex h-8 sm:h-9 items-center justify-center rounded-xl text-[11px] sm:text-xs font-semibold shadow"
            style={{ background: 'oklch(0.62 0.19 35)', color: 'oklch(0.99 0.004 75)' }}
          >
            {t.hero.applyClick}
          </span>
        </div>
      </div>

      {/* ── Match Confirmation Toast (Act 3) — Human Touch ── */}
      <div
        data-match-toast
        className="absolute flex items-center gap-3 rounded-2xl border p-3 shadow-2xl backdrop-blur-md top-[390px] right-4 sm:top-[285px] md:top-[305px] lg:top-[46%] sm:right-8 md:right-10 lg:right-[6%] max-w-[calc(100vw-2rem)]"
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
            {t.hero.matchWorker}
          </span>
          <span className="text-[11px] font-mono" style={{ color: 'oklch(0.48 0.13 150)' }}>
            {t.hero.matchShifts} · {t.hero.matchEta}
          </span>
        </div>
      </div>

      {/* ── ITM Register Card (Act 4) ──────────────────────── */}
      <div
        data-itm-card
        className="absolute left-1/2 top-[205px] sm:top-[22%] md:top-[24%] lg:top-[26%] flex w-52 sm:w-60 -translate-x-1/2 flex-col gap-2 rounded-xl p-4 sm:p-5 shadow-2xl"
        style={{ background: 'oklch(0.99 0.008 75)' }}
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] sm:text-[10px] tracking-widest font-bold" style={{ color: 'oklch(0.4 0.02 55)' }}>
          {t.hero.itmCardTitle}
        </span>
        <span className="h-1.5 rounded-full" style={{ background: 'oklch(0.9 0.01 75)' }} />
        <span className="h-1.5 w-3/4 rounded-full" style={{ background: 'oklch(0.9 0.01 75)' }} />
        <span className="h-1.5 w-5/6 rounded-full" style={{ background: 'oklch(0.9 0.01 75)' }} />
        <span
          data-itm-stamp
          className="self-end rounded border-2 px-2 py-0.5 font-mono text-[10px] sm:text-xs font-bold"
          style={{ color: 'oklch(0.48 0.13 150)', borderColor: 'oklch(0.48 0.13 150)' }}
        >
          {t.hero.itmCompliance}
        </span>
      </div>

      {/* ── Headline + Value Prop + CTAs (Bottom Left) ─────── */}
      <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 lg:bottom-16 left-4 sm:left-8 md:left-10 lg:left-12 z-20 flex max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl flex-col gap-2.5 sm:gap-4 lg:gap-5 pr-4 sm:pr-0">
        {/* Status Chip */}
        <div
          className="hidden sm:inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-md"
          style={{ borderColor: 'oklch(0.82 0.15 80 / 0.4)', background: 'oklch(0.18 0.01 50 / 0.7)' }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: 'oklch(0.82 0.15 80)' }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'oklch(0.82 0.15 80)' }} />
          </span>
          <span className="font-mono text-[9px] sm:text-[10px] lg:text-[11px] font-bold tracking-widest" style={{ color: 'oklch(0.82 0.15 80)' }}>
            {t.hero.liveBadge}
          </span>
        </div>

        {/* Hero Title */}
        <h1
          className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.12] sm:leading-[1.1] md:leading-[1.08] tracking-tight"
          style={{ color: 'oklch(0.96 0.01 75)' }}
        >
          {t.hero.titleLine1}
          <br />
          <span style={{ color: 'oklch(0.82 0.15 80)' }}>{t.hero.titleLine2}</span>
        </h1>

        {/* Hero Body */}
        <p className="max-w-md text-xs sm:text-sm lg:text-base leading-relaxed md:leading-normal lg:text-lg opacity-90" style={{ color: 'oklch(0.78 0.015 60)' }}>
          {t.hero.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-row gap-2.5 sm:gap-3 pt-0.5 sm:pt-1">
          <Link
            href="/register"
            className="group inline-flex h-10 sm:h-11 lg:h-12 items-center justify-center gap-2 rounded-xl px-4 sm:px-6 lg:px-7 text-xs sm:text-sm font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:brightness-110 active:scale-[0.99]"
            style={{ background: 'oklch(0.55 0.19 35)', color: 'oklch(0.99 0.004 75)' }}
          >
            {t.hero.createAccount}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <a
            href="#why-gigtim"
            className="inline-flex h-10 sm:h-11 lg:h-12 items-center justify-center rounded-xl border px-3.5 sm:px-6 lg:px-7 text-xs sm:text-sm font-medium transition-colors duration-200 hover:bg-white/5"
            style={{ borderColor: 'oklch(1 0 0 / 0.2)', color: 'oklch(0.88 0.01 60)' }}
          >
            {t.hero.whyGigtim}
          </a>
        </div>
      </div>

      {/* ── Act Switcher Buttons & Captions (Top Right on Mobile, Bottom Right on Desktop) ──── */}
      <div className="absolute top-[72px] right-4 sm:top-auto sm:bottom-8 md:bottom-10 lg:bottom-16 sm:right-8 md:right-10 lg:right-12 z-20 flex flex-col items-end gap-1">
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
            className="inline-block font-mono text-[9px] sm:text-[11px] tracking-wider font-semibold drop-shadow-xs px-2 py-0.5 rounded-md border backdrop-blur-md"
            style={{
              color: 'oklch(0.72 0.015 60)',
              background: 'oklch(0.18 0.012 50 / 0.65)',
              borderColor: 'oklch(1 0 0 / 0.08)',
            }}
          >
            {`${currentAct + 1}/4 — ${actCaptions[currentAct].toUpperCase()}`}
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
