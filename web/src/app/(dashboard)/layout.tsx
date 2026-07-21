import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/romarg-auth'
import { DashboardLayoutClient } from './DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/login')
  }

  const role = profile.role || 'WORKER'
  const name = role === 'WORKER' ? profile.full_name : profile.company_name
  const userName = name || profile.email || 'Utilizator'
  const fallbackText = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?'

  return (
    <DashboardLayoutClient 
      userRole={role} 
      avatarUrl={profile.avatar_url}
      userName={userName}
      fallbackText={fallbackText}
    >
      {children}
    </DashboardLayoutClient>
  )
}
