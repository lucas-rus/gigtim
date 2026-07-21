import { getForumPosts } from '@/lib/romarg-data'
import { getCurrentProfile } from '@/lib/romarg-auth'
import { ForumClient } from './ForumClient'

export const dynamic = 'force-dynamic'

export default async function ForumPage() {
  const [posts, profile] = await Promise.all([
    getForumPosts(),
    getCurrentProfile(),
  ])

  return <ForumClient initialPosts={posts} _userId={profile?.id || null} />
}
