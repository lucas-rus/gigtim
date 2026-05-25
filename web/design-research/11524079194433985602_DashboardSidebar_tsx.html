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
  { href: '/jobs', label: 'Marketplace', icon: '🔍' },
  { href: '/shifts', label: 'Ture', icon: '📋' },
  { href: '/applications', label: 'Aplicări', icon: '📨' },
  { href: '/chat', label: 'Mesaje', icon: '💬' },
  { href: '/forum', label: 'Forum', icon: '🗣️' },
]

const adminItems = [
  { href: '/admin/users', label: 'Utilizatori', icon: '👥' },
  { href: '/admin/verifications', label: 'Verificări ID', icon: '🛡️' },
  { href: '/admin/audit-log', label: 'Jurnal audit', icon: '📝' },
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
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="p-6 pb-4">
        <Link href="/jobs" className="flex items-center gap-3 transition-opacity hover:opacity-80">
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
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const showBadge = item.href === '/chat' && chatUnread > 0
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
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <Badge className="h-5 min-w-5 justify-center rounded-full bg-primary px-1.5 text-[10px]">
                    {chatUnread}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>

        {userRole === 'ADMIN' && (
          <>
            <Separator className="my-4" />
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
          </>
        )}
      </ScrollArea>
    </div>
  )
}
