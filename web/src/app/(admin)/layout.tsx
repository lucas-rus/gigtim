import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/supabase/auth-actions'
import { AdminSidebar } from './AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()
  
  if (!profile || profile.user.role !== 'ADMIN') {
    redirect('/shifts')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-[260px] flex-shrink-0 border-r bg-card/50 backdrop-blur-sm md:block">
        <AdminSidebar />
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
