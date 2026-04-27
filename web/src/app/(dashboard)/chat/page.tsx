'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Demo chat data
const demoRooms = [
  { id: '1', name: 'Tură: Ospătar — 28 Apr', type: 'SHIFT' as const, lastMessage: 'Te aștept la ora 8', unread: 2, time: '10:32' },
  { id: '2', name: 'Andrei Popescu', type: 'DIRECT' as const, lastMessage: 'Salut, am o întrebare', unread: 0, time: 'Ieri' },
  { id: '3', name: 'Tură: Barista — 29 Apr', type: 'SHIFT' as const, lastMessage: 'Am confirmat!', unread: 1, time: '09:15' },
]

const demoMessages = [
  { id: '1', sender: 'Andrei Popescu', content: 'Bună ziua! Am aplicat pentru tura de ospătar.', time: '10:20', isMine: false },
  { id: '2', sender: 'Eu', content: 'Salut Andrei! Am văzut aplicarea ta, arată bine. Ai experiență în zona de restaurant?', time: '10:25', isMine: true },
  { id: '3', sender: 'Andrei Popescu', content: 'Da, am lucrat 2 ani la un restaurant în centru. Am și experiență cu POS-ul.', time: '10:28', isMine: false },
  { id: '4', sender: 'Eu', content: 'Super! Te aștept la ora 8 dimineața la adresă. Adu actele la tine.', time: '10:32', isMine: true },
]

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState(demoRooms[0].id)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(demoMessages)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    if (!message.trim()) return
    setMessages((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        sender: 'Eu',
        content: message.trim(),
        time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
        isMine: true,
      },
    ])
    setMessage('')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mesaje</h1>
        <p className="text-sm text-muted-foreground">Conversațiile tale cu lucrătorii și angajatorii</p>
      </div>

      <div className="flex h-[calc(100vh-220px)] rounded-xl border border-border/50 overflow-hidden bg-card/30">
        {/* Room list */}
        <div className="w-72 flex-shrink-0 border-r bg-card/50 hidden md:flex md:flex-col">
          <div className="p-3">
            <Input placeholder="Caută conversație..." className="h-9" />
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            {demoRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={cn(
                  'flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-accent/50',
                  selectedRoom === room.id && 'bg-accent'
                )}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="text-xs font-bold">
                    {room.type === 'SHIFT' ? '📋' : room.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{room.name}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{room.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                </div>
                {room.unread > 0 && (
                  <Badge className="h-5 min-w-5 justify-center rounded-full bg-primary px-1.5 text-[10px]">
                    {room.unread}
                  </Badge>
                )}
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">AP</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">
                {demoRooms.find((r) => r.id === selectedRoom)?.name}
              </p>
              <p className="text-[11px] text-emerald-400">Online</p>
            </div>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex', msg.isMine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2.5',
                      msg.isMine
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-accent rounded-bl-md'
                    )}
                  >
                    {!msg.isMine && (
                      <p className="text-[11px] font-semibold text-primary mb-1">{msg.sender}</p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={cn(
                      'text-[10px] mt-1',
                      msg.isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    )}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-3">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Scrie un mesaj..."
                className="flex-1"
              />
              <Button type="submit" disabled={!message.trim()}>
                Trimite
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
