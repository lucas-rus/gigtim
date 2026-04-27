import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/supabase/auth-actions'
import { DashboardLayoutClient } from './DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const data = await getCurrentProfile()

  if (!data) {
    redirect('/login')
  }

  const { user, profile, profileType } = data
  const role = user.role || 'WORKER'
  const name = profileType === 'worker' ? (profile as any)?.full_name : (profile as any)?.company_name
  const userName = name || user.email || 'Utilizator'
  const fallbackText = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?'

  return (
    <DashboardLayoutClient 
      userRole={role} 
      avatarUrl={user.avatar_url}
      userName={userName}
      fallbackText={fallbackText}
    >
      {children}
    </DashboardLayoutClient>
  )
}
