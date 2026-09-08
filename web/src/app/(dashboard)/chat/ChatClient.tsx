'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { getChatMessages, sendChatMessage, getOrCreateDirectChat } from '@/lib/romarg-data'
import { useRouter, useSearchParams } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
  currentUserAvatar?: string | null
  potentialConnections: any[]
}

export function ChatClient({ initialRooms, userId, currentUserAvatar, potentialConnections }: ChatClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlRoomId = searchParams.get('room')

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [showInbox, setShowInbox] = useState(true)
  const [activeTab, setActiveTab] = useState<'rooms' | 'connections'>('rooms')
  const [searchQuery, setSearchQuery] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const now = useCurrentTime()

  const selectedRoomData = initialRooms.find(r => r.room_id === selectedRoom)

  function selectRoom(roomId: string) {
    setSelectedRoom(roomId)
    setShowInbox(false)
    startTransition(async () => {
      const msgs = await getChatMessages(roomId)
      setMessages(msgs)
    })
  }

  function handleStartChatFromConnection(targetUserId: string) {
    startTransition(async () => {
      const res = await getOrCreateDirectChat(targetUserId)
      if (res.roomId) {
        setActiveTab('rooms')
        setSearchQuery('')
        selectRoom(res.roomId)
        router.replace(`/chat?room=${res.roomId}`)
      } else if (res.error) {
        console.error(res.error)
      }
    })
  }

  useEffect(() => {
    if (urlRoomId && initialRooms.some(r => r.room_id === urlRoomId)) {
      selectRoom(urlRoomId)
    }
  }, [urlRoomId, initialRooms])

  function handleSend() {
    if (!newMessage.trim() || !selectedRoom) return
    const msg = newMessage.trim()
    setNewMessage('')

    // Optimistic update
    setMessages(prev => [...prev, {
      id: `temp-${Date.now()}`,
      sender_id: userId,
      sender_name: 'Tu',
      sender_avatar: currentUserAvatar || null,
      is_mine: true,
      content: msg,
      created_at: new Date().toISOString(),
    }])

    startTransition(async () => {
      const result = await sendChatMessage(selectedRoom, msg)
      if (result.error) {
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
    
    const interval = setInterval(async () => {
      const msgs = await getChatMessages(selectedRoom)
      setMessages(msgs)
    }, 3000)

    return () => {
      clearInterval(interval)
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

  const filteredConnections = potentialConnections.filter(c => {
    const q = searchQuery.toLowerCase()
    return c.name?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight font-heading text-primary">Mesaje</h1>
        <p className="text-xs text-muted-foreground font-sans uppercase tracking-widest">{initialRooms.length} conversații</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-[calc(100vh-220px)] min-h-[480px] border border-border/60 rounded-2xl overflow-hidden bg-card/75 dark:bg-card/40 backdrop-blur-md">
        {/* Sidebar */}
        <div className={`${showInbox ? 'block' : 'hidden md:block'} border-r border-border/60 bg-card/50 dark:bg-sidebar/20 overflow-y-auto flex flex-col`}>
          <div className="p-3 border-b border-border/60 bg-muted/30 dark:bg-muted/10 flex gap-2">
            <Button
              variant={activeTab === 'rooms' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 rounded-xl text-xs font-semibold font-sans capitalize h-9 ${
                activeTab === 'rooms' 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'text-foreground hover:bg-muted/55 bg-transparent'
              }`}
              onClick={() => setActiveTab('rooms')}
            >
              Conversații
            </Button>
            <Button
              variant={activeTab === 'connections' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 rounded-xl text-xs font-semibold font-sans capitalize h-9 ${
                activeTab === 'connections' 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'text-foreground hover:bg-muted/55 bg-transparent'
              }`}
              onClick={() => setActiveTab('connections')}
            >
              Conexiuni
            </Button>
          </div>

          {activeTab === 'rooms' ? (
            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {initialRooms.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground font-sans mt-4">
                  Nicio conversație activă încă.<br/>Începe un chat din tabul Conexiuni.
                </div>
              ) : (
                initialRooms.map((room) => {
                  const isSelected = selectedRoom === room.room_id
                  return (
                    <button
                      key={room.room_id}
                      onClick={() => selectRoom(room.room_id)}
                      className={`w-full text-left px-4 py-3.5 transition-all duration-200 flex items-center gap-3 ${
                        isSelected
                          ? 'bg-accent dark:bg-muted/30 border-l-4 border-l-primary'
                          : 'bg-transparent hover:bg-muted/20 dark:hover:bg-muted/10 border-l-4 border-l-transparent'
                      }`}
                    >
                      <Avatar className="h-10 w-10 border border-border rounded-xl shrink-0">
                        {room.other_avatar && (
                          <AvatarImage
                            src={room.other_avatar}
                            alt={room.other_name || 'Avatar'}
                            className="object-cover rounded-xl"
                          />
                        )}
                        <AvatarFallback className="bg-primary/5 text-primary dark:bg-accent text-foreground font-bold text-xs font-heading rounded-xl">
                          {room.other_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-semibold truncate font-sans ${isSelected ? 'text-primary' : 'text-foreground'}`}>{room.other_name || 'Chat'}</p>
                          <span className="text-[10px] text-muted-foreground font-sans shrink-0">{timeAgo(room.last_message_at)}</span>
                        </div>
                        {room.last_message && (
                          <p className="text-xs text-muted-foreground mt-1 truncate font-sans">
                            {room.last_sender_id === userId ? 'Tu: ' : ''}{room.last_message}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="p-3 border-b border-border/40 bg-muted/10">
                <Input
                  placeholder="Caută după nume sau oraș..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 rounded-xl bg-background dark:bg-background/20 border border-border/80 text-xs font-sans placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div className="flex-1 overflow-y-auto divide-y border-b border-border/40">
                {filteredConnections.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground font-sans">
                    Nicio conexiune găsită
                  </div>
                ) : (
                  filteredConnections.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3.5 hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors border-b border-border/40"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 border border-border rounded-xl shrink-0">
                          {c.avatar_url && (
                            <AvatarImage
                              src={c.avatar_url}
                              alt={c.name}
                              className="object-cover rounded-xl"
                            />
                          )}
                          <AvatarFallback className="bg-muted dark:bg-accent text-foreground font-bold text-xs font-heading rounded-xl">
                            {c.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate font-sans leading-snug">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground font-sans mt-0.5 capitalize leading-none">{c.city || 'Oraș nespecificat'} · {c.role === 'WORKER' ? 'lucrător' : 'angajator'}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs font-sans font-semibold transition-all px-3"
                        onClick={() => handleStartChatFromConnection(c.id)}
                        disabled={isPending}
                      >
                        Mesaj
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className={`${!showInbox ? 'block' : 'hidden md:block'} md:col-span-2 flex flex-col overflow-hidden bg-card dark:bg-card/45`}>
          {!selectedRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm font-sans p-6">
              <MessageSquare className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <p className="font-heading font-semibold text-foreground/75">Selectează o conversație</p>
              <p className="text-xs text-muted-foreground mt-1">Alege din lista din stânga sau începe una nouă din Conexiuni</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-border/60 bg-muted/30 dark:bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <Button 
                    onClick={() => setShowInbox(true)} 
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8 rounded-xl p-0 hover:bg-accent flex items-center justify-center text-foreground transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-9 w-9 border border-border rounded-xl shrink-0">
                    {selectedRoomData?.other_avatar && (
                      <AvatarImage
                        src={selectedRoomData.other_avatar}
                        alt={selectedRoomData.other_name || 'Avatar'}
                        className="object-cover rounded-xl"
                      />
                    )}
                    <AvatarFallback className="bg-primary/5 text-primary dark:bg-accent text-foreground font-bold text-xs font-heading rounded-xl">
                      {selectedRoomData?.other_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold font-heading text-sm text-foreground">{selectedRoomData?.other_name || 'Chat'}</p>
                    <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest mt-0.5">conversație activă</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/50 dark:bg-background/20 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground font-sans py-8">
                    Niciun mesaj încă. Trimite primul mesaj!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.is_mine ?? msg.sender_id === userId
                    const displayAvatar = isMine 
                      ? (msg.sender_avatar || currentUserAvatar) 
                      : (msg.sender_avatar || selectedRoomData?.other_avatar)
                    return (
                    <div key={msg.id} className={`flex gap-2.5 ${isMine ? 'justify-end items-start' : 'justify-start items-start'}`}>
                      {!isMine && (
                        <Avatar className="h-7 w-7 border border-border rounded-lg shrink-0 mt-0.5">
                          {displayAvatar && (
                            <AvatarImage
                              src={displayAvatar}
                              alt={msg.sender_name || 'Avatar'}
                              className="object-cover rounded-lg"
                            />
                          )}
                          <AvatarFallback className="bg-muted text-[10px] font-semibold text-foreground font-sans rounded-lg">
                            {(msg.sender_name || '?')[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        {!isMine && (
                          <p className="text-[10px] font-semibold text-muted-foreground mb-1 font-sans uppercase tracking-widest">{msg.sender_name}</p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-sans shadow-sm ${
                          isMine
                            ? 'bg-primary text-primary-foreground rounded-br-none shadow-primary/5'
                            : 'bg-muted/80 dark:bg-muted/30 text-foreground rounded-bl-none border border-border/50'
                        }`}>
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-sans">
                          {timeAgo(msg.created_at)}
                        </p>
                      </div>
                      {isMine && (
                        <Avatar className="h-7 w-7 border border-border rounded-lg shrink-0 mt-0.5">
                          {displayAvatar && (
                            <AvatarImage
                              src={displayAvatar}
                              alt="Tu"
                              className="object-cover rounded-lg"
                            />
                          )}
                          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary font-sans rounded-lg">
                            Tu
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/60 bg-muted/30 dark:bg-muted/10 flex gap-2 items-center">
                <Input
                  placeholder="Scrie un mesaj..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="bg-background dark:bg-background/40 border border-border/80 focus:border-primary focus:ring-2 focus:ring-ring transition-all rounded-xl h-11 flex-1 text-sm font-sans"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isPending || !newMessage.trim()}
                  className="h-11 px-5 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold bg-primary hover:bg-primary/90 hover:brightness-110 text-primary-foreground transition-all duration-200"
                >
                  Trimite
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
