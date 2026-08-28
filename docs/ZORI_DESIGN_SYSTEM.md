# Zori Design System — v1.0 (Ratified)

*Zori* (Romanian: "daybreak") is the canonical design system for GigTim,
unifying **web** (`web/`) and **mobile** (`mobile/`). It is warm, accessible,
and distinctively Romanian — no cold corporate blue.

## Concept

- **Warm linen (light) + espresso charcoal (warm dark, NOT cold blue-black).**
- **Ember primary** (warm coral-red), **Sage secondary** (success/earn),
  **Saffron accent** (highlights/badges).
- **Signature dawn gradient** (ember → saffron → sage) used sparingly on
  heroes and primary CTAs — evoking sunrise = the start of the work day.
- **Glassmorphism** only on nav/topbar (`bg-background/80 backdrop-blur-xl`).

## Typography

- **Headings:** Sora (Romanian-designed open-source geometric grotesk).
- **Body:** Inter.
- **Mono:** JetBrains Mono (pay amounts, IDs, admin labels).
- Web: loaded via `next/font/google` in `web/src/app/layout.tsx`.
- Mobile: loaded via `@expo-google-fonts/*` in `mobile/src/design/fonts.ts`.

## Tokens

### Web (`web/src/app/globals.css`, OKLCH)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `oklch(0.99 0.008 75)` | `oklch(0.16 0.012 50)` | linen / espresso canvas |
| `--foreground` | `oklch(0.22 0.02 50)` | `oklch(0.96 0.01 75)` | body text (AAA) |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0.012 50)` | card surface |
| `--primary` | `oklch(0.62 0.19 35)` | `oklch(0.70 0.19 35)` | ember — icons, rings, large links, charts, gradient |
| `--primary-strong` | `oklch(0.55 0.19 35)` | `oklch(0.70 0.19 35)` | ember **fill** for solid buttons (AA-normal) |
| `--secondary` | `oklch(0.55 0.12 150)` | `oklch(0.72 0.14 150)` | sage |
| `--secondary-strong` | `oklch(0.48 0.13 150)` | `oklch(0.72 0.14 150)` | sage **fill** (AA-normal) |
| `--accent` | `oklch(0.82 0.15 80)` | `oklch(0.82 0.15 80)` | saffron (same both modes) |
| `--muted-foreground` | `oklch(0.50 0.018 60)` | `oklch(0.70 0.015 60)` | secondary text (AA) |
| `--destructive` | `oklch(0.58 0.21 28)` | `oklch(0.62 0.22 28)` | errors |
| `--border` | `oklch(0.88 0.01 75 / 60%)` | `oklch(1 0 0 / 8%)` | hairline |
| `--ring` | `oklch(0.62 0.19 35 / 45%)` | `oklch(0.70 0.19 35 / 50%)` | focus ring |

Full token set (popover, sidebar, chart-1..5, radius scale, dawn gradient)
lives in `web/src/app/globals.css`.

### Mobile (`mobile/src/design/tokens.ts`, sRGB hex)

RN accepts only `#RRGGBB`/`#RRGGBBAA`. Each hex is the verified sRGB conversion
of the OKLCH above. `border`/`input` are pre-composited (alpha blended over
the theme background) for cross-platform reliability.

| Key | Light | Dark |
|---|---|---|
| `background` | `#FFFBF6` | `#120C09` |
| `foreground` | `#221812` | `#F6F1EB` |
| `primary` | `#E14D28` | `#FD6844` |
| `primaryStrong` | `#C83406` | `#FD6844` |
| `secondary` | `#33854A` | `#5BBD74` |
| `secondaryStrong` | `#067132` | `#5BBD74` |
| `accent` | `#F7B83D` | `#F7B83D` |
| `mutedForeground` | `#6B6159` | `#A69C95` |
| `border` | `#DBD7D0` | `#2A211D` |

Radius (dp): `md=10` (base), `lg=12` (card), `xl=16` (dialog), `4xl=40` (pill).

## `*-strong` tokens (critical rule)

`--primary-strong` / `--secondary-strong` are the **AA-compliant fill variants**
used **only** for solid buttons/CTAs. The base `--primary` is for icons, focus
rings, large links (≥18.66px bold), charts, and the dawn gradient.

**Never use `text-primary` for small body text in light mode** — ember fails
AA-normal at body size on linen (`3.85:1`, AA-large only). In dark mode ember
passes AA-normal (`6.17:1`).

## Accessibility

- **AA contrast** verified for all text pairs (see spec §6.1).
- **Focus rings:** web `focus-visible:ring-3 ring-ring/50` + 2px offset on
  non-button focusables; mobile `borderWidth:2 borderColor:primary` on focus.
- **ARIA** on all interactive elements; base-ui wires Dialog/Sheet/Tabs
  semantics automatically — every Dialog MUST have Title + Description.
- **Reduced motion:** web `@media (prefers-reduced-motion: reduce)` neutralizes
  transitions; mobile Reanimated `ReduceMotion` honored.
- **Semantic headings:** one `<h1>`/`header` per screen, then `h2`/`SectionHeader`.
- **Keyboard nav:** Tab cycles, Esc closes popups, focus restored to trigger.
- **Mobile tap targets:** ≥ 44dp on all tappable primitives.

## Motion

- CTA hover: `hover:brightness-108 active:scale-95` (web); `scale: 0.96` on
  press (mobile).
- Card lift: `translateY: -2` on press.
- Toast: slide-in from top (220ms), auto-dismiss 3.8s.

## Migration notes (broken CSS classes fixed)

- `text-primary-fixed-dim` → `text-primary-strong` (large/bold) or
  `text-foreground font-semibold` (body).
- `text-2xs` → defined as `--text-2xs: 0.625rem` in `@theme inline` (now real).
- `text-on-background` → `text-foreground`.
- `scrollbar-thin` → real `.scrollbar-thin` utility in `@layer base`.
- `text-amber-400`/`fill-amber-400` (rating) → `text-accent`/`fill-accent`.
- Material Symbols font → replaced everywhere by `lucide-react`/`lucide-react-native`.

## Components

### Web (`web/src/components/ui/`)
shadcn/base-nova on `@base-ui/react` (render-prop, not asChild). Zori edits:
- `button.tsx`: default → `bg-primary-strong`, ember glow on hover/active.
- `card.tsx`: `rounded-xl` → `rounded-lg` (12px).
- `rating.tsx`: amber → saffron (`fill-accent text-accent`).
- `sonner.tsx`: toast radius → `var(--radius-lg)`.

### Mobile (`mobile/src/ui/`)
Primitives built on `useZoriTheme()` + tokens. Min 44dp tap targets.
`Button`, `Card`, `Badge`, `Input`, `Textarea`, `Skeleton`, `Toast`
(provider + imperative `toast` API), `Avatar`, `RatingStars`, `EmptyState`,
`SectionHeader`, `ShiftCard`.
