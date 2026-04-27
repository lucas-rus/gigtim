import { getOpenShifts } from '@/lib/supabase/data-actions'
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

  return <JobsClient shifts={shifts} userRole={userRole} userId={userId} />
}
