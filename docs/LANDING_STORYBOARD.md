# Landing page — "Orașul lucrează" (Living Map)

Direction chosen from the identity moodboards (Sep 2026): the map is the brand.
The hero is a pinned scroll story in four acts, told entirely in Zori tokens
(ember, saffron, sage, espresso night) with the sun-clock logo. The name of the
design system — *Zori*, daybreak — is the story's climax.

## The four acts

| Act | Scroll | What happens | Meaning |
|-----|--------|--------------|---------|
| 1 | on load | Night map of the city; shift pins ignite one by one, like windows | The city is alive with open shifts |
| 2 | 0 → ~35% | Camera zooms to a café pin; the product's real bottom-sheet shift card rises | Pick a shift, see the details |
| 3 | ~35 → 65% | A sage worker dot travels the saffron route to the pin; both pulse on arrival | The match |
| 4 | ~65 → 100% | The ember→saffron dawn gradient sweeps the map; the ITM register card appears, stamped "CONFORM · LEGEA 52/2011" | Zori: the paperwork takes care of itself |

Act captions (bottom-right, JetBrains Mono) narrate: 1/4 … 4/4.

## Implementation

- `web/src/components/landing/LivingMapHero.tsx` — GSAP ScrollTrigger (pin +
  scrub over ~2600px) + MotionPathPlugin for the worker dot. Act 1 is a
  non-scrubbed on-load tween so the map is never empty at rest.
- `web/src/components/landing/Reveal.tsx` — one-shot fade-up reveal for the
  sections below the hero.
- `web/src/app/page.tsx` — hero always dark (espresso night, deliberate);
  sections below use theme tokens. All leftover indigo/blue values from the
  abandoned theme were removed; step tiles are ember / saffron / sage.
- Reduced motion: `gsap.matchMedia` — no pin, no scrub; the hero renders the
  composed final scene. Global `prefers-reduced-motion` CSS still applies.
- Solid CTAs use `primary-strong` (the AA-safe ember fill per the Zori spec).

## Deliberate choices

- Nav is absolute over the hero (light-on-dark), not sticky — the moodboard
  look. Revisit if bounce data argues for a persistent CTA.
- The shift card / ITM card are illustrative content scaled responsively on both
  mobile and desktop viewports.
- The fake hero social-proof numbers were dropped in favor of transparent,
  authentic performance metrics.
