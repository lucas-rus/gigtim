import { getAdminUsers } from '@/lib/supabase/auth-actions'
import { UsersClient } from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const users = await getAdminUsers()

  return (
    <UsersClient initialUsers={users} />
  )
}
