import { getCurrentProfile } from '@/lib/romarg-auth'
import { getMyApplications } from '@/lib/romarg-data'
import { ApplicationsClient } from './ApplicationsClient'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const [profile, applications] = await Promise.all([
    getCurrentProfile(),
    getMyApplications(),
  ])

  const role = profile?.role || 'WORKER'

  return <ApplicationsClient userRole={role} initialApplications={applications} />
}
