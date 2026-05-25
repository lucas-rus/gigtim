'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon, SearchIcon, User, LogOut } from 'lucide-react'
import { logout } from '@/lib/supabase/auth-actions'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TopHeaderProps {
  avatarUrl?: string | null
  fallbackText: string
  userName: string
}

export function TopHeader({ avatarUrl, fallbackText, userName }: TopHeaderProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card dark:bg-card px-6">
      {/* Search bar – left side */}
      <div className="flex items-center gap-4 w-full max-w-md">
        <div className="relative w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Caută joburi, abilități..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-muted border border-border rounded text-sm font-sans text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>
      </div>

      {/* Right side – theme toggle + avatar */}
      <div className="flex items-center gap-3">
        {mounted ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent dark:hover:bg-muted transition-colors bg-white dark:bg-card cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-4 w-4 text-amber-500" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="h-8 w-8 rounded border border-border bg-white dark:bg-card shrink-0" />
        )}

        <div className="h-6 w-px bg-border mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" className="relative h-10 w-10 rounded p-0">
              <Avatar className="h-9 w-9 border border-border hover:border-primary cursor-pointer rounded">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} className="object-cover rounded" />}
                <AvatarFallback className="bg-accent text-primary font-bold font-heading rounded">
                  {fallbackText}
                </AvatarFallback>
              </Avatar>
            </Button>
          } />
          <DropdownMenuContent className="w-56 border border-border bg-card dark:bg-card rounded shadow-[0_4px_12px_rgba(15,23,42,0.08)]" align="end" sideOffset={8}>
            <DropdownMenuGroup>
              <div className="px-3 py-2">
                <p className="text-sm font-semibold font-heading leading-none text-foreground">{userName}</p>
                <p className="text-[10px] leading-none text-muted-foreground mt-1.5 font-mono uppercase tracking-wider">
                  GigTim Cont
                </p>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem render={
              <Link href="/profile" className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent dark:hover:bg-muted transition-colors rounded-sm">
                <User className="h-4 w-4" /> Profil
              </Link>
            } />
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="p-0">
              <form action={logout} className="w-full">
                <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer text-destructive hover:bg-destructive/10 transition-colors rounded-sm font-medium">
                  <LogOut className="h-4 w-4" /> Deconectare
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
