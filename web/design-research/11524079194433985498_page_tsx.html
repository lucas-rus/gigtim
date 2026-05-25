import { getCurrentProfile } from '@/lib/supabase/auth-actions'
import { getMyApplications } from '@/lib/supabase/data-actions'
import { ApplicationsClient } from './ApplicationsClient'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const [profileData, applications] = await Promise.all([
    getCurrentProfile(),
    getMyApplications(),
  ])

  const role = profileData?.user.role || 'WORKER'

  return <ApplicationsClient userRole={role} initialApplications={applications} />
}
