'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ForumCategory } from '@/lib/types/database'

const categoryLabels: Record<ForumCategory, { label: string; icon: string }> = {
  GENERAL: { label: 'General', icon: '💬' },
  TIPS: { label: 'Sfaturi', icon: '💡' },
  JOBS: { label: 'Locuri de muncă', icon: '💼' },
  LEGAL: { label: 'Legal', icon: '⚖️' },
}

const demoPosts = [
  {
    id: '1', title: 'Cum funcționează plata prin aplicație?', category: 'GENERAL' as ForumCategory,
    author: 'Maria I.', content: 'Salut! Sunt nouă pe platformă și aș vrea să știu cum se procesează plățile. Se face prin Stripe direct sau...?',
    created_at: '2026-04-27T08:00:00Z', pinned: true, comments: 5, likes: 12,
  },
  {
    id: '2', title: 'Sfaturi pentru prima tură ca ospătar', category: 'TIPS' as ForumCategory,
    author: 'Andrei P.', content: 'Am terminat prima mea tură ieri și vreau să dau câteva sfaturi pentru cei care abia încep...',
    created_at: '2026-04-26T15:30:00Z', pinned: false, comments: 8, likes: 24,
  },
  {
    id: '3', title: 'Cerințe legale CNP/CI pentru zilieri', category: 'LEGAL' as ForumCategory,
    author: 'Admin GigTim', content: 'Conform Legii 52/2011, angajatorii sunt obligați să înregistreze zilierul la ITM înainte de începerea activității...',
    created_at: '2026-04-25T10:00:00Z', pinned: true, comments: 3, likes: 31,
  },
  {
    id: '4', title: 'Caut barista weekend-uri în București', category: 'JOBS' as ForumCategory,
    author: 'Coffee Lab SRL', content: 'Avem nevoie de un barista cu experiență pentru weekend-uri. Plata 45 RON/oră. Zona Victoriei.',
    created_at: '2026-04-26T20:00:00Z', pinned: false, comments: 2, likes: 5,
  },
]

const demoComments = [
  { id: '1', author: 'Ion D.', content: 'Plata se procesează automat la 24h după finalizarea turei.', time: '2 ore' },
  { id: '2', author: 'Admin', content: 'Corect! Plata se face via Stripe Connect. Poți vedea detalii în Setări > Plăți.', time: '1 oră' },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'acum'
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}z`
}

export default function ForumPage() {
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [commentText, setCommentText] = useState('')

  const post = demoPosts.find((p) => p.id === selectedPost)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forum</h1>
          <p className="text-sm text-muted-foreground">Comunitatea GigTim — întrebări, sfaturi și discuții</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button>＋ Postare nouă</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Postare nouă</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="post-title">Titlu</Label>
                <Input id="post-title" placeholder="Despre ce vrei să discuți?" />
              </div>
              <div className="grid gap-2">
                <Label>Categorie</Label>
                <Select defaultValue="GENERAL">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(categoryLabels)).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="post-content">Conținut</Label>
                <Textarea id="post-content" rows={5} placeholder="Scrie aici..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Anulare</Button>
              <Button onClick={() => setDialogOpen(false)}>Publică</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="ALL">
        <TabsList>
          <TabsTrigger value="ALL">Toate</TabsTrigger>
          {Object.entries(categoryLabels).map(([key, val]) => (
            <TabsTrigger key={key} value={key}>{val.icon} {val.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="ALL" className="mt-4 space-y-3">
          {demoPosts.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
              onClick={() => setSelectedPost(selectedPost === p.id ? null : p.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarFallback className="text-xs font-bold">{p.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.pinned && <Badge variant="secondary" className="text-[10px]">📌 Fixat</Badge>}
                      <Badge variant="outline" className="text-[10px]">
                        {categoryLabels[p.category].icon} {categoryLabels[p.category].label}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-1">{p.title}</CardTitle>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{p.author}</span>
                      <span>·</span>
                      <span>{timeAgo(p.created_at)}</span>
                      <span>·</span>
                      <span>💬 {p.comments}</span>
                      <span>·</span>
                      <span>👍 {p.likes}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {selectedPost === p.id && (
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.content}</p>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Comentarii ({demoComments.length})</p>
                    {demoComments.map((c) => (
                      <div key={c.id} className="flex gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px]">{c.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 rounded-lg bg-accent/50 p-3">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold">{c.author}</span>
                            <span className="text-muted-foreground">· {c.time}</span>
                          </div>
                          <p className="text-sm mt-1">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Scrie un comentariu..."
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); setCommentText(''); }}>
                        Trimite
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {Object.keys(categoryLabels).map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <p className="text-sm text-muted-foreground">
              {demoPosts.filter((p) => p.category === cat).length} postări în {categoryLabels[cat as ForumCategory].label}
            </p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
