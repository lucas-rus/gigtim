import { getCurrentProfile } from '@/lib/romarg-auth'
import { getMyShifts } from '@/lib/romarg-data'
import { ShiftsClient } from './ShiftsClient'

export const dynamic = 'force-dynamic'

export default async function ShiftsPage() {
  const [profile, shifts] = await Promise.all([
    getCurrentProfile(),
    getMyShifts(),
  ])

  const role = profile?.role || 'WORKER'

  return <ShiftsClient userRole={role} initialShifts={shifts} />
}
