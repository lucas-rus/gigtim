# CoFound Design System

This file defines the design system specifications used to style the CoFound application. It outlines visual tokens, component guidelines, and layouts to ensure the app feels modern, cohesive, premium, and highly interactive.

## 🎨 Color Palette (Obsidian Depth & Neon Accents)

We use an OKLCH-based theme that looks extremely premium, utilizing deep midnight/space backgrounds, glowing holographic neon accents, and elegant borders.

| Token | Light Value | Dark Value | Purpose |
|---|---|---|---|
| `--background` | `oklch(0.98 0.005 240)` | `oklch(0.12 0.01 240)` | Deep page canvas background |
| `--card` | `oklch(1.0 0.0 0)` | `oklch(0.16 0.015 240)` | Elevated cards and containers |
| `--card-foreground`| `oklch(0.20 0.01 240)` | `oklch(0.95 0.01 240)` | Text inside card components |
| `--primary` | `oklch(0.75 0.16 160)` | `oklch(0.75 0.16 160)` | Glowing Mint/Emerald for Growth & Founders |
| `--primary-foreground`| `oklch(0.12 0.01 240)`| `oklch(0.12 0.01 240)`| Text on top of primary color |
| `--secondary` | `oklch(0.70 0.15 200)` | `oklch(0.70 0.15 200)` | Glowing Turquoise for Tech/Collaboration |
| `--secondary-foreground`| `oklch(0.12 0.01 240)`| `oklch(0.12 0.01 240)`| Text on top of secondary color |
| `--muted` | `oklch(0.94 0.01 240)` | `oklch(0.20 0.015 240)` | Lower contrast container |
| `--muted-foreground`| `oklch(0.55 0.02 240)` | `oklch(0.65 0.02 240)` | Auxiliary labels, secondary text |
| `--accent` | `oklch(0.78 0.15 70)` | `oklch(0.78 0.15 70)` | Soft Amber/Orange representing Equity/Shares |
| `--accent-foreground`| `oklch(0.12 0.01 240)`| `oklch(0.12 0.01 240)`| Text on top of accent color |
| `--border` | `oklch(0.90 0.01 240)` | `oklch(1 0 0 / 8%)` | Thin structural layout borders |
| `--ring` | `oklch(0.75 0.16 160 / 30%)` | `oklch(0.75 0.16 160 / 40%)` | Focus ring animations |

## ✍️ Typography

- **Headings Font:** `Space Grotesk` or `Outfit` (system fallback Sans-Serif) for modern, clean geometric headers.
- **Body Font:** `Geist Sans` or `Inter` (system fallback Sans-Serif) for high legibility in profiles and forms.
- **Font Weights:**
  - Light: `300` (subheadings)
  - Regular: `400` (body copy)
  - Medium: `500` (buttons, tabs, navigation)
  - Semibold: `600` (card titles, key stats)
  - Bold: `700` (main headings, page titles)

## 📐 Spacing & Radius

- **Corners:** Standardized on `var(--radius-lg)` (`0.75rem`) for cards and buttons, and `var(--radius-xl)` (`1rem`) for larger dialogs/containers.
- **Borders:** Subtle `border border-border/40` to maintain clean visual boundaries without taking up space.
- **Glassmorphism:** Navigation menus and headers use a translucent backdrop: `bg-background/80 backdrop-blur-xl`.

## ✨ Micro-Animations & Effects

1. **Card Hover:** Standardized hover transitions: `transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/4 hover:-translate-y-0.5`.
2. **Button Glow:** Hover states should feel alive: `hover:brightness-110 active:scale-95 transition-all`.
3. **Accent Glow:** Key CTAs can feature subtle radial gradients in the background to draw user attention.

## Brand & Style

The design system is built on the pillars of **equity, collaboration, and speed**. Designed specifically for startup founders, it facilitates finding partners without relying on traditional recruitment models. The aesthetic follows a **Premium Obsidian Minimalist** direction—utilizing dark glassmorphism and bright neon indicators to evoke the feeling of entering a builder's lab.

## Components

### Buttons
- **Primary:** Neon Mint (#2ecc71 / oklch) background with Dark Neutral text. Bold and high-contrast.
- **Secondary:** Glowing Turquoise background with Dark Neutral text.
- **Ghost:** Transparent background with border and primary/secondary text.

### Cards
- **Founder Profile Card:** White/Glassmorphic background, 16px corner radius, Elevation 1. Shows a professional avatar, founder's role tag (e.g., "Tech Co-founder"), target equity range (e.g., "20% - 40%"), and skills tags.
- **Idea Card:** Displays startup concept, validation score (e.g. "92% Validated"), comments count, and an upvote/validate interaction area.

### Agreements
- **Equity Vesting Slider:** A dynamic component showing a visual representation of shares vesting over time.
