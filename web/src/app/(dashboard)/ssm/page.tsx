import { getCurrentProfile } from '@/lib/romarg-auth'
import { SSMClient } from './SSMClient'

export const metadata = {
  title: 'Protecția Muncii (SSM) & Pașaport Digital — GigTim',
  description: 'Instruire electronică rapidă SSM și pașaport digital conform Legii 319/2006 și OUG 36/2021.',
}

export default async function SSMPage() {
  const profile = await getCurrentProfile()
  const userRole = profile?.role || 'WORKER'
  const userName = (userRole === 'WORKER' ? profile?.full_name : profile?.company_name) || 'Utilizator'

  return <SSMClient userRole={userRole} userName={userName} />
}
