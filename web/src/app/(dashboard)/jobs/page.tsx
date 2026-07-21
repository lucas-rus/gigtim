import { getOpenShifts, getMyApplications } from '@/lib/romarg-data'
import { getCurrentProfile } from '@/lib/romarg-auth'
import { JobsClient } from './JobsClient'

export const dynamic = 'force-dynamic'

export default async function JobsMarketplacePage() {
  const [shifts, profile] = await Promise.all([
    getOpenShifts(),
    getCurrentProfile(),
  ])

  const userRole = profile?.role || 'WORKER'
  const userId = profile?.id || null

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
