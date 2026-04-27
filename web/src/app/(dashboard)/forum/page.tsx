import { getForumPosts } from '@/lib/supabase/data-actions'
import { getCurrentProfile } from '@/lib/supabase/auth-actions'
import { ForumClient } from './ForumClient'

export const dynamic = 'force-dynamic'

export default async function ForumPage() {
  const [posts, profileData] = await Promise.all([
    getForumPosts(),
    getCurrentProfile(),
  ])

  return <ForumClient initialPosts={posts} userId={profileData?.user.id || null} />
}
