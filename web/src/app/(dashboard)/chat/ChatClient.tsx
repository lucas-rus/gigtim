'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { getChatMessages, sendChatMessage } from '@/lib/supabase/data-actions'
import { createClient } from '@/lib/supabase/client'

function useCurrentTime() {
  const [time, setTime] = useState<number>(0)
  useEffect(() => {
    setTime(Date.now())
    const interval = setInterval(() => setTime(Date.now()), 10000)
    return () => clearInterval(interval)
  }, [])
  return time
}

interface ChatClientProps {
  initialRooms: any[]
  userId: string | null
}

export function ChatClient({ initialRooms, userId }: ChatClientProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const now = useCurrentTime()

  const selectedRoomData = initialRooms.find(r => r.id === selectedRoom)

  function selectRoom(roomId: string) {
    setSelectedRoom(roomId)
    startTransition(async () => {
      const msgs = await getChatMessages(roomId)
      setMessages(msgs)
    })
  }

  function handleSend() {
    if (!newMessage.trim() || !selectedRoom) return
    const msg = newMessage.trim()
    setNewMessage('')

    // Optimistic update
    setMessages(prev => [...prev, {
      id: `temp-${Date.now()}`,
      sender_id: userId,
      sender_name: 'Tu',
      is_mine: true,
      content: msg,
      created_at: new Date().toISOString(),
    }])

    startTransition(async () => {
      const result = await sendChatMessage(selectedRoom, msg)
      if (result.error) {
        // Simple error logging
        console.error(result.error)
      } else {
        const msgs = await getChatMessages(selectedRoom)
        setMessages(msgs)
      }
    })
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!selectedRoom) return
    
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${selectedRoom}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoom}`,
        },
        async (_payload) => {
          // A new message was inserted via the database
          // Let's refetch all messages to easily ensure we have sender names
          const msgs = await getChatMessages(selectedRoom)
          setMessages(msgs)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedRoom])

  function timeAgo(iso: string) {
    if (now === 0) return '...'
    const diff = now - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'acum'
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}z`
  }

  if (initialRooms.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mesaje</h1>
          <p className="text-sm text-muted-foreground">Conversațiile tale</p>
        </div>
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg">Niciun chat încă</p>
          <p className="text-sm mt-1">
            Chaturile se creează automat când o aplicare este acceptată.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mesaje</h1>
        <p className="text-sm text-muted-foreground">{initialRooms.length} conversații</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Room list */}
        <Card className="border-border/50 overflow-y-auto p-0">
          {initialRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => selectRoom(room.id)}
              className={`w-full text-left p-4 border-b border-border/30 hover:bg-accent/50 transition-colors ${
                selectedRoom === room.id ? 'bg-accent/60' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm truncate">{room.name || 'Chat'}</p>
                <span className="text-[10px] text-muted-foreground">{timeAgo(room.last_message_at)}</span>
              </div>
              {room.last_message && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {room.last_sender_is_me ? 'Tu: ' : ''}{room.last_message}
                </p>
              )}
            </button>
          ))}
        </Card>

        {/* Messages */}
        <Card className="border-border/50 md:col-span-2 flex flex-col">
          {!selectedRoom ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Selectează o conversație
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border/30">
                <p className="font-medium">{selectedRoomData?.name || 'Chat'}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Niciun mesaj încă. Trimite primul mesaj!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${msg.is_mine ? 'order-1' : ''}`}>
                        {!msg.is_mine && (
                          <p className="text-[10px] text-muted-foreground mb-1">{msg.sender_name}</p>
                        )}
                        <div className={`px-3 py-2 rounded-2xl text-sm ${
                          msg.is_mine
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-accent/60 rounded-bl-md'
                        }`}>
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {timeAgo(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border/30 flex gap-2">
                <Input
                  placeholder="Scrie un mesaj..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} disabled={isPending || !newMessage.trim()}>
                  Trimite
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
