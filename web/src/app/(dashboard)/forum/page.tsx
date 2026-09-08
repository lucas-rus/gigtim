import { getForumPosts } from '@/lib/romarg-data'
import { getCurrentProfile } from '@/lib/romarg-auth'
import { ForumClient } from './ForumClient'

export const dynamic = 'force-dynamic'

export default async function ForumPage() {
  const [posts, profile] = await Promise.all([
    getForumPosts(),
    getCurrentProfile(),
  ])

  const currentUser = profile ? {
    id: profile.id,
    name: profile.full_name || profile.company_name || profile.email,
    avatar: profile.avatar_url || null,
  } : null

  return <ForumClient initialPosts={posts} _userId={profile?.id || null} currentUser={currentUser} />
}
