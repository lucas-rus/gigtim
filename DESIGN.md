# GigTim Stitch Design System

This file defines the design system specifications used to style the GigTim application. It defines visual tokens, component guidelines, and layouts to ensure the app feels modern, cohesive, and premium.

## 🎨 Color Palette (Sleek Obsidian & Neon Indigo)

We use an OKLCH-based theme that looks extremely premium, using deep midnight backgrounds, glowing accents, and elegant borders.

| Token | Light Value | Dark Value | Purpose |
|---|---|---|---|
| `--background` | `oklch(0.99 0.005 240)` | `oklch(0.12 0.015 250)` | Deep page canvas background |
| `--card` | `oklch(1.0 0.0 0)` | `oklch(0.16 0.015 250)` | Elevated cards and containers |
| `--card-foreground`| `oklch(0.20 0.01 250)` | `oklch(0.95 0.01 250)` | Text inside card components |
| `--primary` | `oklch(0.55 0.22 260)` | `oklch(0.60 0.20 260)` | Active buttons, key accents (Indigo) |
| `--primary-foreground`| `oklch(0.99 0.005 240)`| `oklch(0.99 0.005 240)`| Text on top of primary color |
| `--secondary` | `oklch(0.95 0.01 250)` | `oklch(0.22 0.02 250)` | Supporting badges, inputs background |
| `--muted` | `oklch(0.93 0.01 250)` | `oklch(0.22 0.02 250)` | Lower contrast container |
| `--muted-foreground`| `oklch(0.55 0.02 250)` | `oklch(0.65 0.02 250)` | Auxiliary labels, secondary text |
| `--accent` | `oklch(0.95 0.02 250)` | `oklch(0.22 0.03 260)` | Row highlights on hover |
| `--border` | `oklch(0.90 0.01 250)` | `oklch(1 0 0 / 8%)` | Thin structural layout borders |
| `--ring` | `oklch(0.55 0.22 260 / 30%)` | `oklch(0.60 0.20 260 / 40%)` | Focus ring animations |

## ✍️ Typography

- **Headings Font:** `Outfit` (or system fallback Sans-Serif) for modern, clean headers.
- **Body Font:** `Geist Sans` or `Inter` (system fallback Sans-Serif) for high legibility.
- **Font Weights:**
  - Light: `300` (subheadings)
  - Regular: `400` (body copy)
  - Medium: `500` (buttons, tabs, navigation)
  - Semibold: `600` (card titles)
  - Bold: `700` (main headings, stats)

## 📐 Spacing & Radius

- **Corners:** Standardized on `var(--radius-lg)` (`0.75rem`) for standard cards and buttons, and `var(--radius-xl)` (`1rem`) for larger dialogs/containers.
- **Borders:** Subtle `border border-border/40` to maintain clean visual boundaries without taking up space.
- **Glassmorphism:** Navigation menus and headers use a translucent backdrop: `bg-background/80 backdrop-blur-xl`.

## ✨ Micro-Animations & Effects

1. **Card Hover:** Standardized hover transitions: `transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/4 hover:-translate-y-0.5`.
2. **Button Glow:** Hover states should feel alive: `hover:brightness-110 active:scale-95 transition-all`.
3. **Accent Glow:** Key CTAs can feature subtle radial gradients in the background to draw user attention.
