import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock next/font so server components that import fonts don't break in jsdom.
vi.mock("next/font/google", () => {
  const font = () => ({ variable: "--font-mock", className: "font-mock" });
  return { Inter: font, Sora: font, JetBrains_Mono: font, Hanken_Grotesk: font };
});

// Mock next/navigation helpers used by client components.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// Mock next-themes to avoid ThemeProvider context in isolation.
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn(), resolvedTheme: "light" }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Cleanup the DOM between tests so state never leaks.
afterEach(() => {
  cleanup();
});
