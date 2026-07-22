'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon, Menu, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout } from '@/lib/romarg-auth'
import { DashboardSidebar } from './DashboardSidebar'
import { TopHeader } from '@/components/layout/TopHeader'
import { LogoMark } from '@/components/brand/Logo'
import type { UserRole } from '@/lib/types/database'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  userRole: UserRole
  avatarUrl?: string | null
  userName: string
  fallbackText: string
}

export function DashboardLayoutClient({ 
  children, 
  userRole, 
  avatarUrl, 
  userName, 
  fallbackText 
}: DashboardLayoutClientProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-sidebar-border md:block z-40 h-screen sticky top-0 bg-sidebar">
        <DashboardSidebar userRole={userRole} />
      </aside>

      {/* Mobile sidebar & header */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/60 dark:border-sidebar-border bg-card/90 dark:bg-sidebar/95 backdrop-blur-md px-4 md:hidden">
          <div className="flex items-center gap-3">
            <SheetTrigger>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-foreground hover:bg-accent dark:hover:bg-sidebar-accent transition-all duration-200">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/25">
                <LogoMark size={21} strokeWidth={2.2} />
              </span>
              <span className="text-lg font-bold text-foreground font-heading tracking-tight">GigTim</span>
            </Link>
          </div>

          {/* Mobile Right Controls: Theme + Avatar */}
          <div className="flex items-center gap-2">
            {mounted ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-4 w-4 text-accent" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="h-8 w-8 rounded-xl border border-border/60 bg-white/5 shrink-0" />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="relative h-9 w-9 rounded-xl p-0">
                  <Avatar className="h-8 w-8 border border-border/80 hover:border-primary cursor-pointer rounded-xl">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} className="object-cover rounded-xl" />}
                    <AvatarFallback className="bg-accent text-primary font-bold font-heading rounded-xl text-xs">
                      {fallbackText}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 border border-border/60 bg-card/95 backdrop-blur-md dark:bg-card rounded-2xl shadow-xl" align="end" sideOffset={8}>
                <DropdownMenuGroup>
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold font-heading leading-none text-foreground">{userName}</p>
                    <p className="text-[10px] leading-none text-muted-foreground mt-1.5 font-mono uppercase tracking-wider">
                      GigTim Cont
                    </p>
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem>
                  <Link href="/profile" className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent dark:hover:bg-muted transition-colors rounded-xl">
                    <User className="h-4 w-4" /> Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem className="p-0">
                  <form action={logout} className="w-full">
                    <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer text-destructive hover:bg-destructive/10 transition-colors rounded-xl font-medium">
                      <LogOut className="h-4 w-4" /> Deconectare
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <SheetContent side="left" className="w-64 p-0 border-r border-border/60 dark:border-sidebar-border bg-card dark:bg-sidebar">
          <DashboardSidebar userRole={userRole} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header for Desktop */}
        <div className="hidden md:block">
          <TopHeader 
            avatarUrl={avatarUrl} 
            fallbackText={fallbackText} 
            userName={userName} 
          />
        </div>
        
        {/* Inner Content Area */}
        <div className="flex-1 overflow-auto bg-background/50">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
