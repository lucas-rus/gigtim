'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { DashboardSidebar } from './DashboardSidebar'
import { TopHeader } from '@/components/layout/TopHeader'
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

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] flex-shrink-0 border-r bg-card/50 backdrop-blur-sm md:block z-40">
        <DashboardSidebar userRole={userRole} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:hidden">
          <div className="flex items-center gap-4">
            <SheetTrigger render={
              <Button variant="ghost" size="sm" className="text-lg">
                ☰
              </Button>
            } />
            <span className="font-bold">GigTim</span>
          </div>
          {/* We can optionally render a mini TopHeader or just avatar here for mobile */}
        </div>
        <SheetContent side="left" className="w-[260px] p-0">
          <DashboardSidebar userRole={userRole} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header for Desktop & Mobile */}
        <div className="hidden md:block">
          <TopHeader 
            avatarUrl={avatarUrl} 
            fallbackText={fallbackText} 
            userName={userName} 
          />
        </div>
        
        {/* Inner Content Area */}
        <div className="flex-1 overflow-auto bg-muted/10">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
