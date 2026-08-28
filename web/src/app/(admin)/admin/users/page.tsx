import { getAdminUsers } from '@/lib/romarg-auth'
import { UsersClient, type AdminUser } from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const rawUsers = await getAdminUsers()

  const initialUsers: AdminUser[] = rawUsers.map((u: any) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    name: u.role === 'WORKER' ? (u.worker_name || u.email) : (u.employer_company || u.email),
    city: (u.role === 'WORKER' ? u.worker_city : u.employer_city) || '—',
    verified: Boolean(u.email_verified),
    created: u.created_at ? new Date(u.created_at).toISOString() : '',
  }))

  return (
    <UsersClient initialUsers={initialUsers} />
  )
}
