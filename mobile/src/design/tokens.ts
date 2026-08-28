/**
 * Zori design tokens — mobile (React Native).
 *
 * React Native StyleSheet accepts only #RRGGBB / #RRGGBBAA hex (no oklch/rgb/hsl).
 * Every value below is the verified sRGB conversion of the ratified Zori OKLCH
 * spec (see docs/ZORI_DESIGN_SYSTEM.md). Alpha-bearing tokens (border/input)
 * are pre-composited over the theme background for cross-platform reliability.
 *
 * Light = Linen, Dark = Espresso (warm).
 */

export interface ZoriTokens {
  scheme: "light" | "dark";
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  primaryStrong: string;
  secondary: string;
  secondaryForeground: string;
  secondaryStrong: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export const lightTokens: Omit<ZoriTokens, "scheme"> = {
  background: "#FFFBF6",
  foreground: "#221812",
  card: "#FFFFFF",
  cardForeground: "#221812",
  popover: "#FFFFFF",
  popoverForeground: "#221812",
  primary: "#E14D28",
  primaryForeground: "#FDFBF9",
  primaryStrong: "#C83406",
  secondary: "#33854A",
  secondaryForeground: "#FAFDFA",
  secondaryStrong: "#067132",
  accent: "#F7B83D",
  accentForeground: "#45240F",
  muted: "#F7F1E9",
  mutedForeground: "#6B6159",
  destructive: "#DB2D27",
  destructiveForeground: "#FDFBF9",
  border: "#DBD7D0",
  input: "#DBD7D0",
  ring: "#E14D28",
  chart1: "#E14D28",
  chart2: "#F7B83D",
  chart3: "#33854A",
  chart4: "#9A2300",
  chart5: "#B27654",
};

export const darkTokens: Omit<ZoriTokens, "scheme"> = {
  background: "#120C09",
  foreground: "#F6F1EB",
  card: "#1C1612",
  cardForeground: "#F6F1EB",
  popover: "#1C1612",
  popoverForeground: "#F6F1EB",
  primary: "#FD6844",
  primaryForeground: "#131110",
  primaryStrong: "#FD6844",
  secondary: "#5BBD74",
  secondaryForeground: "#0C0E0C",
  secondaryStrong: "#5BBD74",
  accent: "#F7B83D",
  accentForeground: "#45240F",
  muted: "#28211E",
  mutedForeground: "#A69C95",
  destructive: "#EE362F",
  destructiveForeground: "#FDFBF9",
  border: "#2A211D",
  input: "#312823",
  ring: "#FD6844",
  chart1: "#FD6844",
  chart2: "#F7B83D",
  chart3: "#5BBD74",
  chart4: "#CD5537",
  chart5: "#D7926B",
};

export const radius = {
  none: 0,
  sm: 5,
  md: 10,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 28,
  "4xl": 40,
  full: 9999,
} as const;

export const font = {
  sans: "Inter",
  heading: "Sora",
  mono: "JetBrainsMono",
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 18,
  xl: 22,
  "2xl": 28,
  "3xl": 34,
  display: 44,
} as const;

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;

export const tapTarget = { min: 44 } as const;

export const dawnGradient = {
  light: {
    colors: ["#E14D28", "#F7B83D", "#33854A"] as [string, string, string],
    locations: [0, 0.5, 1] as [number, number, number],
  },
  dark: {
    colors: ["#FD6844", "#F7B83D", "#5BBD74"] as [string, string, string],
    locations: [0, 0.5, 1] as [number, number, number],
  },
};
