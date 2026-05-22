'use client'

import { useState, useTransition, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { createForumPost, getForumComments, createForumComment } from '@/lib/supabase/data-actions'
import type { ForumCategory } from '@/lib/types/database'

const categoryLabels: Record<ForumCategory, string> = {
  GENERAL: '💬 General',
  TIPS: '💡 Sfaturi',
  JOBS: '💼 Joburi',
  LEGAL: '⚖️ Legal',
}

const emptySubscribe = () => () => {}
function useCurrentTime() {
  return useSyncExternalStore(
    emptySubscribe,
    () => Date.now(),
    () => 0
  )
}

interface ForumClientProps {
  initialPosts: any[]
  _userId: string | null
}

export function ForumClient({ initialPosts, _userId }: ForumClientProps) {
  const [tab, setTab] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const now = useCurrentTime()

  // New post form
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<string>('GENERAL')

  // Comments
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [commentText, setCommentText] = useState('')

  const tabs = ['ALL', 'GENERAL', 'TIPS', 'JOBS', 'LEGAL'] as const
  const filteredPosts = tab === 'ALL' ? initialPosts : initialPosts.filter(p => p.category === tab)

  function handlePost() {
    setMessage(null)
    const formData = new FormData()
    formData.set('title', title)
    formData.set('content', content)
    formData.set('category', category)

    startTransition(async () => {
      const result = await createForumPost(formData)
      if (result.error) {
        setMessage(result.error)
      } else {
        setDialogOpen(false)
        setTitle('')
        setContent('')
        window.location.reload()
      }
    })
  }

  function handleLoadComments(postId: string) {
    if (expandedPost === postId) {
      setExpandedPost(null)
      return
    }
    setExpandedPost(postId)
    startTransition(async () => {
      const result = await getForumComments(postId)
      setComments(prev => ({ ...prev, [postId]: result }))
    })
  }

  function handleComment(postId: string) {
    if (!commentText.trim()) return
    startTransition(async () => {
      const result = await createForumComment(postId, commentText.trim())
      if (!result.error) {
        setCommentText('')
        const updated = await getForumComments(postId)
        setComments(prev => ({ ...prev, [postId]: updated }))
      }
    })
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forum</h1>
          <p className="text-sm text-muted-foreground">Discuții, sfaturi și anunțuri pentru comunitate</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={
            <Button className="shadow-lg shadow-primary/20">＋ Postare nouă</Button>
          } />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Postare nouă</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Titlu</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titlul postării..." />
              </div>
              <div className="grid gap-2">
                <Label>Categorie</Label>
                <Select value={category} onValueChange={(val) => setCategory(val ?? 'GENERAL')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Conținut</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Scrie conținutul postării..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Anulare</Button>
              <Button onClick={handlePost} disabled={isPending || !title.trim()}>
                {isPending ? 'Se publică...' : 'Publică'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <div className="text-sm px-4 py-2 rounded-lg bg-red-500/10 text-red-400">{message}</div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} size="sm" onClick={() => setTab(t)} className="shrink-0">
            {t === 'ALL' ? `Toate (${initialPosts.length})` : `${categoryLabels[t as ForumCategory]} (${initialPosts.filter(p => p.category === t).length})`}
          </Button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {initialPosts.length === 0
              ? 'Nu există postări încă. Fii primul care postează!'
              : 'Nicio postare în această categorie.'}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="border-border/50 transition-all hover:border-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">
                        {(post.author_name || '?').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{post.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {post.author_name} · {timeAgo(post.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[post.category as ForumCategory] || post.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-3 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => handleLoadComments(post.id)}>
                    💬 {post.comment_count || 0} comentarii
                  </Button>
                </div>

                {/* Comments section */}
                {expandedPost === post.id && (
                  <div className="border-t pt-3 space-y-3">
                    {(comments[post.id] || []).map((c: any) => (
                      <div key={c.id} className="flex gap-2 text-sm">
                        <Avatar className="h-6 w-6 mt-0.5">
                          <AvatarFallback className="text-[10px]">
                            {(c.author_name || '?')[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-xs">{c.author_name}</span>
                          <span className="text-muted-foreground text-xs ml-2">{timeAgo(c.created_at)}</span>
                          <p className="text-sm">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Scrie un comentariu..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                        className="text-sm"
                      />
                      <Button size="sm" onClick={() => handleComment(post.id)} disabled={isPending}>
                        Trimite
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
