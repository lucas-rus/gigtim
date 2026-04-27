'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logout } from '@/lib/supabase/auth-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/shifts', label: 'Ture', icon: '📋' },
  { href: '/applications', label: 'Aplicări', icon: '📨' },
  { href: '/chat', label: 'Mesaje', icon: '💬' },
  { href: '/forum', label: 'Forum', icon: '🗣️' },
  { href: '/settings', label: 'Setări', icon: '⚙️' },
]

const adminItems = [
  { href: '/admin/users', label: 'Utilizatori', icon: '👥' },
  { href: '/admin/verifications', label: 'Verificări ID', icon: '🛡️' },
  { href: '/admin/audit-log', label: 'Jurnal audit', icon: '📝' },
]

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="p-6 pb-4">
        <Link href="/shifts" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold shadow-md shadow-primary/20">
            G
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">GigTim</h2>
            <p className="text-[11px] text-muted-foreground leading-none">
              Marketplace zilieri
            </p>
          </div>
        </Link>
      </div>

      <Separator className="mx-4 w-auto" />

      {/* Nav links */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
                {item.href === '/chat' && (
                  <Badge
                    variant="secondary"
                    className="ml-auto h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]"
                  >
                    •
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>

        <Separator className="my-4" />

        {/* Admin section */}
        <div className="space-y-1">
          <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Admin
          </p>
          {adminItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          >
            🚪 Deconectare
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] flex-shrink-0 border-r bg-card/50 backdrop-blur-sm md:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:hidden">
          <SheetTrigger render={
            <Button variant="ghost" size="sm" className="text-lg">
              ☰
            </Button>
          } />
          <span className="font-bold">GigTim</span>
        </div>
        <SheetContent side="left" className="w-[260px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
