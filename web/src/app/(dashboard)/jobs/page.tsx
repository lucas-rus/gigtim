import { getOpenShifts, getMyApplications } from '@/lib/supabase/data-actions'
import { getCurrentProfile } from '@/lib/supabase/auth-actions'
import { JobsClient } from './JobsClient'

export const dynamic = 'force-dynamic'

export default async function JobsMarketplacePage() {
  const [shifts, profileData] = await Promise.all([
    getOpenShifts(),
    getCurrentProfile(),
  ])

  const userRole = profileData?.user.role || 'WORKER'
  const userId = profileData?.user.id || null

  let initialAppliedShiftIds: string[] = []
  if (userRole === 'WORKER') {
    const apps = await getMyApplications()
    initialAppliedShiftIds = apps.map((a: any) => a.shift_id)
  }

  return (
    <JobsClient 
      shifts={shifts} 
      userRole={userRole} 
      _userId={userId} 
      initialAppliedShiftIds={initialAppliedShiftIds} 
    />
  )
}
