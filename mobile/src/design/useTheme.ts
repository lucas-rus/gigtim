import { useColorScheme } from "@/components/useColorScheme";
import { lightTokens, darkTokens, type ZoriTokens } from "./tokens";

/**
 * Returns the active Zori token set + the resolved color scheme.
 * Re-renders on system theme change (RN useColorScheme).
 */
export function useZoriTheme(): ZoriTokens {
  const scheme = useColorScheme();
  const tokens = scheme === "dark" ? darkTokens : lightTokens;
  return { ...tokens, scheme: scheme ?? 'light' };
}

export { lightTokens, darkTokens, type ZoriTokens } from "./tokens";
export { radius, font, fontSize, fontWeight, spacing, tapTarget, dawnGradient } from "./tokens";
