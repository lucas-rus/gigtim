---
name: Labor Efficient Modernist
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#747683'
  outline-variant: '#c4c6d3'
  surface-tint: '#3d5aad'
  primary: '#001851'
  on-primary: '#ffffff'
  primary-container: '#002b7f'
  on-primary-container: '#7c97ef'
  inverse-primary: '#b5c4ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#001c45'
  on-tertiary: '#ffffff'
  tertiary-container: '#00306e'
  on-tertiary-container: '#6299ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174c'
  on-primary-fixed-variant: '#224194'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-xl:
    fontFamily: Hanken Grotesk
    fontSize: 60px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

This design system is built on the principles of modernist efficiency, prioritizing high information density and absolute clarity. It targets professional environments where cognitive load must be minimized through structural discipline. The aesthetic is clean, high-contrast, and authoritative, evoking the precision of mid-century Swiss design updated for a digital-first era.

The visual language utilizes a "light-work" philosophy: pure white surfaces, crisp structural lines, and deep indigo accents. It avoids the "washed out" look of low-contrast UI by using purposeful, cool-toned grays and heavy, accessible typography. The emotional response is one of reliability, focus, and industrial-grade stability.

## Colors

The palette is anchored by **Romanian Blue (#002b7f)**, used as the primary driver for action and identity. To maintain a high-contrast environment, the main canvas is pure `#ffffff`, while `#f8fafc` is used for non-editable surfaces like sidebars, headers, or background wells to provide subtle depth without muddying the interface.

Neutral tones are derived from a Slate-blue scale to ensure the "professional" look remains crisp rather than warm or muddy. Text levels follow strict accessibility standards:
- **Primary Text:** Deep Slate (#0f172a) for maximum readability.
- **Secondary Text:** Slate Gray (#475569) for metadata and labels.
- **Border Colors:** Cool Gray (#e2e8f0) for structural definition.

## Typography

Typography is used as a functional hierarchy tool. **Hanken Grotesk** provides a sharp, contemporary look for headlines, offering a sense of forward-moving momentum. **Inter** is the workhorse for body text, chosen for its exceptional legibility and neutral character in high-density data views.

For technical metadata, status indicators, and small utility labels, **JetBrains Mono** is utilized to provide a distinct visual break from prose, emphasizing the "technical" nature of the product. All body text maintains a minimum contrast ratio of 7:1 against white backgrounds.

## Layout & Spacing

The layout follows a strict **12-column fluid grid** for desktop and a **4-column grid** for mobile. We utilize an 8px base unit system to ensure mathematical harmony across all components.

- **Desktop (1280px+):** 32px outer margins with 24px gutters.
- **Tablet (768px - 1279px):** 24px outer margins with 20px gutters.
- **Mobile (Up to 767px):** 16px outer margins with 16px gutters.

The spacing rhythm prioritizes vertical clarity. Components are grouped using the "Law of Proximity," with larger gaps between distinct functional sections to avoid visual clutter in a light-mode environment.

## Elevation & Depth

This design system rejects heavy, dark shadows in favor of **Tonal Layering** and **Soft Ambient Occlusion**. Depth is communicated through:

1.  **Level 0 (Base):** #f8fafc background.
2.  **Level 1 (Card/Surface):** #ffffff surface with a 1px solid #e2e8f0 border. No shadow.
3.  **Level 2 (Active/Floating):** #ffffff surface with a 1px solid #e2e8f0 border and a soft, highly-diffused shadow: `0 4px 12px rgba(15, 23, 42, 0.08)`.
4.  **Level 3 (Modals/Overlays):** #ffffff surface with a crisp border and a more pronounced but still soft shadow: `0 12px 32px rgba(15, 23, 42, 0.12)`.

This approach ensures that even with a white background, the UI feels structured and tactile without the "floaty" or unanchored feel of many neomorphic or minimalist systems.

## Shapes

To maintain the "Modernist" look, we use a **Soft (Value 1)** roundedness profile. This provides 4px (0.25rem) corners for standard UI components (buttons, inputs, cards).

Large containers and featured sections may use **8px (0.5rem)**, but the system generally avoids large radii or pill shapes, as sharp/slightly-softened corners better reflect the industrial and efficient nature of the brand.

## Components

### Buttons
- **Primary:** Solid #002b7f background with #ffffff text. 4px border-radius. High-contrast hover state (#001d57).
- **Secondary:** Transparent background with 1px #002b7f border and #002b7f text.
- **Ghost:** No border/background. Uses Primary Text color.

### Input Fields
Inputs must use a white background with a 1px #e2e8f0 border. On focus, the border shifts to #002b7f with a subtle 2px outer glow in #002b7f at 10% opacity. Labels use JetBrains Mono in all-caps for a technical feel.

### Cards
Cards are the primary container. They use a white background, 4px border radius, and a 1px solid #e2e8f0 border. They do not have shadows unless they are interactive or hovered.

### Lists & Data Tables
Tables are high-density. Use #f8fafc for headers with JetBrains Mono text. Row dividers should be #f1f5f9. Avoid alternating row colors; instead, use a 100% white background with a subtle hover state (#f8fafc) to indicate row selection.

### Chips & Badges
Chips use a light blue tint (#eff6ff) with deep blue text (#1e40af). They use a square-round shape (4px radius) rather than pill-shaped to stay consistent with the modernist geometric language.