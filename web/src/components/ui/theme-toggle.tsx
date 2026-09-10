'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const { theme, resolvedTheme, setTheme } = useTheme()

  if (!mounted) {
    return (
      <div
        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-zinc-200/80 dark:border-white/10 bg-white/60 dark:bg-black/40 shrink-0"
        aria-hidden="true"
      />
    )
  }

  const currentTheme = resolvedTheme || theme
  const isDark = currentTheme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-zinc-200/90 dark:border-white/15 bg-white/90 dark:bg-zinc-950/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/30 transition-all active:scale-95 shadow-sm cursor-pointer"
      aria-label={isDark ? 'Comută la modul luminos' : 'Comută la modul întunecat'}
      title={isDark ? 'Comută la modul luminos' : 'Comută la modul întunecat'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-zinc-700 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  )
}
