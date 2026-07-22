'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { LogoMark } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types/database'
import {
  Map,
  CalendarClock,
  ClipboardList,
  MessageCircle,
  MessagesSquare,
  Users,
  ShieldCheck,
  ScrollText,
} from 'lucide-react'

const navItems = [
  { href: '/jobs', label: 'Marketplace', icon: Map },
  { href: '/shifts', label: 'Ture', icon: CalendarClock },
  { href: '/applications', label: 'Aplicări', icon: ClipboardList },
  { href: '/chat', label: 'Mesaje', icon: MessageCircle },
  { href: '/forum', label: 'Forum', icon: MessagesSquare },
]

const adminItems = [
  { href: '/admin/users', label: 'Utilizatori', icon: Users },
  { href: '/admin/verifications', label: 'Verificări ID', icon: ShieldCheck },
  { href: '/admin/audit-log', label: 'Jurnal audit', icon: ScrollText },
]

export function DashboardSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-sidebar-border mb-2">
        <Link
          href="/jobs"
          className="flex items-center gap-3 transition-opacity hover:opacity-85"
          aria-label="GigTim — pagina principală"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <LogoMark size={26} strokeWidth={2.1} />
          </span>
          <span className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight font-heading text-foreground leading-tight">
              GigTim
            </span>
            <span className="text-[10px] text-muted-foreground leading-none font-mono uppercase tracking-wider">
              Marketplace zilieri
            </span>
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1" aria-label="Navigație principală">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent font-medium'
                )}
              >
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 shrink-0 transition-colors',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                  )}
                  strokeWidth={isActive ? 2.4 : 2}
                  aria-hidden="true"
                />
                <span className="flex-1 font-mono text-[11px] uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {userRole === 'ADMIN' && (
          <>
            <Separator className="my-4 bg-sidebar-border" />
            <nav className="space-y-1" aria-label="Administrare">
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Admin
              </p>
              {adminItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent font-medium'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4.5 w-4.5 shrink-0 transition-colors',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                      )}
                      strokeWidth={isActive ? 2.4 : 2}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-[11px] uppercase tracking-wider">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </>
        )}
      </ScrollArea>
    </div>
  )
}
