import { getCurrentProfile } from '@/lib/supabase/auth-actions'
import { getMyShifts } from '@/lib/supabase/data-actions'
import { ShiftsClient } from './ShiftsClient'

export const dynamic = 'force-dynamic'

export default async function ShiftsPage() {
  const [profileData, shifts] = await Promise.all([
    getCurrentProfile(),
    getMyShifts(),
  ])

  const role = profileData?.user.role || 'WORKER'

  return <ShiftsClient userRole={role} initialShifts={shifts} />
}
