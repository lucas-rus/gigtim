'use client'

import { useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, ScrollTrigger, MotionPathPlugin)

/**
 * "Orașul lucrează" — pinned scroll story in four acts:
 * 1. Night map, shift pins ignite  
 * 2. Zoom to café pin, real shift card rises  
 * 3. Worker dot travels the route → match pulse  
 * 4. Dawn sweeps the city, ITM register stamped "CONFORM · LEGEA 52/2011".
 * With prefers-reduced-motion the hero renders the final composed scene, unpinned.
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

const CAPTIONS = [
  'Turele se aprind pe hartă',
  'Alege o tură, vezi detaliile',
  'Match: lucrătorul e pe drum',
  'Zorii: registrul ITM, gata automat',
]

export function LivingMapHero() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef)
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(q('[data-pin]'), { opacity: 0, scale: 0, transformOrigin: '50% 50%' })
        gsap.set(q('[data-shift-card]'), { autoAlpha: 0, y: 28 })
        gsap.set(q('[data-worker]'), { opacity: 0 })
        gsap.set(q('[data-route]'), { strokeDashoffset: 1 })
        gsap.set(q('[data-dawn]'), { opacity: 0 })
        gsap.set(q('[data-itm-card]'), { autoAlpha: 0, scale: 0.85, y: 16 })
        gsap.set(q('[data-itm-stamp]'), { autoAlpha: 0, scale: 1.6, rotate: 8 })
        gsap.set(q('[data-caption]'), { autoAlpha: 0 })
        gsap.set(q('[data-caption="0"]'), { autoAlpha: 1 })
        gsap.set(q('[data-indicator]'), { opacity: 0.35, scale: 0.85 })
        gsap.set(q('[data-indicator="0"]'), { opacity: 1, scale: 1.25 })

        // Act 1 — pins ignite over the night map on load
        gsap.to(q('[data-pin]'), {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          delay: 0.35,
          ease: 'back.out(2.5)',
        })

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=2600',
            pin: true,
            scrub: 1,
          },
        })

        const updateAct = (from: number, to: number, at: number) => {
          tl.to(q(`[data-caption="${from}"]`), { autoAlpha: 0, duration: 0.15 }, at)
            .to(q(`[data-caption="${to}"]`), { autoAlpha: 1, duration: 0.15 }, at + 0.1)
            .to(q(`[data-indicator="${from}"]`), { opacity: 0.35, scale: 0.85, duration: 0.15 }, at)
            .to(q(`[data-indicator="${to}"]`), { opacity: 1, scale: 1.25, duration: 0.15 }, at + 0.1)
        }

        // Act 2 — camera zooms to the hero pin, the shift card rises
        updateAct(0, 1, 0.15)
        tl.to(
          q('[data-map-zoom]'),
          { scale: 1.5, svgOrigin: '900 320', duration: 1, ease: 'power1.inOut' },
          0.2
        )
        tl.to(q('[data-shift-card]'), { autoAlpha: 1, y: 0, duration: 0.4 }, 0.7)

        // Act 3 — the worker travels the route; both pulse on arrival
        updateAct(1, 2, 1.7)
        tl.to(q('[data-route]'), { strokeDashoffset: 0, duration: 1 }, 1.8)
        tl.to(q('[data-worker]'), { opacity: 1, duration: 0.1 }, 1.8)
        tl.to(
          q('[data-worker]'),
          {
            motionPath: { path: '#gigtim-route', align: '#gigtim-route', alignOrigin: [0.5, 0.5] },
            duration: 1,
            ease: 'power1.inOut',
          },
          1.8
        )
        tl.to(
          [...q('[data-worker]'), ...q('[data-pin-hero]')],
          {
            scale: 1.7,
            transformOrigin: '50% 50%',
            duration: 0.18,
            repeat: 3,
            yoyo: true,
            ease: 'power1.inOut',
          },
          2.85
        )

        // Act 4 — dawn sweeps the map, the ITM register comes out stamped
        updateAct(2, 3, 3.4)
        tl.to(q('[data-dawn]'), { opacity: 1, duration: 1, ease: 'power1.in' }, 3.5)
        tl.to(q('[data-shift-card]'), { autoAlpha: 0, y: -16, duration: 0.3 }, 3.5)
        tl.to(q('[data-itm-card]'), { autoAlpha: 1, scale: 1, y: 0, duration: 0.5 }, 3.9)
        tl.to(
          q('[data-itm-stamp]'),
          { autoAlpha: 1, scale: 1, rotate: -8, duration: 0.25, ease: 'power3.in' },
          4.4
        )
        tl.to({}, { duration: 0.4 }) // settle room at the end of the pin
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(q('[data-pin]'), { opacity: 1 })
        gsap.set(q('[data-worker]'), { opacity: 0 })
        gsap.set(q('[data-route]'), { strokeDashoffset: 0 })
        gsap.set(q('[data-shift-card]'), { autoAlpha: 1 })
        gsap.set(q('[data-dawn]'), { opacity: 0.6 })
        gsap.set(q('[data-itm-card]'), { autoAlpha: 0 })
        gsap.set(q('[data-caption]'), { autoAlpha: 0 })
        gsap.set(q('[data-indicator]'), { opacity: 0.5 })
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] overflow-hidden"
      style={{ background: 'oklch(0.15 0.015 55)' }}
      aria-label="Orașul lucrează — turele pe harta orașului"
    >
      {/* Night Map Vector */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        <g data-map-zoom>
          {/* Street Grid */}
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

          {/* Worker Route (drawn during Act 3) */}
          <path
            id="gigtim-route"
            data-route
            d="M330 640 C 480 610, 620 470, 900 330"
            stroke="oklch(0.82 0.15 80)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1"
            pathLength="1"
            opacity="0.85"
          />

          {/* Shift Pins */}
          {PINS.map((pin) => (
            <g key={`${pin.x}-${pin.y}`} data-pin {...(pin.hero ? { 'data-pin-hero': true } : {})}>
              <circle
                cx={pin.x}
                cy={pin.y}
                r={pin.r * 2.6}
                fill={pin.hero ? 'oklch(0.7 0.19 35 / 0.28)' : 'oklch(0.82 0.15 80 / 0.18)'}
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
          />
        </g>
      </svg>

      {/* Dawn Sweep Gradient (Act 4) */}
      <div
        data-dawn
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, oklch(0.62 0.19 35 / 0.5), oklch(0.82 0.15 80 / 0.22) 55%, transparent 85%)',
        }}
        aria-hidden="true"
      />

      {/* Shift Detail Card (Act 2 - Responsive on Mobile & Desktop) */}
      <div
        data-shift-card
        className="absolute flex w-56 sm:w-64 flex-col gap-1.5 rounded-2xl border p-3.5 sm:p-4 shadow-2xl backdrop-blur-md"
        style={{
          right: '5%',
          top: '18%',
          background: 'oklch(0.205 0.012 50 / 0.95)',
          borderColor: 'oklch(1 0 0 / 0.12)',
        }}
        aria-hidden="true"
      >
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs sm:text-sm font-bold" style={{ color: 'oklch(0.96 0.01 75)' }}>
            Ospătar — Piața Unirii
          </span>
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <span className="font-mono text-[11px] sm:text-xs font-bold" style={{ color: 'oklch(0.82 0.15 80)' }}>
          35 RON/H · 18:00–23:00
        </span>
        <span className="text-[11px] sm:text-xs" style={{ color: 'oklch(0.7 0.015 60)' }}>
          Cafenea în centrul vechi · azi
        </span>
        <span
          className="mt-1 inline-flex h-8 sm:h-9 items-center justify-center rounded-xl text-[11px] sm:text-xs font-semibold shadow"
          style={{ background: 'oklch(0.62 0.19 35)', color: 'oklch(0.99 0.004 75)' }}
        >
          Aplică cu un click
        </span>
      </div>

      {/* ITM Register Card (Act 4 - Responsive on Mobile & Desktop) */}
      <div
        data-itm-card
        className="absolute left-1/2 top-[24%] sm:top-[28%] flex w-52 sm:w-60 -translate-x-1/2 flex-col gap-2 rounded-xl p-4 sm:p-5 shadow-2xl"
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

      {/* Headline + Value Prop + CTAs */}
      <div className="absolute bottom-12 left-5 z-10 flex max-w-xl flex-col gap-4 sm:gap-5 md:left-12 md:bottom-20">
        <div
          className="inline-flex items-center gap-2 self-start rounded-full border px-3.5 sm:px-4 py-1.5 backdrop-blur-md"
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

        <h1
          className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight"
          style={{ color: 'oklch(0.96 0.01 75)' }}
        >
          Orașul lucrează.
          <br />
          <span style={{ color: 'oklch(0.82 0.15 80)' }}>Tu doar alegi tura.</span>
        </h1>

        <p className="max-w-md text-sm sm:text-base leading-relaxed md:text-lg" style={{ color: 'oklch(0.78 0.015 60)' }}>
          Ture de o zi în HoReCa, pe harta orașului tău. Aplici cu un click, angajatorul te
          acceptă, iar registrul ITM se generează automat.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row pt-1">
          <Link
            href="/register"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:brightness-110 active:scale-[0.99]"
            style={{ background: 'oklch(0.55 0.19 35)', color: 'oklch(0.99 0.004 75)' }}
          >
            Creează cont gratuit
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <a
            href="#features"
            className="inline-flex h-12 items-center justify-center rounded-xl border px-7 text-sm font-medium transition-colors duration-200 hover:bg-white/5"
            style={{ borderColor: 'oklch(1 0 0 / 0.2)', color: 'oklch(0.88 0.01 60)' }}
          >
            Cum funcționează?
          </a>
        </div>
      </div>

      {/* Act Indicator & Captions */}
      <div className="pointer-events-none absolute bottom-12 right-6 sm:right-12 z-10 flex flex-col items-end gap-2" aria-hidden="true">
        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 pb-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              data-indicator={i}
              className="h-1.5 w-1.5 rounded-full transition-transform"
              style={{ background: 'oklch(0.82 0.15 80)' }}
            />
          ))}
        </div>

        {/* Caption Text */}
        <div className="relative h-5 w-64 sm:w-80">
          {CAPTIONS.map((text, i) => (
            <span
              key={text}
              data-caption={i}
              className="absolute right-0 whitespace-nowrap font-mono text-[10px] sm:text-[11px] tracking-widest font-semibold"
              style={{ color: 'oklch(0.72 0.015 60)' }}
            >
              {`${i + 1}/4 — ${text.toUpperCase()}`}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
