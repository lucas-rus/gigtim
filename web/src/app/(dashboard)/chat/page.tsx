import { getChatRooms } from '@/lib/supabase/data-actions'
import { getCurrentProfile } from '@/lib/supabase/auth-actions'
import { ChatClient } from './ChatClient'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const [rooms, profileData] = await Promise.all([
    getChatRooms(),
    getCurrentProfile(),
  ])

  return <ChatClient initialRooms={rooms} userId={profileData?.user.id || null} />
}
