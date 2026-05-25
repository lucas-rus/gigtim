'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types/database'

const navItems = [
  { href: '/jobs', label: 'Marketplace' },
  { href: '/shifts', label: 'Ture' },
  { href: '/applications', label: 'Aplicări' },
  { href: '/chat', label: 'Mesaje' },
  { href: '/forum', label: 'Forum' },
]

const adminItems = [
  { href: '/admin/users', label: 'Utilizatori' },
  { href: '/admin/verifications', label: 'Verificări ID' },
  { href: '/admin/audit-log', label: 'Jurnal audit' },
]

export function DashboardSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()
  const [chatUnread, setChatUnread] = useState(0)

  // Read unread count from localStorage and poll for changes
  useEffect(() => {
    function readUnread() {
      try {
        const stored = localStorage.getItem('gigtim_chat_rooms')
        if (stored) {
          const rooms = JSON.parse(stored) as { unread: number }[]
          setChatUnread(rooms.reduce((acc, r) => acc + r.unread, 0))
        }
      } catch {}
    }
    readUnread()
    // Poll every 2 seconds for changes (cross-component sync)
    const interval = setInterval(readUnread, 2000)
    // Also listen for storage events (cross-tab sync)
    window.addEventListener('storage', readUnread)
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', readUnread)
    }
  }, [])

  return (
    <div className="flex h-full flex-col bg-[#eff4ff] dark:bg-sidebar">
      {/* Brand */}
      <div className="px-6 py-5 flex flex-col gap-1 border-b border-border dark:border-sidebar-border mb-2">
        <Link href="/jobs" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-lg font-bold font-heading">
            G
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight font-heading text-primary">GigTim</h2>
            <p className="text-[10px] text-muted-foreground leading-none font-mono uppercase tracking-wider">
              Marketplace zilieri
            </p>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const showBadge = item.href === '/chat' && chatUnread > 0
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'text-muted-foreground hover:text-primary hover:bg-accent dark:hover:bg-sidebar-accent font-medium'
                )}
              >
                <span className="flex-1 font-mono text-xs uppercase tracking-wider">{item.label}</span>
                {showBadge && (
                  <Badge className={cn(
                    'h-5 min-w-5 justify-center rounded px-1.5 text-[10px] font-mono',
                    isActive
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-primary text-primary-foreground'
                  )}>
                    {chatUnread}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>

        {userRole === 'ADMIN' && (
          <>
            <Separator className="my-4 bg-border dark:bg-sidebar-border" />
            <div className="space-y-1.5">
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Admin
              </p>
              {adminItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'text-muted-foreground hover:text-primary hover:bg-accent dark:hover:bg-sidebar-accent font-medium'
                    )}
                  >
                    <span className="font-mono text-xs uppercase tracking-wider">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  )
}
