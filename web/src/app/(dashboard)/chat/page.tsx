import { getChatRooms, getPotentialConnections } from '@/lib/romarg-data'
import { getCurrentProfile } from '@/lib/romarg-auth'
import { ChatClient } from './ChatClient'

export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const [rooms, profile, connections] = await Promise.all([
    getChatRooms(),
    getCurrentProfile(),
    getPotentialConnections(),
  ])

  return (
    <ChatClient 
      initialRooms={rooms} 
      userId={profile?.id || null} 
      potentialConnections={connections}
    />
  )
}
