'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/supabase/auth-actions'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const adminItems = [
  { href: '/admin/users', label: 'Utilizatori', icon: '👥' },
  { href: '/admin/verifications', label: 'Verificări ID', icon: '🛡️' },
  { href: '/admin/audit-log', label: 'Jurnal audit', icon: '📝' },
]

const dashboardItems = [
  { href: '/shifts', label: '← Ture (Dashboard)', icon: '📋' },
  { href: '/forum', label: '← Forum', icon: '🗣️' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="p-6 pb-4">
        <Link href="/admin/users" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white text-lg font-bold shadow-md shadow-red-900/30">
            A
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">GigTim</h2>
            <p className="text-[11px] text-red-400 leading-none font-medium">
              Panou Admin
            </p>
          </div>
        </Link>
      </div>

      <Separator className="mx-4 w-auto" />

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Administrare
          </p>
          {adminItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-red-500/10 text-red-400 shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigare rapidă
          </p>
          {dashboardItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </ScrollArea>

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
