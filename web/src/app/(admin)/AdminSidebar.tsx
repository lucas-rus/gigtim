'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/supabase/auth-actions'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Users, Shield, FileText, ClipboardList, MessageSquare, LogOut } from 'lucide-react'

const adminItems = [
  { href: '/admin/users', label: 'Utilizatori', icon: Users },
  { href: '/admin/verifications', label: 'Verificări ID', icon: Shield },
  { href: '/admin/audit-log', label: 'Jurnal audit', icon: FileText },
]

const dashboardItems = [
  { href: '/shifts', label: '← Ture (Dashboard)', icon: ClipboardList },
  { href: '/forum', label: '← Forum', icon: MessageSquare },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-border">
      {/* Brand */}
      <div className="p-6 pb-4">
        <Link href="/admin/users" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-red-600 text-white text-lg font-bold font-heading">
            A
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight font-heading text-red-600">GigTim</h2>
            <p className="text-[10px] text-red-600/80 leading-none font-mono uppercase tracking-wider mt-0.5">
              Panou Admin
            </p>
          </div>
        </Link>
      </div>

      <Separator className="mx-4 w-auto bg-border/60" />

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Administrare
          </p>
          {adminItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-red-50 text-red-700 font-semibold border-l-2 border-red-600 pl-2.5 rounded-l-none'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-sans">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <Separator className="my-4 bg-border/60" />

        <div className="space-y-1">
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Navigare rapidă
          </p>
          {dashboardItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-sans">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive text-sm font-medium rounded"
          >
            <LogOut className="h-4 w-4" /> Deconectare
          </Button>
        </form>
      </div>
    </div>
  )
}

